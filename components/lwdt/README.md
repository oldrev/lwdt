# LWDT Component

This component bundles the lightweight Jsonnet device tree generator and the `drvfx` driver framework for ESP-IDF.

## What is included

- `lwdt2h.py`: Jsonnet-to-header generator.
- `include/lwdt/`: public helper macros.
- `include/drvfx/`: driver framework headers.
- `drivers/` and `kernel/`: framework implementation and bus/peripheral drivers.
- `dt/`: base Jsonnet fragments consumed by application board files.

## Build flow

`components/lwdt/CMakeLists.txt` exposes a `lwdt_generate` target. It invokes `lwdt2h.py` and writes `lwdt_generated.h` into the consuming component's build directory.

ESP-IDF applications must set `LWDT_BOARD_ID`. The component resolves it to `PROJECT_DIR/boards/<vendor>/<model>/board.lwdt` and generates headers from that file.