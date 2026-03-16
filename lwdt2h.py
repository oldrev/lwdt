import argparse
import datetime
import json
import os
import re
import sys
import tempfile
from pyhocon import ConfigFactory

COPYRIGHT = "Copyright (c) 2026 XXX"

def to_c_ident(s):
    """Convert a HOCON path to a C macro identifier."""
    return re.sub(r'[./@,\-]', '_', s).strip('_')

def safe_int(val):
    """Safely convert a string (hex or decimal) or int to an integer.

    Returns None if conversion fails.
    """
    if isinstance(val, int):
        return val
    if isinstance(val, str):
        try:
            return int(val, 16) if val.startswith('0x') else int(val)
        except ValueError:
            return None
    return None

def _is_phandle_spec(obj):
    """Detect dict forms like { node: "gpio0", pin: 15, flags: 1 }."""
    return isinstance(obj, dict) and ('node' in obj or 'phandle' in obj)


def _format_value(val):
    """Format a scalar value for C macro output."""
    if isinstance(val, bool):
        return '1' if val else '0'
    if val is None:
        return '0'
    if isinstance(val, int):
        return str(val)
    if isinstance(val, str):
        return f'"{val}"'
    # fallback for other scalars
    return f'"{val}"'


def _resolve_includes(file_path: str, seen=None):
    """Resolve include paths in a .lwdt file to absolute paths.

    Includes are resolved relative to the including file's directory (C-style).
    This function returns the file content with include paths rewritten to absolute
    paths so that pyhocon can load them correctly regardless of working dir.
    """
    if seen is None:
        seen = set()

    file_path = os.path.abspath(file_path)
    if file_path in seen:
        return ''
    seen.add(file_path)

    base_dir = os.path.dirname(file_path)
    out_lines = []

    include_re = re.compile(r'^\s*include\s+"([^"]+)"')
    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            m = include_re.match(line)
            if m:
                rel = m.group(1)
                inc_path = os.path.normpath(os.path.join(base_dir, rel))
                # Recursively resolve includes in the included file first
                _ = _resolve_includes(inc_path, seen=seen)
                out_lines.append(f'include "{inc_path}"\n')
            else:
                out_lines.append(line)

    return ''.join(out_lines)


