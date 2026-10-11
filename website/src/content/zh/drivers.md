# 已实现的内置驱动

公共驱动头文件位于 `components/lwdt/include/drvfx/drivers/`，实现位于 `components/lwdt/drivers/`。

| 驱动 | 底层实现 | 设备名 / API | 初始化级别 | 说明 |
| --- | --- | --- | --- | --- |
| I2C 主机 | ESP-IDF I2C master | `drvfx_i2c_*` / `i2c0` | `PRE_KERNEL_2 / 50` | 基于 `"esp32,i2c"` 多实例展开，支持 probe、发送和接收。 |
| SPI 主机 | ESP-IDF SPI master | `drvfx_spi_*` / `spi2` | `PRE_KERNEL_2 / 50` | 基于 `"esp32,spi"` 多实例展开，支持 acquire/release 和 transceive。 |
| 软件 RTC | ESP-IDF 系统时间 | `rtc_*` / `idf` | `POST_KERNEL / 50` | 单实例兼容实现。 |
| DS1302 RTC | GPIO 位敲 | `rtc_*` / `rtc_dev` | `POST_KERNEL / 50` | 单实例 GPIO 时序驱动。 |
| PCF8563 RTC | I2C 从设备 | `rtc_*` / `rtc0` | `POST_KERNEL / 50` | 基于 `"nxp,pcf8563"` 多实例展开，依赖引用的 I2C 总线。 |

驱动实例仅对 `status: "okay"` 或未设置 `status` 的设备树节点生成。对于 compatible 字符串，生成器会将逗号和连字符规范化为 C 标识符，例如 `"vendor,my-device"` 映射为 `vendor_my_device`。