# Lightweight Device Tree Generator

This repository contains a simple **Lightweight Device Tree (LWDT)** generator written in Python, along with a simple C test harness.

## Components

- `lwdt2h.py`: Generates a C header (`lwdt_generated.h`) from a lightweight HOCON-based device tree (`.lwdt`).
- `dt/board.lwdt`: Example root device tree.
- `dt/soc/esp32/esp32.lwdt`: Example included device tree fragment.
- `include/lwdt.h`: Helper macros for consuming generated DT macros.
- `demo/demo_dt.c`: A small C program that reads values from the generated device tree header.
- `build.ninja`: A Ninja build file to generate headers, compile the test program, and run it by default.

## Quick Start

### 1) Generate device tree header, build the test binary, and run it

```sh
ninja -f build.ninja
```

If you want to run the binary manually:

- Linux / macOS: `./build/demo_dt`
- Windows: `./build/demo_dt.exe`

### 2) Run the Python regression tests

```sh
python -m pytest
```

The test suite covers header generation, node-reference resolution, strict-mode failures, and compatibility aliases for phandle macros.

## Adding / Editing Device Trees

- Update `dt/board.lwdt` (or create additional `.lwdt` files under `dt/`).
- Run `python lwdt2h.py -o build/lwdt_generated.h dt/board.lwdt` to regenerate the header.

### Include Semantics

- `include "path/file.lwdt"` resolves relative to the file that contains the include.
- `include <path/file.lwdt>` resolves relative to `--basedir`.
- When using angle-bracket includes, pass a base directory such as `python lwdt2h.py --basedir dt -o build/lwdt_generated.h dt/board.lwdt`.

## Notes

- The generator outputs flat macros such as `LWDT_NS_soc_S_i2c0_P_reg_IDX_0`.
- It supports node/label references (phandles) and basic Zephyr-like macros (`_COMPATIBLE`, `_STATUS`, `_REG`).
