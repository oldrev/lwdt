# LWDT：面向 ESP-IDF 板级变体的轻量级设备树与驱动框架方案

[![ESP-IDF Build](https://github.com/oldrev/lwdt/actions/workflows/esp-idf-build.yml/badge.svg)](https://github.com/oldrev/lwdt/actions/workflows/esp-idf-build.yml)
[![ESP-IDF](https://img.shields.io/badge/ESP--IDF-6.0.1-E7352C)](https://github.com/espressif/esp-idf)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![Language](https://img.shields.io/badge/language-C%20%7C%20Python%20%7C%20CMake-555555)](.)

[English](README.md) | 简中

LWDT 的灵感来自 Zephyr RTOS，尤其是它解耦的驱动模型、基于设备树的硬件描述、板子 ID，以及按优先级排序的设备初始化机制。没有直接使用 Zephyr 的原因很现实：很多 ESP32 产品仍然需要 Espressif 原生 ESP-IDF 生态，包括 BLE 配网、Wi-Fi、Mesh、官方示例、工具链，以及新芯片第一时间支持。

LWDT 要解决的痛点，是传统 ESP-IDF 项目在维护多个硬件变体或复用自定义驱动时，很容易滑向 `#ifdef` 分支、硬编码 GPIO 表、重复驱动胶水代码，以及把板级硬件信息散落在 `sdkconfig`、CMake 和应用代码里。

LWDT 的方案是一条轻量级 Python/Jsonnet 流水线：把 `board.lwdt` 转成类似 Zephyr 的 C 访问宏，同时提供一个小型 `drvfx` 运行时，在原生 ESP-IDF CMake 内实现按优先级排序的初始化入口和静态设备对象。最终目标是在不放弃 ESP-IDF 的前提下，获得可按板子选择、可复用、无运行时解析开销的硬件抽象。

如果这个项目节省了你的时间，欢迎请我喝杯咖啡。你的支持会帮助项目持续维护，谢谢！

<p align="center">
  <a href="https://ko-fi.com/oldrev">
    <img src="https://ko-fi.com/img/githubbutton_sm.svg" alt="Buy me a coffee" width="200">
  </a>
</p>

板子 ID 固定写成 `vendor/model` 形式。每个板子目录使用固定文件名：

- `board.lwdt`：Jsonnet 设备树描述
- `board.cmake`：板级元数据，包括 `LWDT_BOARD_IDF_TARGET`
- `.lwdt.overlay` 或 `board.lwdt.overlay`：可选的项目覆盖文件

## 已实现能力

LWDT 当前提供：

- 通过 `-DLWDT_BOARD_ID=<vendor>/<model>` 或环境变量 `LWDT_BOARD_ID` 选择板子
- 从板级元数据自动设置 ESP-IDF `IDF_TARGET`
- 在 LWDT 组件内提供内置 BSP 风格的板子定义
- 用户项目可通过本地 `boards/` 覆盖内置板子或添加新板子
- 支持 Jsonnet overlay，在基础板子描述之后叠加覆盖
- 生成供 C 代码使用的设备树访问宏
- 提供 `drvfx` 驱动框架和初始化模型

## 仓库结构

- `components/lwdt/`：可复用 ESP-IDF 组件，包含生成器、运行时框架、通用设备树片段和内置板子
- `components/lwdt/boards/<vendor>/<model>/`：内置板子 BSP 定义
- `components/lwdt/dt/`：共享 Jsonnet SoC 与设备树片段
- `example/`：ESP-IDF blink 示例
- `example/boards/<vendor>/<model>/`：项目本地板子定义或 overlay
- `.github/workflows/`：使用 ESP-IDF Docker 镜像的 CI 构建

## 板子解析顺序

应用配置 LWDT 时，板子根目录按以下顺序搜索：

1. 项目的 `boards/` 目录
2. `LWDT_BOARD_ROOTS` 指定的额外目录
3. `components/lwdt/boards/` 中的内置板子

第一个同时包含 `board.cmake` 和 `board.lwdt` 的目录会被选中。因此，应用可以通过创建下面的目录覆盖内置板子：

```text
boards/<vendor>/<model>/board.cmake
boards/<vendor>/<model>/board.lwdt
```

也可以保留内置板子，只添加项目 overlay：

```text
boards/<vendor>/<model>/.lwdt.overlay
```

还支持应用级 overlay：

```text
.lwdt.overlay
```

显式 overlay 可通过 `-DLWDT_OVERLAYS=<path1>;<path2>` 或环境变量 `LWDT_OVERLAYS` 传入。overlay 会按列表顺序在 `board.lwdt` 之后用 Jsonnet `+` 语义叠加。

在 Windows 上，`LWDT_BOARD_ROOTS` 和 `LWDT_OVERLAYS` 使用分号分隔。不要用冒号，因为盘符本身包含冒号。

## 快速开始

先按 ESP-IDF 常规方式设置环境，然后用板子 ID 构建示例：

```powershell
cd example
idf.py build -DLWDT_BOARD_ID=nologo/esp32-c3-supermini
```

也可以通过环境变量设置板子 ID：

```powershell
$env:LWDT_BOARD_ID = "nologo/esp32-c3-supermini"
idf.py build
```

刷写和串口监视仍然使用 ESP-IDF 原生命令：

```powershell
idf.py flash monitor
```

## 内置板子

当前组件包含以下内置板子定义：

- `espressif/esp32-devkitc-1`
- `espressif/esp32-c3-devkitm-1`
- `nologo/esp32-c3-supermini`
- `espressif/esp32-s3-devkitc-1`

## 在 ESP-IDF 项目中使用 LWDT

在应用顶层 `CMakeLists.txt` 中加入 LWDT 组件目录，并在 ESP-IDF `project.cmake` 之前 include 板子解析器：

```cmake
cmake_minimum_required(VERSION 3.16)

set(EXTRA_COMPONENT_DIRS "path/to/devicetree/components")
include("path/to/devicetree/components/lwdt/cmake/lwdt_board.cmake")

include($ENV{IDF_PATH}/tools/cmake/project.cmake)
project(my_app)
```

用户代码实现 `drvfx_app_main()`，不要直接实现 ESP-IDF 的 `app_main()`。LWDT 运行时持有 `app_main()`，以便在进入用户代码之前运行 `APPLICATION` 初始化阶段。

如果组件定义了 `drvfx_app_main()`，或使用 `DRVFX_SYS_INIT()` / `DRVFX_SUBSYS_INIT()` 注册初始化入口，该组件必须使用 `WHOLE_ARCHIVE TRUE` 链接。这些函数通过 linker section 发现，普通静态库符号抽取可能会丢弃只通过 section 引用的对象文件。

```c
#include "drvfx/drvfx.h"

void drvfx_app_main(void)
{
    /* 用户应用代码 */
}
```

然后构建：

```powershell
idf.py build -DLWDT_BOARD_ID=<vendor>/<model>
```

## 访问设备树数据

在组件代码中同时包含 helper 宏和生成头文件：

```c
#include <lwdt/lwdt.h>
#include "lwdt_generated.h"
```

生成的符号使用 `LWDT_` 前缀。可以直接访问原始生成宏，但推荐使用 helper 宏。

例如板子片段：

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

按 node label 读取属性：

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

也可以直接使用生成宏：

```c
#define LED_GPIO_DIRECT LWDT_NS_board_P_led_gpio
```

按路径构造节点并读取属性：

```c
#define I2C0_NODE LWDT_NODE2(soc, i2c0)
#define I2C0_ADDR LWDT_PROP(I2C0_NODE, reg)
```

数组属性使用索引 helper：

```c
#define FIRST_PIN  LWDT_PROP_BY_IDX(BOARD_NODE, pins, 0)
#define PIN_COUNT  LWDT_PROP_LEN(BOARD_NODE, pins)
```

phandle 风格引用使用 `LWDT_PROP_NODE()` 或 `LWDT_PROP_PHANDLE()`：

```c
#define BUS_NODE LWDT_PROP_NODE(BOARD_NODE, i2c_bus)
```

compatible 实例使用 instance helper。compatible 字符串会按 C 标识符规则规范化，例如 `"vendor,my-device"` 会变成 `vendor_my_device`：

```c
#define DEV0_NODE LWDT_INST(0, vendor_my_device)
#define DEV0_REG  LWDT_INST_PROP(0, vendor_my_device, reg)
```

blink 示例也是用同样的方式访问生成数据：

```c
#define BOARD_NODE      LWDT_NODELABEL(board)
#define BLINK_GPIO      LWDT_PROP(BOARD_NODE, led_gpio)
#define LED_ACTIVE_LOW  LWDT_PROP(BOARD_NODE, led_active_low)
#define LED_BOARD_NAME  LWDT_PROP(BOARD_NODE, led_name)
```

## 添加板子

添加项目本地板子：

1. 在 ESP-IDF 项目中创建 `boards/<vendor>/<model>/`。
2. 添加 `board.lwdt`，描述板级硬件。
3. 添加 `board.cmake`，设置 `LWDT_BOARD_IDF_TARGET` 为正确的 ESP-IDF target。
4. 使用 `-DLWDT_BOARD_ID=<vendor>/<model>` 构建。

如果要给 LWDT 本身添加内置板子，则在 `components/lwdt/boards/` 下添加同样结构的目录。

## 已实现驱动

LWDT 当前包含以下 `drvfx` 驱动：

| 驱动 | 实现 | 设备名 / API | 初始化级别 | 备注 |
| --- | --- | --- | --- | --- |
| I2C master bus | ESP-IDF I2C master driver | `drvfx_i2c_*` API，DT label，例如 `i2c0` | `PRE_KERNEL_2 / 50` | 通过 `compatible: "esp32,i2c"` 做 DT 多实例；支持 attach/detach、probe、transmit、receive、transmit-receive。 |
| SPI master bus | ESP-IDF SPI master driver | `drvfx_spi_*` API，DT label，例如 `spi2` | `PRE_KERNEL_2 / 50` | 通过 `compatible: "esp32,spi"` 做 DT 多实例；支持 acquire/release 和 transceive。 |
| RTC | ESP-IDF software RTC | `rtc_*` API，设备 `idf` | `POST_KERNEL / 50` | legacy 单实例驱动，使用 ESP-IDF 系统时间作为类 RTC 设备。 |
| RTC | DS1302 | `rtc_*` API，设备 `rtc_dev` | `POST_KERNEL / 50` | legacy 单实例 GPIO bit-bang DS1302 支持。 |
| RTC | PCF8563 | `rtc_*` API，DT label，例如 `rtc0` | `POST_KERNEL / 50` | 通过 `compatible: "nxp,pcf8563"` 做 DT 多实例；依赖引用的 I2C bus。 |

公共驱动头文件位于 `components/lwdt/include/drvfx/drivers/`。
驱动源码位于 `components/lwdt/drivers/`。

## 开发驱动

新的 LWDT 驱动应从设备树节点实例化，而不是从硬编码的 `CONFIG_*0_*` wiring 实例化。这个模型有意接近 Zephyr：每个匹配 `compatible` 的节点都会获得一个 instance 编号，驱动在文件作用域展开 `LWDT_INST_FOREACH_STATUS_OKAY(<compat>, <macro>)`。只有 `status: "okay"` 的节点会被实例化；没有写 `status` 时默认视为 okay。

典型驱动包含四部分：

1. 从 `board.lwdt` 读取不可变硬件配置的 config 结构体。
2. 保存运行时状态的 data 结构体，每个启用节点一份。
3. 签名为 `int init(const struct drvfx_device* dev)` 的初始化函数。
4. 一个 per-instance define 宏，调用 `DRVFX_DEVICE_DT_INST_DEFINE()` 或 `DRVFX_DEVICE_DT_INST_DEFINE_WITH_DEPS()`。

板级数据示例：

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

总线驱动模式示例：

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

    /* 根据 config 配置 ESP-IDF 外设。 */
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

外设依赖总线的模式示例：

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

运行时设备名使用 `LWDT_LABEL(node_id)`，普通属性使用 `LWDT_PROP()`，`reg` 这类数组属性使用 `LWDT_PROP_BY_IDX()`，`bus: "i2c0"` 这类 phandle 风格引用使用 `LWDT_PROP_NODE()`。

I2C/SPI/UART 等总线控制器通常使用 `PRE_KERNEL_2 / 50`，普通外部设备使用 `POST_KERNEL / 50`。priority 只决定同一个 level 内的顺序；真实硬件依赖仍然应通过 `*_WITH_DEPS` 宏表达。

如果应用组件定义了 `drvfx_app_main()`，或使用 `DRVFX_SYS_INIT()` / `DRVFX_SUBSYS_INIT()` 注册初始化入口，该组件需要 `WHOLE_ARCHIVE TRUE`，否则普通静态库抽取可能会丢弃只通过 linker section 引用的对象文件。

## 驱动初始化优先级

`drvfx` 使用 Zephyr 风格的初始化 level 名称和 0-99 priority 约定。同一 level 内，数字越小越早运行。level 名称用于兼容和排序表达，实际执行时机会映射到 ESP-IDF startup hook。

| Level | Priority | 推荐用途 | 备注 |
| --- | ---: | --- | --- |
| `EARLY` | `0` | 极底层框架 hook | 普通驱动不要放这里，ESP-IDF 服务可能还没好。 |
| `PRE_KERNEL_1` | `0` | 时钟或电源基础设施 | 只放总线之前必须完成的依赖。 |
| `PRE_KERNEL_1` | `10` | 系统定时器或看门狗类基础设施 | 保持最小且不阻塞。 |
| `PRE_KERNEL_1` | `50` | 基础 GPIO 控制器 | GPIO 消费者应在更晚阶段初始化。 |
| `PRE_KERNEL_2` | `50` | I2C、SPI、UART、DMA 等内部总线 | 总线控制器应先于外部设备 ready。 |
| `PRE_KERNEL_2` | `80` | 较早需要的 Flash、RTC 或存储基础设施 | 只在后续阶段依赖它们时使用。 |
| `POST_KERNEL` | `30` | Console 或 logging 相关 glue | ESP-IDF logging 已可用，大多数驱动不需要用这个。 |
| `POST_KERNEL` | `50` | I2C/SPI/GPIO 上的外部器件、传感器、RTC 芯片 | 普通硬件设备默认优先级。 |
| `POST_KERNEL` | `60` | Wi-Fi/Bluetooth controller 级硬件 | 用于无线 controller bring-up。 |
| `POST_KERNEL` | `70` | 网络接口绑定 | 用于 controller 之后的网络接口启用。 |
| `APPLICATION` | `90` | 文件系统、UI 栈、协议客户端等中间件 | 应用阶段运行。 |
| `APPLICATION` | `99` | 最终用户应用 hook | 最后的常规应用优先级。 |

优先使用 `drvfx/kernel/init.h` 中的命名宏，而不是裸数字，例如 `DRVFX_INIT_PRE_KERNEL_2_BUS_PRIORITY` 或 `DRVFX_INIT_POST_KERNEL_DEVICE_PRIORITY`。priority 只控制同一 level 内的排序；真实设备依赖仍应使用 `*_WITH_DEPS` 宏表达。

## 注意事项

- `IDF_TARGET` 来自 `board.cmake`，不是来自 `sdkconfig`。
- ESP-IDF 仍然会生成 `sdkconfig`，但 LWDT 示例会把默认 sdkconfig 放在 build 目录，把板级 wiring 留在 `board.lwdt`。
- 如果已有 `sdkconfig` 是为另一个 ESP-IDF target 生成的，请删除它并重新配置。ESP-IDF 会先校验 `sdkconfig` target 一致性，然后 LWDT 才能干净地切 target。

## License & Copyright

LWDT 使用 Apache License, Version 2.0 授权。详情见 [LICENSE](LICENSE)。

Copyright (c) 2026 Wei Li. All rights reserved.
