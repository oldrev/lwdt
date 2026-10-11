# Notes & Frequently Asked Questions

## Build Considerations

1. `IDF_TARGET` is selected by the current board's `board.cmake`; `sdkconfig` does not select a board.
2. When changing chip targets, remove any `sdkconfig` generated for the previous target before reconfiguration.
3. Use semicolons between paths in `LWDT_BOARD_ROOTS` and `LWDT_OVERLAYS` on Windows.
4. Override precedence is project `boards/`, `LWDT_BOARD_ROOTS`, then built-in `components/lwdt/boards/`.

## FAQ

### Does LWDT provide an RTOS kernel or scheduler?

No. The project retains ESP-IDF's FreeRTOS, component build system, and runtime environment. LWDT handles board description, macro generation, and driver initialization.

### Can ESP-IDF Wi-Fi and Bluetooth components still be used?

Yes. LWDT is an ordinary ESP-IDF component; Wi-Fi, BLE provisioning, Mesh, official examples, and tooling continue to work.

### Is `board.lwdt` parsed at runtime?

No. The build converts `board.lwdt` into C macros and static device objects. Firmware uses compiled configuration directly.

### What should I check when an initializer does not execute?

Verify that the component containing the initializer is linked using `WHOLE_ARCHIVE TRUE`. Linker-section discovery requires those object files to reach the final image.