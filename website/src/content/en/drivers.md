# Implemented Drivers

Public driver headers are located in `components/lwdt/include/drvfx/drivers/`; implementations live in `components/lwdt/drivers/`.

| Driver | Backend | Device Name / API | Init Level | Notes |
| --- | --- | --- | --- | --- |
| I2C master | ESP-IDF I2C master | `drvfx_i2c_*` / `i2c0` | `PRE_KERNEL_2 / 50` | Multi-instance from `"esp32,i2c"`; supports probe, transmit, and receive. |
| SPI master | ESP-IDF SPI master | `drvfx_spi_*` / `spi2` | `PRE_KERNEL_2 / 50` | Multi-instance from `"esp32,spi"`; supports acquire/release and transceive. |
| Software RTC | ESP-IDF system time | `rtc_*` / `idf` | `POST_KERNEL / 50` | Legacy single-instance compatibility driver. |
| DS1302 RTC | GPIO bit-bang | `rtc_*` / `rtc_dev` | `POST_KERNEL / 50` | Legacy single-instance timing driver. |
| PCF8563 RTC | I2C peripheral | `rtc_*` / `rtc0` | `POST_KERNEL / 50` | Multi-instance from `"nxp,pcf8563"`; depends on referenced I2C bus. |

Driver instances are generated only for nodes with `status: "okay"` or no `status` property. Compatible strings are normalized to C identifiers; e.g. `"vendor,my-device"` becomes `vendor_my_device`.