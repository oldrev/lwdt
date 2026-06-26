# LWDT: A lightweight device-tree and driver framework solution for ESP-IDF

[![ESP-IDF Build](https://github.com/oldrev/lwdt/actions/workflows/esp-idf-build.yml/badge.svg)](https://github.com/oldrev/lwdt/actions/workflows/esp-idf-build.yml)
[![ESP-IDF](https://img.shields.io/badge/ESP--IDF-6.0.1-E7352C)](https://github.com/espressif/esp-idf)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![Language](https://img.shields.io/badge/language-C%20%7C%20Python%20%7C%20CMake-555555)](.)

English | [简中](README.zh-cn.md)

LWDT is inspired by Zephyr RTOS, especially its decoupled driver model,
device-tree based hardware description, board IDs, and priority-sorted device
initialization. The reason it does not simply use Zephyr is pragmatic: many ESP32
products still need Espressif's battle-tested native ESP-IDF ecosystem, including
BLE provisioning, Wi-Fi, mesh networking, vendor examples, tooling, and silicon-day-one
support.

The pain LWDT addresses is the way traditional ESP-IDF projects tend to drift into
`#ifdef` branches, hardcoded GPIO tables, and duplicated driver glue when supporting
multiple hardware variants or reusing custom drivers across boards.

The solution is a lightweight Python/Jsonnet pipeline that turns `board.lwdt` into
Zephyr-like generated C access macros, plus a small `drvfx` runtime that provides
priority-sorted initialization entries and static device objects fully inside native
ESP-IDF CMake. The result is board-selectable, reusable hardware abstraction with
zero runtime parsing overhead and without giving up ESP-IDF.

If this project saved you time, please consider buying me a coffee. Your support helps keep this project maintained, thank you!

<p align="center">
  <a href="https://ko-fi.com/oldrev">
    <img src="https://ko-fi.com/img/githubbutton_sm.svg" alt="Buy me a coffee" width="200">
  </a>
</p>

A board ID is always written as `vendor/model`. Each board directory uses fixed
file names:

- `board.lwdt`: Jsonnet device-tree description
- `board.cmake`: board metadata, including `LWDT_BOARD_IDF_TARGET`
- `.lwdt.overlay` or `board.lwdt.overlay`: optional project overlay

## What It Does

LWDT currently provides:

- board selection through `-DLWDT_BOARD_ID=<vendor>/<model>` or `LWDT_BOARD_ID`
- automatic ESP-IDF target selection from board metadata
- built-in BSP-style board definitions under the LWDT component
- project-local board definitions that override built-in boards
- Jsonnet overlays applied after the selected base board
- generated C headers consumed by the LWDT driver framework

## Repository Layout

- `components/lwdt/`: reusable ESP-IDF component, generator, runtime framework,
  common device-tree includes, and built-in boards
- `components/lwdt/boards/<vendor>/<model>/`: built-in board BSP definitions
- `components/lwdt/dt/`: shared Jsonnet SoC and device-tree fragments
- `example/`: ESP-IDF blink example
- `example/boards/<vendor>/<model>/`: project-local board definitions or overlays
- `.github/workflows/`: CI build coverage using the ESP-IDF Docker image

## Board Resolution

When an application configures LWDT, board roots are searched in this order:

1. The project `boards/` directory
2. Additional roots from `LWDT_BOARD_ROOTS`
3. Built-in boards from `components/lwdt/boards/`

The first directory containing both `board.cmake` and `board.lwdt` wins. This means
an application can override a built-in board by creating:

```text
boards/<vendor>/<model>/board.cmake
boards/<vendor>/<model>/board.lwdt
```

A project can also keep the built-in board and only add an overlay:

```text
boards/<vendor>/<model>/.lwdt.overlay
```

Application-wide overlay is also supported:

```text
.lwdt.overlay
```

Explicit overlay files can be passed with `-DLWDT_OVERLAYS=<path1>;<path2>` or the
`LWDT_OVERLAYS` environment variable. Overlays are applied after `board.lwdt`, in
list order, using Jsonnet `+` semantics.

On Windows, use semicolon-separated lists for `LWDT_BOARD_ROOTS` and `LWDT_OVERLAYS`.
Do not use `:` because drive letters already contain colons.

## Quick Start

Set up the ESP-IDF environment, then build the example with a board ID:

```powershell
cd example
idf.py build -DLWDT_BOARD_ID=nologo/esp32-c3-supermini
```

You can also use an environment variable:

```powershell
$env:LWDT_BOARD_ID = "nologo/esp32-c3-supermini"
idf.py build
```

Flash and monitor with the usual ESP-IDF commands:

```powershell
idf.py flash monitor
```

## Built-In Boards

The component currently includes these built-in board definitions:

- `espressif/esp32-devkitc-1`
- `espressif/esp32-c3-devkitm-1`
- `nologo/esp32-c3-supermini`
- `espressif/esp32-s3-devkitc-1`

## Using LWDT In An ESP-IDF Project

Add the LWDT component directory and include its board resolver before ESP-IDF's
`project.cmake`:

```cmake
cmake_minimum_required(VERSION 3.16)

set(EXTRA_COMPONENT_DIRS "path/to/devicetree/components")
include("path/to/devicetree/components/lwdt/cmake/lwdt_board.cmake")

include($ENV{IDF_PATH}/tools/cmake/project.cmake)
project(my_app)
```

Then implement `drvfx_app_main()` instead of ESP-IDF's `app_main()`. The LWDT
runtime owns `app_main()` so it can run `APPLICATION` initializers before entering
user code.

Components that define `drvfx_app_main()` or register entries with
`DRVFX_SYS_INIT()` / `DRVFX_SUBSYS_INIT()` must be linked with `WHOLE_ARCHIVE TRUE`.
These functions are discovered through linker sections, so normal static-library
symbol extraction can otherwise discard the object files.

```c
#include "drvfx/drvfx.h"

void drvfx_app_main(void)
{
    /* user application code */
}
```

Then build with:

```powershell
idf.py build -DLWDT_BOARD_ID=<vendor>/<model>
```

## Accessing Device Tree Data

Include both the helper macros and the generated header from your component code:

```c
#include <lwdt/lwdt.h>
#include "lwdt_generated.h"
```

The generated symbols use the `LWDT_` prefix. You can access the raw generated
macros directly, but the helper macros are the preferred API.

For a board fragment like this:

```jsonnet
{
  board: {
    label: "board",
    led_gpio: 8,
    led_active_low: 1,
    led_name: "ESP32-C3 SuperMini",
  },
}
```

Read properties by node label:

```c
#define BOARD_NODE LWDT_NODELABEL(board)

#if !LWDT_NODE_EXISTS(BOARD_NODE)
#error "missing board node"
#endif

#if !LWDT_PROP_EXISTS(BOARD_NODE, led_gpio)
#error "missing board led_gpio property"
#endif

#define LED_GPIO        LWDT_PROP(BOARD_NODE, led_gpio)
#define LED_ACTIVE_LOW  LWDT_PROP(BOARD_NODE, led_active_low)
#define LED_NAME        LWDT_PROP(BOARD_NODE, led_name)
```

Equivalent direct generated macros are also available:

```c
#define LED_GPIO_DIRECT LWDT_NS_board_P_led_gpio
```

For node paths, build a node identifier and then read properties:

```c
#define I2C0_NODE LWDT_NODE2(soc, i2c0)
#define I2C0_ADDR LWDT_PROP(I2C0_NODE, reg)
```

For array properties, use the index helpers:

```c
#define FIRST_PIN  LWDT_PROP_BY_IDX(BOARD_NODE, pins, 0)
#define PIN_COUNT  LWDT_PROP_LEN(BOARD_NODE, pins)
```

For phandle-style references, use `LWDT_PROP_NODE()` or `LWDT_PROP_PHANDLE()`:

```c
#define BUS_NODE LWDT_PROP_NODE(BOARD_NODE, i2c_bus)
```

For compatible instances, use the instance helpers. Compatible strings are
normalized the same way generated C identifiers are normalized, for example
`"vendor,my-device"` becomes `vendor_my_device`:

```c
#define DEV0_NODE LWDT_INST(0, vendor_my_device)
#define DEV0_REG  LWDT_INST_PROP(0, vendor_my_device, reg)
```

To get a runtime `drvfx` device, use the DT label as the device name and pass it
to `k_device_get_binding()`:

```c
#include "drvfx/drvfx.h"
#include "lwdt/lwdt.h"
#include "lwdt_generated.h"

#define I2C0_NODE LWDT_NODELABEL(i2c0)

const struct drvfx_device* i2c0 = k_device_get_binding(LWDT_LABEL(I2C0_NODE));
if ((i2c0 == NULL) || !k_device_is_ready(i2c0)) {
    return -ENODEV;
}
```

For a phandle-style bus reference, resolve the referenced node first:

```c
#define SENSOR_NODE LWDT_NODELABEL(rtc0)
#define BUS_NODE    LWDT_PROP_NODE(SENSOR_NODE, bus)

const struct drvfx_device* bus = k_device_get_binding(LWDT_LABEL(BUS_NODE));
```

The blink example uses the same generated data from C:

```c
#define BOARD_NODE      LWDT_NODELABEL(board)
#define BLINK_GPIO      LWDT_PROP(BOARD_NODE, led_gpio)
#define LED_ACTIVE_LOW  LWDT_PROP(BOARD_NODE, led_active_low)
#define LED_BOARD_NAME  LWDT_PROP(BOARD_NODE, led_name)
```

## Adding A Board

For a project-local board:

1. Create `boards/<vendor>/<model>/` in your ESP-IDF project.
2. Add `board.lwdt` with the hardware description.
3. Add `board.cmake` and set `LWDT_BOARD_IDF_TARGET` to the ESP-IDF target.
4. Build with `-DLWDT_BOARD_ID=<vendor>/<model>`.

For a built-in board in LWDT itself, add the same directory under
`components/lwdt/boards/`.

## Implemented Drivers

LWDT currently includes the following `drvfx` drivers:

| Driver | Implementation | Device name / API | Init level | Notes |
| --- | --- | --- | --- | --- |
| I2C master bus | ESP-IDF I2C master driver | `drvfx_i2c_*` API, DT labels such as `i2c0` | `PRE_KERNEL_2 / 50` | DT-driven multi-instance via `compatible: "esp32,i2c"`. Supports attach/detach, probe, transmit, receive, and transmit-receive. |
| SPI master bus | ESP-IDF SPI master driver | `drvfx_spi_*` API, DT labels such as `spi2` | `PRE_KERNEL_2 / 50` | DT-driven multi-instance via `compatible: "esp32,spi"`. Supports acquire/release and transceive. |
| RTC | ESP-IDF software RTC | `rtc_*` API, device `idf` | `POST_KERNEL / 50` | Legacy single-instance driver using ESP-IDF system time as an RTC-like device. |
| RTC | DS1302 | `rtc_*` API, device `rtc_dev` | `POST_KERNEL / 50` | Legacy single-instance GPIO bit-banged DS1302 support. |
| RTC | PCF8563 | `rtc_*` API, DT labels such as `rtc0` | `POST_KERNEL / 50` | DT-driven multi-instance via `compatible: "nxp,pcf8563"`; depends on the referenced I2C bus. |

The public driver headers live under `components/lwdt/include/drvfx/drivers/`.
Driver source lives under `components/lwdt/drivers/`.

## Developing A Driver

A modern LWDT driver should be instantiated from device-tree nodes, not from
hardcoded `CONFIG_*0_*` wiring. The model is intentionally close to Zephyr:
each node with a matching `compatible` string gets an instance number, and the
driver expands `LWDT_INST_FOREACH_STATUS_OKAY(<compat>, <macro>)` at file scope.
Only nodes with `status: "okay"` are instantiated; missing `status` is treated as
okay.

A typical driver has four pieces:

1. A config struct for immutable hardware configuration read from `board.lwdt`.
2. A data struct for runtime state, one instance per enabled node.
3. An init function with signature `int init(const struct drvfx_device* dev)`.
4. A per-instance define macro that calls `DRVFX_DEVICE_DT_INST_DEFINE()` or `DRVFX_DEVICE_DT_INST_DEFINE_WITH_DEPS()`.

Example board data:

```jsonnet
soc+: {
  i2c0+: {
    status: "okay",
    sda_gpio: 4,
    scl_gpio: 5,
    clock_frequency: 400000,
  },

  rtc0: {
    label: "rtc0",
    compatible: "nxp,pcf8563",
    status: "okay",
    bus: "i2c0",
    reg: [81],
    timeout_ms: 1000,
  },
},
```

Example bus driver pattern:

```c
#include "drvfx/drvfx.h"
#include "lwdt/lwdt.h"
#include "lwdt_generated.h"

struct my_i2c_config {
    int port;
    int sda_gpio;
    int scl_gpio;
};

struct my_i2c_data {
    void* handle;
};

static int my_i2c_init(const struct drvfx_device* dev)
{
    const struct my_i2c_config* config = dev->config;
    struct my_i2c_data* data = dev->data;

    /* Configure the ESP-IDF peripheral from config. */
    return 0;
}

#define MY_I2C_DEFINE(inst, node_id)                                                                                   \
    static const struct my_i2c_config my_i2c_##inst##_config = {                                                       \
        .port = LWDT_PROP(node_id, port),                                                                              \
        .sda_gpio = LWDT_PROP(node_id, sda_gpio),                                                                      \
        .scl_gpio = LWDT_PROP(node_id, scl_gpio),                                                                      \
    };                                                                                                                 \
    static struct my_i2c_data my_i2c_##inst##_data = { 0 };                                                            \
    DRVFX_DEVICE_DT_INST_DEFINE(inst, esp32_i2c, LWDT_LABEL(node_id), my_i2c_init,                                    \
                                &my_i2c_##inst##_data, &my_i2c_##inst##_config, PRE_KERNEL_2,                         \
                                DRVFX_INIT_PRE_KERNEL_2_BUS_PRIORITY, &my_i2c_api);

#ifdef LWDT_INST_FOREACH_STATUS_OKAY_esp32_i2c
LWDT_INST_FOREACH_STATUS_OKAY(esp32_i2c, MY_I2C_DEFINE)
#endif
```

Example external-device dependency pattern:

```c
#define SENSOR_DEFINE(inst, node_id)                                                                                   \
    static const struct sensor_config sensor_##inst##_config = {                                                       \
        .bus_name = LWDT_LABEL(LWDT_PROP_NODE(node_id, bus)),                                                          \
        .addr = LWDT_PROP_BY_IDX(node_id, reg, 0),                                                                     \
    };                                                                                                                 \
    static struct sensor_data sensor_##inst##_data = { 0 };                                                            \
    static const char* const sensor_##inst##_required_devices[] = {                                                    \
        LWDT_LABEL(LWDT_PROP_NODE(node_id, bus)),                                                                      \
    };                                                                                                                 \
    DRVFX_DEVICE_DT_INST_DEFINE_WITH_DEPS(inst, vendor_sensor, LWDT_LABEL(node_id), sensor_init,                      \
                                          &sensor_##inst##_data, &sensor_##inst##_config, POST_KERNEL,                 \
                                          DRVFX_INIT_POST_KERNEL_DEVICE_PRIORITY, &sensor_api,                         \
                                          sensor_##inst##_required_devices, 1);

#ifdef LWDT_INST_FOREACH_STATUS_OKAY_vendor_sensor
LWDT_INST_FOREACH_STATUS_OKAY(vendor_sensor, SENSOR_DEFINE)
#endif
```

Use `LWDT_LABEL(node_id)` for the runtime device name, `LWDT_PROP()` for scalar
properties, `LWDT_PROP_BY_IDX()` for array entries such as `reg`, and
`LWDT_PROP_NODE()` for phandle-style references such as `bus: "i2c0"`.

Use `PRE_KERNEL_2 / 50` for bus controllers such as I2C/SPI/UART and
`POST_KERNEL / 50` for normal external devices. Priority only orders entries inside
the same level; real hardware dependencies should still be expressed with
`*_WITH_DEPS` macros.

If an application component defines `drvfx_app_main()` or registers init entries
with `DRVFX_SYS_INIT()` / `DRVFX_SUBSYS_INIT()`, link that component with
`WHOLE_ARCHIVE TRUE`. Otherwise normal static-library extraction may discard object
files that are only referenced through linker sections.

## Driver Initialization Priorities

`drvfx` follows Zephyr's initialization level names and 0-99 priority convention.
Lower priority numbers run earlier within the same level. The level names are kept
for source compatibility and ordering clarity, while the actual execution points
are mapped onto ESP-IDF startup hooks.

| Level | Priority | Recommended use | Notes |
| --- | ---: | --- | --- |
| `EARLY` | `0` | Extremely low-level framework hooks only | Avoid normal drivers here. ESP-IDF services may not be ready. |
| `PRE_KERNEL_1` | `0` | Clock or power primitives | Use only for dependencies needed before buses. |
| `PRE_KERNEL_1` | `10` | System timer or watchdog-like primitives | Keep minimal and non-blocking. |
| `PRE_KERNEL_1` | `50` | Basic GPIO controller support | GPIO consumers should initialize later. |
| `PRE_KERNEL_2` | `50` | Internal buses such as I2C, SPI, UART, DMA | Bus controllers should be ready before external devices. |
| `PRE_KERNEL_2` | `80` | Flash, RTC, or storage primitives needed early | Use only when later stages depend on them. |
| `POST_KERNEL` | `30` | Console or logging-related glue | ESP-IDF logging is already available, so most drivers need not use this. |
| `POST_KERNEL` | `50` | External devices on I2C/SPI/GPIO, sensors, RTC chips | Default priority for normal hardware devices. |
| `POST_KERNEL` | `60` | Wi-Fi/Bluetooth controller level hardware | Use for radio/controller bring-up. |
| `POST_KERNEL` | `70` | Network interface binding | Use after controller-level network hardware. |
| `APPLICATION` | `90` | Middleware such as filesystems, UI stacks, protocol clients | Runs from the application phase. |
| `APPLICATION` | `99` | Final user application hooks | Last normal application priority. |

Prefer the named macros in `drvfx/kernel/init.h` instead of raw numbers, for
example `DRVFX_INIT_PRE_KERNEL_2_BUS_PRIORITY` or
`DRVFX_INIT_POST_KERNEL_DEVICE_PRIORITY`. Priority controls ordering within one
level only; real device dependencies should still be expressed with the
`*_WITH_DEPS` device definition macros.

## Notes

- `IDF_TARGET` is selected from `board.cmake`, not from `sdkconfig`.
- ESP-IDF still generates `sdkconfig`, but LWDT keeps the default example
  sdkconfig in the build directory so board wiring stays in `board.lwdt`.
- If an existing `sdkconfig` was generated for a different ESP-IDF target, remove
  it and reconfigure. ESP-IDF validates `sdkconfig` target consistency before LWDT
  can change target cleanly.

## License & Copyright

LWDT is licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE) for details.

Copyright © 2026 Wei Li. All rights reserved.

