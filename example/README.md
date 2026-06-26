# LWDT Blink Example

This ESP-IDF example blinks the on-board LED using an LWDT board definition.
Select the board with `LWDT_BOARD_ID`, similar to Zephyr's `west -b` flow.

```powershell
idf.py build -DLWDT_BOARD_ID=nologo/esp32-c3-supermini
```

The example includes `../components/lwdt/cmake/lwdt_board.cmake` before ESP-IDF's
`project.cmake`. User code implements `drvfx_app_main()` because the LWDT runtime
owns ESP-IDF's `app_main()`. The example `main` component uses `WHOLE_ARCHIVE TRUE`
so `drvfx_app_main()` and `DRVFX_SUBSYS_INIT()` entries are not discarded by static
library linking.

That resolver searches boards in this order:

1. `example/boards/`
2. `LWDT_BOARD_ROOTS`, if provided
3. `../components/lwdt/boards/`

Each board directory declares `LWDT_BOARD_IDF_TARGET` in `board.cmake`, so ESP-IDF
gets the correct target automatically during configure.

Project overlays are supported:

- `example/boards/<vendor>/<model>/.lwdt.overlay`
- `example/boards/<vendor>/<model>/board.lwdt.overlay`
- `example/.lwdt.overlay`
- `-DLWDT_OVERLAYS=<path1>;<path2>`

Overlays are applied after `board.lwdt` in list order. The C3 example includes a
small project overlay to demonstrate overriding board data without changing the
built-in BSP.

Built-in board IDs currently available:

- `espressif/esp32-devkitc-1`
- `espressif/esp32-c3-devkitm-1`
- `nologo/esp32-c3-supermini`
- `espressif/esp32-s3-devkitc-1`

ESP-IDF still generates `sdkconfig` as build state, but it is kept in the build
directory and is not used for board wiring.
