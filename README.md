# LWDT for ESP-IDF

LWDT is a lightweight, Jsonnet-based device tree and driver framework for ESP-IDF.
It lets you describe board hardware in a board-local `.lwdt` file, keep board metadata
in a small CMake fragment, and generate the headers consumed by the application at
configure time.

The repository is organized around board IDs in `vendor/model` form. The example
application uses the selected board ID to:

- resolve `example/boards/<vendor>/<model>/board.lwdt`
- load `board.cmake`
- set `IDF_TARGET`
- generate `lwdt_generated.h`

## Why This Exists

ESP-IDF projects often spread board-specific information across Kconfig, CMake, and
application code. LWDT moves the hardware description into a dedicated board
directory so the board definition stays explicit and reusable.

This gives you:

- a single board ID per board
- fixed file names for each board
- board metadata separated from application code
- hardware description that is not mixed into `sdkconfig`

## Repository Layout

- `components/lwdt/`: reusable ESP-IDF component containing the Jsonnet generator,
  the `drvfx` framework, and the code that turns a board file into C headers
- `example/`: blink example showing how to select a board and consume generated
  headers
- `example/boards/<vendor>/<model>/`: board definitions keyed by board ID

Each board directory contains:

- `board.lwdt`: the board device-tree fragment
- `board.cmake`: board metadata used during configure, including `LWDT_BOARD_IDF_TARGET`

## Quick Start

1. Set up the ESP-IDF environment as usual.
2. Pick a board ID from `example/boards/`.
3. Configure and build the example:

```powershell
cd example
idf.py build -DLWDT_BOARD_ID=nologo/esp32-c3-supermini
```

You can also set the board ID through the environment:

```powershell
$env:LWDT_BOARD_ID = "nologo/esp32-c3-supermini"
idf.py build
```

4. Flash and monitor with the usual ESP-IDF commands:

```powershell
idf.py flash monitor
```

## Example Boards

The example tree currently includes:

- `espressif/esp32-devkitc-1`
- `nologo/esp32-c3-supermini`
- `espressif/esp32-s3-devkitc-1`

## Adding A Board

1. Create `example/boards/<vendor>/<model>/`.
2. Add `board.lwdt` with the board's hardware description.
3. Add `board.cmake` and set `LWDT_BOARD_IDF_TARGET` to the correct ESP-IDF target.
4. Build with `-DLWDT_BOARD_ID=<vendor>/<model>`.

## Notes

- `LWDT_BOARD_ID` must point to a board directory in `vendor/model` form.
- `IDF_TARGET` is selected from `board.cmake`, not from `sdkconfig`.
- ESP-IDF still generates `sdkconfig`, but it lives in the build directory and is
  treated as build state, not as board wiring data.