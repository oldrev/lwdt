# LWDT Blink Example

This ESP-IDF example blinks the on-board LED using a board definition from LWDT.

Select the board by setting `LWDT_BOARD_ID` before configuring. Example board IDs in this tree:

- `espressif/esp32-devkitc-1`
- `nologo/esp32-c3-supermini`
- `espressif/esp32-s3-devkitc-1`

Each board directory declares `LWDT_BOARD_IDF_TARGET`, so ESP-IDF gets the correct `IDF_TARGET` automatically during configure.

The example keeps board-specific hardware description in `board.lwdt` and `board.cmake`. ESP-IDF still generates `sdkconfig` as build state, but it is kept in the build directory and is not used for board wiring.