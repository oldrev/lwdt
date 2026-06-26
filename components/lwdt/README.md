# LWDT Component

This component bundles the lightweight Jsonnet device tree generator and the `drvfx` driver framework for ESP-IDF.

## What is included

- `lwdt2h.py`: Jsonnet-to-header generator.
- `include/lwdt/`: public helper macros.
- `include/drvfx/`: driver framework headers.
- `drivers/` and `kernel/`: framework implementation and bus/peripheral drivers.
- `dt/`: base Jsonnet fragments consumed by application board files.

## Implemented drivers

- I2C master bus: ESP-IDF I2C implementation exposed through `drvfx_i2c_*`.
- SPI master bus: ESP-IDF SPI implementation exposed through `drvfx_spi_*`.
- RTC: ESP-IDF software RTC, DS1302, and PCF8563 implementations exposed through `rtc_*`.

## Initialization priorities

`drvfx` uses Zephyr-style initialization levels and 0-99 priorities. Bus
controllers should use `PRE_KERNEL_2` with `DRVFX_INIT_PRE_KERNEL_2_BUS_PRIORITY`.
Normal external devices should use `POST_KERNEL` with
`DRVFX_INIT_POST_KERNEL_DEVICE_PRIORITY`, and should declare dependencies with the
`*_WITH_DEPS` macros when they require another device.

## Build flow

`components/lwdt/CMakeLists.txt` exposes a `lwdt_generate` target. It invokes `lwdt2h.py` and writes `lwdt_generated.h` into the consuming component's build directory.

ESP-IDF applications must set `LWDT_BOARD_ID`. The component resolves it to `PROJECT_DIR/boards/<vendor>/<model>/board.lwdt` and generates headers from that file.