class Lwdt:
    def __init__(self, config, prefix="DT"):
        self.config = config
        self.prefix = prefix
        self.registry = {}  # raw_path -> node_info
        self.name_map = {}  # node name -> list of raw_paths
        self.label_map = {}  # label -> raw_path
        self.errors = []
        self.warnings = []
        self._build_indexes(config)

    def _normalize_raw_path(self, raw_path: str) -> str:
        """Normalize a raw path like '/a//b/..' to '/a/b'."""
        if not raw_path:
            return "/"
        parts = []
        for part in raw_path.split('/'):
            if part == '' or part == '.':
                continue
            if part == '..':
                if parts:
                    parts.pop()
                continue
            parts.append(part)
        return '/' + '/'.join(parts)

    def _register_node(self, raw_path: str, node_id: str, data: dict):
        raw_path = self._normalize_raw_path(raw_path)
        self.registry[raw_path] = {"node_id": node_id, "data": data}

        name = raw_path.rsplit('/', 1)[-1] if raw_path != '/' else 'root'
        self.name_map.setdefault(name, []).append(raw_path)

        label = data.get('label', None)
        if isinstance(label, str):
            self.label_map[label] = raw_path

    def _build_indexes(self, obj, path="", raw_path="/"):
        """First pass: build global indexes."""
        if not isinstance(obj, dict):
            return

        node_id = f"{self.prefix}_N{to_c_ident(path)}" if path else f"{self.prefix}_N_ROOT"
        self._register_node(raw_path, node_id, obj)

        for k, v in obj.items():
            if isinstance(v, dict):
                new_path = f"{path}_S_{k}" if path else f"_S_{k}"
                new_raw = f"{raw_path}/{k}" if raw_path != "/" else f"/{k}"
                self._build_indexes(v, new_path, new_raw)

    def _resolve_node(self, ref: str, current_raw: str = '/'):
        """Resolve a phandle reference using path scoping rules."""
        if not isinstance(ref, str):
            return None

        # Allow references like "#/soc/gpio0" or "/soc/gpio0".
        r = ref[1:] if ref.startswith('#') else ref
        if r.startswith('/'):
            return self.registry.get(self._normalize_raw_path(r))

        # Relative path support (e.g. "soc/gpio0" or "../gpio0")
        if '/' in r:
            candidate = self._normalize_raw_path(f"{current_raw.rstrip('/')}/{r}")
            if candidate in self.registry:
                return self.registry[candidate]

        # Lexical lookup: try from current node up to root
        cur = current_raw
        while True:
            cand = self._normalize_raw_path(f"{cur.rstrip('/')}/{r}")
            if cand in self.registry:
                return self.registry[cand]
            if cur in ('', '/'):
                break
            cur = cur.rsplit('/', 1)[0] or '/'

        # Label fallback
        if r in self.label_map:
            lp = self.label_map[r]
            return self.registry.get(lp)

        # If unambiguous, resolve by name
        if r in self.name_map and len(self.name_map[r]) == 1:
            return self.registry.get(self.name_map[r][0])

        # Not found
        return None

    def _format_dict_as_json_string(self, d: dict):
        """Serialize a dict into a C string literal containing JSON."""
        json_text = json.dumps(d, sort_keys=True, separators=(',', ':'))
        return json.dumps(json_text)

    def generate_macros(self, strict=False):
        """Second pass: generate C macro definitions from the device tree."""
        lines = []

        def emit_value(macro_base, value, raw_path):
            """Emit macros for a value that may be scalar, list, dict, or phandle."""
            if isinstance(value, list):
                for i, item in enumerate(value):
                    emit_value(f"{macro_base}_IDX_{i}", item, raw_path)
                lines.append(f"#define {macro_base}_LEN {len(value)}")
                return True

            if _is_phandle_spec(value):
                ph = value.get('node') or value.get('phandle')
                if isinstance(ph, str):
                    target = self._resolve_node(ph, current_raw=raw_path)
                    if target:
                        lines.append(f"#define {macro_base}_NODE {target['node_id']}")
                        lines.append(f"#define {macro_base}_PHANDLE {target['node_id']}")
                        if 'reg' in target['data'] and len(target['data']['reg']) > 0:
                            addr = safe_int(target['data']['reg'][0])
                            if addr is not None:
                                lines.append(f"#define {macro_base}_VAL_ADDR {hex(addr)}")
                    else:
                        msg = f"Unresolved phandle '{ph}' referenced from {raw_path}"
                        self.errors.append(msg)
                        if strict:
                            raise ValueError(msg)

                pin = safe_int(value.get('pin', None))
                if pin is not None:
                    lines.append(f"#define {macro_base}_PIN {pin}")
                flags = safe_int(value.get('flags', None))
                if flags is not None:
                    lines.append(f"#define {macro_base}_FLAGS {flags}")
                return True

            if isinstance(value, dict):
                # Flatten dict values into separate macros so output stays flat.
                for subk, subv in value.items():
                    sub_id = to_c_ident(subk)
                    emit_value(f"{macro_base}_{sub_id}", subv, raw_path)
                return True

            # Scalar (including nested bool/int/str)
            lines.append(f"#define {macro_base} {_format_value(value)}")
            return True

        def traverse(obj, path="", node_id="", raw_path="/"):
            if not isinstance(obj, dict):
                return

            node_id = node_id or self.registry.get(raw_path, {}).get('node_id', '')
            lines.append(f"\n/* Node: {node_id} */")
            lines.append(f"#define {node_id}_EXISTS 1")

            # Zephyr-style helpers
            compat = obj.get('compatible', None)
            if isinstance(compat, str):
                lines.append(f"#define {node_id}_COMPATIBLE \"{compat}\"")
            elif isinstance(compat, list) and compat:
                # take first compatible entry if list
                first = compat[0]
                if isinstance(first, str):
                    lines.append(f"#define {node_id}_COMPATIBLE \"{first}\"")

            status = obj.get('status', None)
            if isinstance(status, str):
                lines.append(f"#define {node_id}_STATUS \"{status}\"")
                enabled = 1 if status in ("okay", "ok", "enabled", "true") else 0
                lines.append(f"#define {node_id}_ENABLED {enabled}")

            # Expose the first reg entry as a canonical address macro (common in DT)
            if 'reg' in obj and isinstance(obj['reg'], list) and obj['reg']:
                addr = safe_int(obj['reg'][0])
                if addr is not None:
                    lines.append(f"#define {node_id}_REG {hex(addr)}")
                    lines.append(f"#define {node_id}_REG_ADDR {hex(addr)}")

            label = obj.get('label', None)
            if isinstance(label, str):
                lines.append(f"#define {node_id}_LABEL \"{label}\"")

            for k, v in obj.items():
                if k == 'label':
                    continue  # label is not emitted as a property

                prop_id = to_c_ident(k)
                macro_name = f"{node_id}_P_{prop_id}"

                if isinstance(v, dict) and not _is_phandle_spec(v):
                    # Decide if this dict is a child node (has nested dicts) or a property
                    if any(isinstance(x, dict) for x in v.values()):
                        child_path = f"{path}_S_{k}" if path else f"_S_{k}"
                        child_node_id = f"{self.prefix}_N{to_c_ident(child_path)}"
                        traverse(v, child_path, child_node_id, raw_path=f"{raw_path}/{k}" if raw_path != '/' else f"/{k}")
                    else:
                        # Dict is treated as a property value
                        emit_value(macro_name, v, raw_path)
                else:
                    emit_value(macro_name, v, raw_path)

        traverse(self.config)
        return lines

