# LWDT

LWDT is a lightweight, Jsonnet-based device-tree and driver framework for ESP-IDF.
It lets an application select a board with one board ID, similar to Zephyr's
`west -b`, while keeping hardware wiring out of `sdkconfig`.

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
| I2C master bus | ESP-IDF I2C master driver | `drvfx_i2c_*` API, default device `CONFIG_DRVFX_I2C0_NAME` | `PRE_KERNEL_2 / 50` | Supports attach/detach, probe, transmit, receive, and transmit-receive. |
| SPI master bus | ESP-IDF SPI master driver | `drvfx_spi_*` API, default device `CONFIG_DRVFX_SPI0_NAME` | `PRE_KERNEL_2 / 50` | Supports acquire/release and transceive. |
| RTC | ESP-IDF software RTC | `rtc_*` API, device `idf` | `POST_KERNEL / 50` | Uses ESP-IDF system time as an RTC-like device. |
| RTC | DS1302 | `rtc_*` API, device `rtc_dev` | `POST_KERNEL / 50` | GPIO bit-banged DS1302 support. |
| RTC | PCF8563 | `rtc_*` API, device `rtc_dev` | `POST_KERNEL / 50` | I2C RTC; declares a dependency on the configured I2C bus. |

The public driver headers live under `components/lwdt/include/drvfx/drivers/`.
Driver source lives under `components/lwdt/drivers/`.

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
