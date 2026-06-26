import argparse
import datetime
import json
import os
import re
import sys
try:
    import _jsonnet
except ImportError:  # pragma: no cover - exercised when dependency is absent
    _jsonnet = None

COPYRIGHT = "Copyright (c) 2026 XXX"

def to_c_ident(s):
    """Convert a Jsonnet path to a C macro identifier."""
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


def _is_explicit_ref_string(val):
    """Detect string forms that are clearly intended to be node references."""
    return isinstance(val, str) and (
        val.startswith('#')
        or val.startswith('/')
        or val.startswith('./')
        or val.startswith('../')
        or '/' in val
    )


def _is_child_node_dict(obj):
    """Heuristically distinguish child nodes from flat dict properties."""
    if not isinstance(obj, dict) or _is_phandle_spec(obj):
        return False

    node_keys = {'compatible', 'status', 'reg', 'label'}
    if any(key in obj for key in node_keys):
        return True

    return any(isinstance(value, dict) for value in obj.values())


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


def _jsonnet_import_callback(include_base_dir: str | None = None):
    """Resolve Jsonnet imports relative to the importer, then --basedir."""

    def callback(base: str, rel: str):
        candidates = []
        if os.path.isabs(rel):
            candidates.append(os.path.normpath(rel))
        if base:
            base_dir = base if os.path.isdir(base) else os.path.dirname(base)
            candidates.append(os.path.normpath(os.path.join(base_dir, rel)))
        if include_base_dir:
            candidates.append(os.path.normpath(os.path.join(include_base_dir, rel)))

        for path in candidates:
            if os.path.exists(path):
                with open(path, 'rb') as f:
                    return path, f.read()

        searched = ', '.join(candidates) if candidates else rel
        raise RuntimeError(f"could not import '{rel}' (searched: {searched})")

    return callback


def _jsonnet_import_expr(file_path: str) -> str:
    """Return a Jsonnet import expression for a host path."""
    normalized = os.path.abspath(file_path).replace(os.sep, "/")
    return f"(import {json.dumps(normalized)})"


def parse_lwdt_jsonnet(
    file_path: str,
    include_base_dir: str | None = None,
    overlays: list[str] | None = None,
):
    """Evaluate a Jsonnet-backed .lwdt file and return plain Python data."""
    if _jsonnet is None:
        raise RuntimeError(
            "Jsonnet support requires the Python jsonnet package. "
            "Install it with: python -m pip install jsonnet"
        )

    import_callback = _jsonnet_import_callback(include_base_dir)
    overlays = overlays or []
    if overlays:
        snippet = " + ".join(
            [_jsonnet_import_expr(file_path)]
            + [_jsonnet_import_expr(overlay) for overlay in overlays]
        )
        json_text = _jsonnet.evaluate_snippet(
            "lwdt-composed.jsonnet",
            snippet,
            import_callback=import_callback,
        )
    else:
        json_text = _jsonnet.evaluate_file(
            file_path,
            import_callback=import_callback,
        )
    return json.loads(json_text)


