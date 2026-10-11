# drvfx 驱动模型与实例定义

drvfx 使用静态设备对象和链接段初始化入口。一个设备树节点可生成一个驱动实例；驱动通过 `compatible` 选择目标节点，并通过 `LWDT_INST_FOREACH_STATUS_OKAY()` 展开实例定义。

## 驱动构成

典型 DT 驱动包含以下部分：

1. 不可变配置结构体：从设备树读取 GPIO、总线、地址等固定参数。
2. 运行时数据结构体：保存句柄、状态或缓存。
3. 初始化函数：签名为 `int init(const struct drvfx_device* dev)`。
4. 每实例定义宏：调用 `DRVFX_DEVICE_DT_INST_DEFINE()` 或带依赖版本。

## I2C 外设实例示例

```c
struct sensor_config {
    const char* bus_name;
    uint8_t addr;
};

struct sensor_data {
    void* handle;
};

static int sensor_init(const struct drvfx_device* dev)
{
    const struct sensor_config* cfg = dev->config;
    /* Configure the peripheral using cfg->bus_name and cfg->addr. */
    return 0;
}

#define SENSOR_DEFINE(inst, node_id)                                      \
    static const struct sensor_config sensor_cfg_##inst = {               \
        .bus_name = LWDT_LABEL(LWDT_PROP_NODE(node_id, bus)),             \
        .addr = LWDT_PROP_BY_IDX(node_id, reg, 0),                        \
    };                                                                    \
    static struct sensor_data sensor_data_##inst = { 0 };                 \
    DRVFX_DEVICE_DT_INST_DEFINE(                                          \
        inst, vendor_sensor, LWDT_LABEL(node_id), sensor_init,            \
        &sensor_data_##inst, &sensor_cfg_##inst, POST_KERNEL,             \
        DRVFX_INIT_POST_KERNEL_DEVICE_PRIORITY, &sensor_api);

LWDT_INST_FOREACH_STATUS_OKAY(vendor_sensor, SENSOR_DEFINE)
```

## 显式硬件依赖

外设依赖 I2C、SPI 等总线时，使用 `DRVFX_DEVICE_DT_INST_DEFINE_WITH_DEPS()` 显式声明依赖设备名称。初始化优先级只用于同级排序，不代替实际依赖关系。