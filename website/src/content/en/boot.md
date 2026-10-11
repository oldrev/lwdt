# Init Levels & Timeline

drvfx maps initialization entries onto ESP-IDF startup phases while retaining Zephyr-style init level names. Entries run in level order; within a level, priorities 0–99 execute in ascending order.

## Level Selection Guidance

| Level | Intended Use |
| --- | --- |
| `EARLY` | Extremely early framework hooks; avoid regular drivers. |
| `PRE_KERNEL_1` | Clock, power, and basic GPIO primitives. |
| `PRE_KERNEL_2` | Internal bus controllers: I2C, SPI, UART, DMA. |
| `POST_KERNEL` | External sensors, RTCs, storage, and network controller hardware. |
| `APPLICATION` | Filesystems, UI stacks, protocol clients, and application hooks. |

## Named Priority Constants

Use named macros in `drvfx/kernel/init.h` instead of raw numeric priorities:

```c
DRVFX_INIT_PRE_KERNEL_2_BUS_PRIORITY
DRVFX_INIT_POST_KERNEL_DEVICE_PRIORITY
```

Priorities order entries only inside the same init level. Declare real dependencies such as external I2C devices using `*_WITH_DEPS` macros.