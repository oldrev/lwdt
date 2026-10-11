# Compile-Time Device Tree Macros

Include both headers in component source:

```c
#include <lwdt/lwdt.h>
#include "lwdt_generated.h"
```

## Nodes and Properties

| Macro | Description |
| --- | --- |
| `LWDT_NODELABEL(label)` | Get a node ID by label. |
| `LWDT_NODE2(a, b)` | Build a node ID from path segments, such as `soc/i2c0`. |
| `LWDT_NODE_EXISTS(node)` | Check node presence; usable in `#if`. |
| `LWDT_PROP(node, prop)` | Read a scalar property constant. |
| `LWDT_PROP_EXISTS(node, prop)` | Check property presence. |
| `LWDT_PROP_BY_IDX(node, prop, i)` | Read array item at index `i`. |
| `LWDT_PROP_LEN(node, prop)` | Get array property length. |
| `LWDT_PROP_NODE(node, prop)` | Resolve phandle-style node reference. |
| `LWDT_PROP_PHANDLE(node, prop)` | Get a phandle-form node reference. |
| `LWDT_LABEL(node)` | Get a node label string. |

## compatible Instance Macros

| Macro | Description |
| --- | --- |
| `LWDT_INST(i, compat)` | Get the `i`th instance node for a compatible. |
| `LWDT_INST_PROP(i, compat, prop)` | Get a property of the `i`th instance. |
| `LWDT_INST_FOREACH_STATUS_OKAY(c, m)` | Expand macro for each instance with `status: "okay"`. |