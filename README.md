# Lightweight Device Tree Generator

This repository contains a simple **Lightweight Device Tree (LWDT)** generator written in Python, along with a simple C test harness.

## Components

- `lwdt2h.py`: Generates a C header (`devicetree_generated.h`) from a lightweight HOCON-based device tree (`.lwdt`).
- `dt/board.lwdt`: Example root device tree.
- `dt/soc/esp32/esp32.lwdt`: Example included device tree fragment.
- `include/lwdt.h`: Helper macros for consuming generated DT macros.
- `include/demo_dt.c`: A small C program that reads values from the generated device tree header.
- `build.ninja`: A Ninja build file to generate headers and compile the test program.

## Quick Start

### 1) Generate device tree header + build test binary

```sh
ninja -f build.ninja
```

### 2) Run the test program

```sh
./build/test_dt.exe
```

## Adding / Editing Device Trees

- Update `dt/board.lwdt` (or create additional `.lwdt` files under `dt/`).
- Run `python lwdt2h.py -o build/devicetree_generated.h dt/board.lwdt` to regenerate the header.

## Notes

- The generator outputs flat macros such as `LWDT_NS_soc_S_i2c0_P_reg_IDX_0`.
- It supports node/label references (phandles) and basic Zephyr-like macros (`_COMPATIBLE`, `_STATUS`, `_REG`).
