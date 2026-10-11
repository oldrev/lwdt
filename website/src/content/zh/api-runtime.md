# drvfx 运行期接口

`drvfx/drvfx.h` 提供运行期设备访问与启动入口注册接口。

## 设备查询

```c
#define I2C0_NODE LWDT_NODELABEL(i2c0)

const struct drvfx_device* i2c0 =
    k_device_get_binding(LWDT_LABEL(I2C0_NODE));

if ((i2c0 == NULL) || !k_device_is_ready(i2c0)) {
    return -ENODEV;
}
```

| 接口 | 说明 |
| --- | --- |
| `k_device_get_binding(name)` | 按设备名称获取运行期设备对象；失败返回 `NULL`。 |
| `k_device_is_ready(dev)` | 检查设备是否已经完成初始化。 |
| `drvfx_app_main()` | 用户应用入口，由 LWDT 运行时在 `app_main()` 后调用。 |

## 启动入口与设备定义

| 接口 | 说明 |
| --- | --- |
| `DRVFX_SYS_INIT(fn, level, prio)` | 注册系统级启动入口。 |
| `DRVFX_SUBSYS_INIT(fn, level, prio)` | 注册子系统级启动入口。 |
| `DRVFX_DEVICE_DT_INST_DEFINE(...)` | 从设备树实例定义静态设备对象。 |
| `DRVFX_DEVICE_DT_INST_DEFINE_WITH_DEPS(...)` | 定义带显式依赖设备的静态实例。 |

使用链接段自动发现的入口时，组件需要设置 `WHOLE_ARCHIVE TRUE`。