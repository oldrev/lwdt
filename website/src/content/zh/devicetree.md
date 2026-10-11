# Jsonnet 设备树格式

LWDT 使用 Jsonnet 描述板级硬件。Jsonnet 保留 JSON 数据结构，同时支持对象继承、字段覆盖与组合。

## 基础板型示例

```jsonnet
{
  board: {
    label: "board",
    led_gpio: 8,
    led_active_low: 1,
    led_name: "ESP32-C3 SuperMini",
  },

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
}
```

## 常用属性

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `label` | string | 节点运行期名称，用于 `k_device_get_binding()`。 |
| `compatible` | string | 驱动匹配字符串，例如 `"esp32,i2c"`。 |
| `status` | string | `"okay"` 表示生成实例；`"disabled"` 表示跳过。缺省视为启用。 |
| `bus` | string | phandle 式总线引用，例如 `"i2c0"`。 |
| `reg` | int array | 设备地址或寄存器地址数组。 |

## 从 C 读取属性

```c
#include <lwdt/lwdt.h>
#include "lwdt_generated.h"

#define BOARD_NODE LWDT_NODELABEL(board)
#define LED_GPIO LWDT_PROP(BOARD_NODE, led_gpio)
#define LED_ACTIVE_LOW LWDT_PROP(BOARD_NODE, led_active_low)
```

生成的宏可用于预处理器表达式、静态配置结构体和驱动实例定义。