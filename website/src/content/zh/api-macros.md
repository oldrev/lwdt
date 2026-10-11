# 设备树编译期宏

在组件源码中同时引入以下头文件：

```c
#include <lwdt/lwdt.h>
#include "lwdt_generated.h"
```

## 节点与属性读取

| 宏 | 说明 |
| --- | --- |
| `LWDT_NODELABEL(label)` | 按标签获取节点 ID。 |
| `LWDT_NODE2(a, b)` | 按路径段构造节点 ID，例如 `soc/i2c0`。 |
| `LWDT_NODE_EXISTS(node)` | 判断节点是否存在，可用于 `#if`。 |
| `LWDT_PROP(node, prop)` | 读取标量属性值。 |
| `LWDT_PROP_EXISTS(node, prop)` | 判断属性是否存在。 |
| `LWDT_PROP_BY_IDX(node, prop, i)` | 读取数组属性的第 `i` 项。 |
| `LWDT_PROP_LEN(node, prop)` | 获取数组属性长度。 |
| `LWDT_PROP_NODE(node, prop)` | 解析 phandle 式节点引用。 |
| `LWDT_PROP_PHANDLE(node, prop)` | 获取 phandle 形式的节点引用。 |
| `LWDT_LABEL(node)` | 获取节点标签字符串。 |

## compatible 实例宏

| 宏 | 说明 |
| --- | --- |
| `LWDT_INST(i, compat)` | 获取指定 compatible 的第 `i` 个实例节点。 |
| `LWDT_INST_PROP(i, compat, prop)` | 获取指定实例的属性。 |
| `LWDT_INST_FOREACH_STATUS_OKAY(c, m)` | 对所有 `status: "okay"` 实例展开宏。 |