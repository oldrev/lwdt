# 概览与设计背景

LWDT（Lightweight Device Tree）是面向 ESP-IDF 的构建期设备树编译器与轻量驱动运行时。它将 GPIO、总线参数、外设地址和板级标识定义在 `board.lwdt` 中，在配置阶段生成 `lwdt_generated.h`，供 C 驱动在编译期访问。

## 适用场景

- 同一应用需要支持多款 ESP32 开发板或定制硬件。
- 传感器、I2C/SPI 总线和 GPIO 配置需要按板型切换。
- 驱动需要按硬件依赖顺序自动初始化。
- 项目希望保留 ESP-IDF 原生 Wi-Fi、BLE、Mesh、CMake 与 `idf.py` 工具链。

## 工作组成

| 组件 | 职责 |
| --- | --- |
| `board.lwdt` | 使用 Jsonnet 描述板级硬件节点和属性。 |
| LWDT 生成器 | 在构建期将 Jsonnet 描述转换为 C 宏头文件。 |
| `lwdt_generated.h` | 为驱动提供节点、属性、标签和 compatible 实例宏。 |
| `drvfx` | 提供静态设备对象、初始化级别、优先级和设备查询接口。 |

## 与 ESP-IDF 的集成边界

LWDT 以标准 ESP-IDF 组件方式引入工程。`IDF_TARGET` 由板型目录中的 `board.cmake` 选择；ESP-IDF 的 FreeRTOS、网络协议栈、组件管理和烧录工具保持原有行为。

设备树描述在构建阶段处理。固件运行时只包含生成的常量宏和静态设备对象，无 Jsonnet 解析过程，无额外动态分配。

## 核心术语

### 设备树节点

节点描述一件硬件，例如 `soc.i2c0`、`rtc0` 或板级 `board` 节点。属性定义 GPIO、总线速率、I2C 地址等固定硬件参数。

### compatible

`compatible` 用于将设备树节点和驱动实现关联。例如 `"esp32,i2c"` 会被 I2C 驱动的实例展开宏识别，`"nxp,pcf8563"` 对应 PCF8563 RTC 驱动。

### Overlay

Overlay 在基础 `board.lwdt` 之后按顺序以 Jsonnet `+` 语义合并。适用于板卡修订、项目局部 GPIO 修改或增加外部设备。

### drvfx 初始化级别

drvfx 将初始化入口分为 `EARLY`、`PRE_KERNEL_1`、`PRE_KERNEL_2`、`POST_KERNEL` 与 `APPLICATION`。同一级别按 0–99 优先级升序运行。