def main():
    parser = argparse.ArgumentParser(
        description="Generate a C header from a lightweight HOCON-based device tree.",
        epilog=f"{COPYRIGHT}",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("input", help="HOCON file (.conf or .lwdt)")
    parser.add_argument("-o", "--output", default="devicetree_generated.h", help="Output header file")
    parser.add_argument("--prefix", default="LWDT", help="Macro prefix to use for generated symbols")
    parser.add_argument("--basedir", default=None, help="Base directory for resolving includes in the .lwdt file")
    parser.add_argument("--check", action="store_true", help="Only validate the device tree, do not write output")
    parser.add_argument("--strict", action="store_true", help="Treat unresolved references as errors and exit non-zero")
    parser.add_argument("-v", "--version", action="version", version=f"lwdt2h 1.0 ({COPYRIGHT})")
    args = parser.parse_args()

    if not os.path.exists(args.input):
        print(f"Error: File {args.input} not found.")
        sys.exit(1)

    # Load HOCON, resolving includes relative to each file (C-style include semantics)
    if args.basedir:
        base_dir = os.path.abspath(args.basedir)
        input_file = os.path.join(base_dir, args.input) if not os.path.isabs(args.input) else args.input
    else:
        input_file = os.path.abspath(args.input)

    # Pre-resolve include paths to absolute paths so pyhocon can load nested includes correctly.
    resolved = _resolve_includes(input_file)
    with tempfile.NamedTemporaryFile(mode='w', suffix='.lwdt', delete=False, encoding='utf-8') as tmp:
        tmp.write(resolved)
        tmp_path = tmp.name

    try:
        conf = ConfigFactory.parse_file(tmp_path)
    finally:
        try:
            os.remove(tmp_path)
        except OSError:
            pass
    
    # Run engine
    engine = Lwdt(conf, prefix=args.prefix)
    try:
        macros = engine.generate_macros(strict=args.strict)
    except ValueError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

    if engine.errors:
        for e in engine.errors:
            print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

    if args.check:
        print("Device tree validation passed.")
        sys.exit(0)

    # Write output (UTC timestamp)
    now = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    with open(args.output, "w", encoding="utf-8") as f:
        f.write("/* Auto-generated Light-weight Device Tree Hardware Header */\n")
        f.write(f"/* {COPYRIGHT} */\n")
        f.write(f"/* Generated: {now} UTC */\n")
        f.write("/* DO NOT EDIT - generated by lwdt2h.py */\n")
        f.write(f"#pragma once\n")
        f.write("\n".join(macros))

    print(f"Successfully generated {args.output}")

if __name__ == "__main__":
    main()