class Lwdt:
    def __init__(self, config, prefix="DT"):
        self.config = config
        self.prefix = prefix
        self.registry = {}  # raw_path -> node_info
        self.name_map = {}  # node name -> list of raw_paths
        self.label_map = {}  # label -> raw_path
        self.compat_counters = {}  # normalized compat -> instance count
        self.compat_instances = {}  # normalized compat -> list of inst macro names
        self.inst_for_node = {}  # node_id -> inst macro name
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
        self.errors = []
        self.warnings = []

        def emit_alias(name):
            lines.append(f"#define {name[:-8]}_PH {name}") if name.endswith('_PHANDLE') else None

        def emit_reference_macros(node_id, macro_base, ref, raw_path, label_norm=None, explicit=False):
            """Emit macros for a node reference while preserving the original scalar value."""
            target = self._resolve_node(ref, current_raw=raw_path)
            if not target:
                if strict and explicit:
                    self.errors.append(
                        f"Unresolved node reference '{ref}' at {raw_path} ({macro_base})"
                    )
                return False

            lines.append(f"#define {macro_base}_NODE {target['node_id']}")
            lines.append(f"#define {macro_base}_PHANDLE {target['node_id']}")
            emit_alias(f"{macro_base}_PHANDLE")
            if label_norm:
                suffix = f"{macro_base}_NODE"[len(node_id):]
                lines.append(f"#define LWDT_NODELABEL_{label_norm}{suffix} {macro_base}_NODE")
                suffix = f"{macro_base}_PHANDLE"[len(node_id):]
                lines.append(f"#define LWDT_NODELABEL_{label_norm}{suffix} {macro_base}_PHANDLE")
                lines.append(f"#define LWDT_NODELABEL_{label_norm}{suffix[:-8]}_PH {macro_base}_PHANDLE")

            inst_macro = self.inst_for_node.get(node_id)
            if inst_macro:
                suffix = f"{macro_base}_NODE"[len(node_id):]
                lines.append(f"#define {inst_macro}{suffix} {macro_base}_NODE")
                suffix = f"{macro_base}_PHANDLE"[len(node_id):]
                lines.append(f"#define {inst_macro}{suffix} {macro_base}_PHANDLE")
                lines.append(f"#define {inst_macro}{suffix[:-8]}_PH {macro_base}_PHANDLE")

            if 'reg' in target['data'] and len(target['data']['reg']) > 0:
                addr = safe_int(target['data']['reg'][0])
                if addr is not None:
                    lines.append(f"#define {macro_base}_VAL_ADDR {hex(addr)}")
                    if label_norm:
                        suffix = f"{macro_base}_VAL_ADDR"[len(node_id):]
                        lines.append(f"#define LWDT_NODELABEL_{label_norm}{suffix} {macro_base}_VAL_ADDR")
                    if inst_macro:
                        suffix = f"{macro_base}_VAL_ADDR"[len(node_id):]
                        lines.append(f"#define {inst_macro}{suffix} {macro_base}_VAL_ADDR")

            return True

        def emit_value(node_id, macro_base, value, raw_path, label_norm=None):
            """Emit macros for a value that may be scalar, list, dict, or phandle."""

            def emit_alias(name):
                if label_norm:
                    # Create a label-based alias (DT_NODELABEL style)
                    alias = f"LWDT_NODELABEL_{label_norm}{name[len(node_id):]}"
                    lines.append(f"#define {alias} {name}")
                # Create a DT_INST-like alias (instance + compat).
                inst_macro = self.inst_for_node.get(node_id)
                if inst_macro:
                    alias = f"{inst_macro}{name[len(node_id):]}"
                    lines.append(f"#define {alias} {name}")

            lines.append(f"#define {macro_base}_EXISTS 1")
            emit_alias(f"{macro_base}_EXISTS")

            if isinstance(value, list):
                for i, item in enumerate(value):
                    emit_value(node_id, f"{macro_base}_IDX_{i}", item, raw_path, label_norm)
                lines.append(f"#define {macro_base}_LEN {len(value)}")
                emit_alias(f"{macro_base}_LEN")
                return True

            if _is_phandle_spec(value):
                ph = value.get('node') or value.get('phandle')
                if isinstance(ph, str):
                    emit_reference_macros(
                        node_id,
                        macro_base,
                        ph,
                        raw_path,
                        label_norm=label_norm,
                        explicit=True,
                    )

                pin = safe_int(value.get('pin', None))
                if pin is not None:
                    lines.append(f"#define {macro_base}_PIN {pin}")
                    emit_alias(f"{macro_base}_PIN")
                flags = safe_int(value.get('flags', None))
                if flags is not None:
                    lines.append(f"#define {macro_base}_FLAGS {flags}")
                    emit_alias(f"{macro_base}_FLAGS")
                return True

            if isinstance(value, dict):
                # Flatten dict values into separate macros so output stays flat.
                for subk, subv in value.items():
                    sub_id = to_c_ident(subk)
                    emit_value(node_id, f"{macro_base}_{sub_id}", subv, raw_path, label_norm)
                return True

            # Scalar (including nested bool/int/str)
            lines.append(f"#define {macro_base} {_format_value(value)}")
            emit_alias(f"{macro_base}")
            if isinstance(value, str):
                emit_reference_macros(
                    node_id,
                    macro_base,
                    value,
                    raw_path,
                    label_norm=label_norm,
                    explicit=_is_explicit_ref_string(value),
                )
            return True

        def traverse(obj, path="", node_id="", raw_path="/"):
            if not isinstance(obj, dict):
                return

            node_id = node_id or self.registry.get(raw_path, {}).get('node_id', '')
            lines.append(f"\n/* Node: {node_id} */")
            lines.append(f"#define {node_id}_EXISTS 1")

            # Track label (if any) so we can emit label-based aliases (DT_NODELABEL style).
            label = obj.get('label', None)
            label_norm = None
            if isinstance(label, str):
                label_norm = to_c_ident(label)
                lines.append(f"#define {node_id}_LABEL \"{label}\"")
                lines.append(f"#define LWDT_NODELABEL_{label_norm} {node_id}")

            # Zephyr-style helpers
            compat = obj.get('compatible', None)
            if isinstance(compat, str):
                lines.append(f"#define {node_id}_COMPATIBLE \"{compat}\"")
                # Create a per-compatible instance macro (DT_INST-like)
                compat_norm = to_c_ident(compat)
                inst = self.compat_counters.get(compat_norm, 0)
                inst_macro = f"{self.prefix}_NS_INST_{inst}_{compat_norm}"
                lines.append(f"#define {inst_macro} {node_id}")
                self.compat_counters[compat_norm] = inst + 1
                self.inst_for_node[node_id] = inst_macro
                self.compat_instances.setdefault(compat_norm, []).append(inst_macro)
            elif isinstance(compat, list) and compat:
                # take first compatible entry if list
                first = compat[0]
                if isinstance(first, str):
                    lines.append(f"#define {node_id}_COMPATIBLE \"{first}\"")
                    compat_norm = to_c_ident(first)
                    inst = self.compat_counters.get(compat_norm, 0)
                    inst_macro = f"{self.prefix}_NS_INST_{inst}_{compat_norm}"
                    lines.append(f"#define {inst_macro} {node_id}")
                    self.compat_counters[compat_norm] = inst + 1
                    self.inst_for_node[node_id] = inst_macro

            status = obj.get('status', None)
            if isinstance(status, str):
                lines.append(f"#define {node_id}_STATUS \"{status}\"")
                enabled = 1 if status in ("okay", "ok", "enabled", "true") else 0
                lines.append(f"#define {node_id}_ENABLED {enabled}")
                # Also expose `enabled` as a property macro for consistent access patterns.
                emit_value(node_id, f"{node_id}_P_enabled", enabled, raw_path, label_norm)

            # Expose the first reg entry as a canonical address macro (common in DT)
            if 'reg' in obj and isinstance(obj['reg'], list) and obj['reg']:
                addr = safe_int(obj['reg'][0])
                if addr is not None:
                    lines.append(f"#define {node_id}_REG {hex(addr)}")
                    lines.append(f"#define {node_id}_REG_ADDR {hex(addr)}")

            for k, v in obj.items():
                if k == 'label':
                    continue  # label is not emitted as a property

                prop_id = to_c_ident(k)
                macro_name = f"{node_id}_P_{prop_id}"

                if _is_child_node_dict(v):
                    # Treat node-like dicts as child nodes; flatten other dicts into property macros.
                    child_path = f"{path}_S_{k}" if path else f"_S_{k}"
                    child_node_id = f"{self.prefix}_N{to_c_ident(child_path)}"
                    traverse(v, child_path, child_node_id, raw_path=f"{raw_path}/{k}" if raw_path != '/' else f"/{k}")
                else:
                    emit_value(node_id, macro_name, v, raw_path, label_norm)

        traverse(self.config)

        # Generate DT_INST_FOREACH_<compat> macros for each compatible.
        # Each macro calls the provided macro with (inst, node_id).
        for compat_norm, insts in self.compat_instances.items():
            lines.append(f"\n/* DT_INST_FOREACH for compat: {compat_norm} */")
            calls = " ".join(f"macro({i}, {inst});" for i, inst in enumerate(insts))
            lines.append(f"#define DT_INST_FOREACH_{compat_norm}(macro) do {{ {calls} }} while (0)")

        return lines

