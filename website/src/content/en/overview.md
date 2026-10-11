# Overview & Background

LWDT (Lightweight Device Tree) is a build-time device-tree compiler and compact driver runtime for ESP-IDF. It stores GPIO assignments, bus parameters, peripheral addresses, and board identifiers in `board.lwdt`, then generates `lwdt_generated.h` for C drivers to consume at compile time.

## Use Cases

- One application supports several ESP32 development boards or custom hardware variants.
- Sensor, I2C/SPI, and GPIO configuration differs per board.
- Drivers require ordered initialization based on hardware dependencies.
- The project keeps native ESP-IDF Wi-Fi, BLE, Mesh, CMake, and `idf.py` workflows.

## Components

| Component | Responsibility |
| --- | --- |
| `board.lwdt` | Jsonnet description of board nodes and properties. |
| LWDT generator | Converts Jsonnet into C macros during the build. |
| `lwdt_generated.h` | Exposes node, property, label, and compatible-instance macros. |
| `drvfx` | Provides static devices, init levels, priorities, and device lookup APIs. |

## ESP-IDF Integration Boundary

LWDT is included as a standard ESP-IDF component. `IDF_TARGET` is selected from the board's `board.cmake`; FreeRTOS, network stacks, component management, and flashing tooling retain their normal ESP-IDF behavior.

Device-tree sources are consumed during configuration. Firmware images contain only generated constants and static device objects: no Jsonnet parser and no runtime dynamic allocation are required.

## Key Terms

### Device-tree node

A node describes hardware such as `soc.i2c0`, `rtc0`, or the board-level `board` node. Properties hold fixed hardware facts such as GPIOs, bus clock rate, and I2C addresses.

### compatible

The `compatible` property associates a node with a driver. `"esp32,i2c"` is matched by the I2C driver; `"nxp,pcf8563"` is matched by the PCF8563 RTC driver.

### Overlay

Overlays merge after the base `board.lwdt` using Jsonnet `+` semantics. They are useful for board revisions, project-specific GPIO changes, or additional external devices.

### drvfx init levels

drvfx provides `EARLY`, `PRE_KERNEL_1`, `PRE_KERNEL_2`, `POST_KERNEL`, and `APPLICATION`. Entries inside one level execute in ascending 0–99 priority order.