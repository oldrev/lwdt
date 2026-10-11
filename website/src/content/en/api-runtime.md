# drvfx Runtime APIs

`drvfx/drvfx.h` provides runtime device access and initialization registration interfaces.

## Device Lookup

```c
#define I2C0_NODE LWDT_NODELABEL(i2c0)

const struct drvfx_device* i2c0 =
    k_device_get_binding(LWDT_LABEL(I2C0_NODE));

if ((i2c0 == NULL) || !k_device_is_ready(i2c0)) {
    return -ENODEV;
}
```

| API | Description |
| --- | --- |
| `k_device_get_binding(name)` | Fetch runtime device by name; returns `NULL` on failure. |
| `k_device_is_ready(dev)` | Check whether device initialization completed. |
| `drvfx_app_main()` | User application entry point called from LWDT's `app_main()`. |

## Init Entries and Device Definitions

| API | Description |
| --- | --- |
| `DRVFX_SYS_INIT(fn, level, prio)` | Register a system startup entry. |
| `DRVFX_SUBSYS_INIT(fn, level, prio)` | Register a subsystem startup entry. |
| `DRVFX_DEVICE_DT_INST_DEFINE(...)` | Define a static device from a DT instance. |
| `DRVFX_DEVICE_DT_INST_DEFINE_WITH_DEPS(...)` | Define a static instance with explicit dependencies. |

Components with linker-section-discovered entries must use `WHOLE_ARCHIVE TRUE`.