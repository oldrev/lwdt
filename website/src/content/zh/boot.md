# 初始化级别与启动时序

drvfx 将初始化入口映射到 ESP-IDF 启动阶段，并使用 Zephyr 风格的初始化级别名称。入口按照级别顺序运行；同一级别内按 0–99 的优先级升序执行。

## 级别选择建议

| 级别 | 推荐用途 |
| --- | --- |
| `EARLY` | 极早期框架钩子，避免普通驱动。 |
| `PRE_KERNEL_1` | 时钟、电源、基础 GPIO 等底层原语。 |
| `PRE_KERNEL_2` | I2C、SPI、UART、DMA 等内部总线控制器。 |
| `POST_KERNEL` | 外部传感器、RTC、存储与网络控制器外设。 |
| `APPLICATION` | 文件系统、UI、协议客户端与用户应用钩子。 |

## 命名优先级常量

使用 `drvfx/kernel/init.h` 中的命名宏代替裸数字：

```c
DRVFX_INIT_PRE_KERNEL_2_BUS_PRIORITY
DRVFX_INIT_POST_KERNEL_DEVICE_PRIORITY
```

优先级只控制同一初始化级别内的顺序。I2C 从设备、SPI 从设备等真实依赖关系应通过 `*_WITH_DEPS` 宏声明。