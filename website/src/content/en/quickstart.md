# Quick Start & Build

The repository provides an ESP-IDF Blink example. Pass a board ID during the build and LWDT selects its `board.lwdt` and `board.cmake` files.

## 1. Export the ESP-IDF Environment

Install ESP-IDF 6.0.x or later, then export the environment in the current shell.

```bash
# Linux / macOS
. $HOME/esp/esp-idf/export.sh

# Windows PowerShell
. $env:IDF_PATH\export.ps1
```

## 2. Select a Board and Build

Board IDs use the `vendor/model` format. `board.cmake` specifies the target chip and `board.lwdt` provides board hardware data.

```bash
cd example
idf.py build -DLWDT_BOARD_ID=nologo/esp32-c3-supermini
```

An environment variable can also provide the board ID:

```bash
export LWDT_BOARD_ID=espressif/esp32-devkitc-1
idf.py build
```

## 3. Flash and Monitor

```bash
idf.py flash monitor
```

## Built-in Boards

| Board ID | IDF target |
| --- | --- |
| `espressif/esp32-devkitc-1` | `esp32` |
| `espressif/esp32-c3-devkitm-1` | `esp32c3` |
| `nologo/esp32-c3-supermini` | `esp32c3` |
| `espressif/esp32-s3-devkitc-1` | `esp32s3` |

:::warning[Clean sdkconfig before switching targets]
When switching to a different chip target, remove a stale `sdkconfig` created for another target before reconfiguring. ESP-IDF validates target consistency first.
:::