# drvfx Driver Model & Instances

drvfx uses static device objects and linker-section initialization entries. One device-tree node can create one driver instance; drivers select nodes by `compatible` and expand definitions using `LWDT_INST_FOREACH_STATUS_OKAY()`.

## Driver Structure

A typical DT-driven driver contains:

1. An immutable config structure for fixed DT properties such as GPIOs, bus, and address.
2. A runtime data structure for handles, status, or cache.
3. An initializer with signature `int init(const struct drvfx_device* dev)`.
4. An instance macro invoking `DRVFX_DEVICE_DT_INST_DEFINE()` or its dependency-aware variant.

## I2C Peripheral Example

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
    /* Configure using cfg->bus_name and cfg->addr. */
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

## Explicit Dependencies

Use `DRVFX_DEVICE_DT_INST_DEFINE_WITH_DEPS()` when an external device depends on an I2C/SPI bus or other device. Init priority only orders entries inside one level; it does not express real hardware dependencies.