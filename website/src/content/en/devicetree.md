# Jsonnet Device Tree Format

LWDT uses Jsonnet for board hardware descriptions. Jsonnet retains JSON's data model while providing object inheritance, property overrides, and composition.

## Base Board Example

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

## Common Properties

| Property | Type | Description |
| --- | --- | --- |
| `label` | string | Global node identifier used by `k_device_get_binding()`. |
| `compatible` | string | Driver matching string, e.g. `"esp32,i2c"`. |
| `status` | string | `"okay"` creates an instance; `"disabled"` skips it. Missing status means enabled. |
| `bus` | string | Phandle-style bus reference, e.g. `"i2c0"`. |
| `reg` | int array | Device or register address array. |

## Reading Properties from C

```c
#include <lwdt/lwdt.h>
#include "lwdt_generated.h"

#define BOARD_NODE LWDT_NODELABEL(board)
#define LED_GPIO LWDT_PROP(BOARD_NODE, led_gpio)
#define LED_ACTIVE_LOW LWDT_PROP(BOARD_NODE, led_active_low)
```

Generated macros can be used in preprocessor expressions, static config structs, and driver instance declarations.