def main():
    parser = argparse.ArgumentParser(
        description="Generate a C header from a lightweight Jsonnet-based device tree.",
        epilog=f"{COPYRIGHT}",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("input", help="Jsonnet file (.lwdt or .jsonnet)")
    parser.add_argument("-o", "--output", default="lwdt_generated.h", help="Output header file")
    parser.add_argument("--prefix", default="LWDT", help="Macro prefix to use for generated symbols")
    parser.add_argument(
        "--basedir",
        default=None,
        help="Additional base directory for Jsonnet import resolution",
    )
    parser.add_argument(
        "--overlay",
        action="append",
        default=[],
        help="Overlay file applied after the base input. Can be passed more than once.",
    )
    parser.add_argument("--check", action="store_true", help="Only validate the device tree, do not write output")
    parser.add_argument("--strict", action="store_true", help="Treat unresolved references as errors and exit non-zero")
    parser.add_argument("-v", "--version", action="version", version=f"lwdt2h 1.0 ({COPYRIGHT})")
    args = parser.parse_args()

    if not os.path.exists(args.input):
        print(f"Error: File {args.input} not found.")
        sys.exit(1)

    input_file = os.path.abspath(args.input)
    base_dir = os.path.abspath(args.basedir) if args.basedir else None
    overlays = [os.path.abspath(path) for path in args.overlay]
    for overlay in overlays:
        if not os.path.exists(overlay):
            print(f"Error: Overlay file {overlay} not found.", file=sys.stderr)
            sys.exit(1)

    try:
        conf = parse_lwdt_jsonnet(
            input_file,
            include_base_dir=base_dir if args.basedir else None,
            overlays=overlays,
        )
    except (OSError, ValueError, RuntimeError) as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
    
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