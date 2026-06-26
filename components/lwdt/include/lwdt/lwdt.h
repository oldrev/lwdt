#pragma once

/* Node helpers */
#define LWDT_NODE(node) node
#define LWDT_NODE_EXISTS(node) LWDT_NODE_EXISTS_IMPL(node)
#define LWDT_NODE_EXISTS_IMPL(node) node##_EXISTS

/* Zephyr-style helpers: build node identifiers from path segments. */
#define LWDT_NODE2(a, b) LWDT_NS_##a##_S_##b
#define LWDT_NODE3(a, b, c) LWDT_NS_##a##_S_##b##_S_##c
#define LWDT_NODE4(a, b, c, d) LWDT_NS_##a##_S_##b##_S_##c##_S_##d

/* Label-based node lookup. */
#define LWDT_NODELABEL(label) LWDT_NODELABEL_##label

/* Property helpers for node labels. */
#define LWDT_PROP_NODELABEL(label, prop) LWDT_NODELABEL_##label##_P_##prop
#define LWDT_PROP_LEN_NODELABEL(label, prop) LWDT_NODELABEL_##label##_P_##prop##_LEN
#define LWDT_PROP_BY_IDX_NODELABEL(label, prop, idx) LWDT_NODELABEL_##label##_P_##prop##_IDX_##idx

/* Instance helpers. */
#define LWDT_INST(n, compat) LWDT_NS_INST_##n##_##compat
#define LWDT_INST_PROP(n, compat, prop) LWDT_PROP(LWDT_INST(n, compat), prop)
#define LWDT_INST_PROP_BY_IDX(n, compat, prop, idx) LWDT_PROP_BY_IDX(LWDT_INST(n, compat), prop, idx)

/* Iterate over compatible instances. These are file-scope friendly. */
#define LWDT_INST_FOREACH(compat, macro) LWDT_INST_FOREACH_IMPL(compat, macro)
#define LWDT_INST_FOREACH_IMPL(compat, macro) LWDT_INST_FOREACH_##compat(macro)
#define LWDT_INST_FOREACH_STATUS_OKAY(compat, macro) LWDT_INST_FOREACH_STATUS_OKAY_IMPL(compat, macro)
#define LWDT_INST_FOREACH_STATUS_OKAY_IMPL(compat, macro) LWDT_INST_FOREACH_STATUS_OKAY_##compat(macro)

/* Zephyr-style aliases for driver code. */
#define DT_INST_FOREACH_STATUS_OKAY(compat, macro) LWDT_INST_FOREACH_STATUS_OKAY(compat, macro)
#define DT_INST_FOREACH(compat, macro) LWDT_INST_FOREACH(compat, macro)
#define DT_DRV_INST(inst, compat) LWDT_INST(inst, compat)
#define DT_INST_PROP(inst, compat, prop) LWDT_INST_PROP(inst, compat, prop)
#define DT_INST_NODE(inst, compat) LWDT_INST(inst, compat)

/* Node metadata helpers. */
#define LWDT_LABEL(node) LWDT_LABEL_IMPL(node)
#define LWDT_LABEL_IMPL(node) node##_LABEL
/* Property helpers. */
#define LWDT_PROP(node, prop) LWDT_PROP_IMPL(node, prop)
#define LWDT_PROP_IMPL(node, prop) node##_P_##prop
#define LWDT_PROP_EXISTS(node, prop) LWDT_PROP_EXISTS_IMPL(node, prop)
#define LWDT_PROP_EXISTS_IMPL(node, prop) node##_P_##prop##_EXISTS
#define LWDT_PROP_LEN(node, prop) LWDT_PROP_LEN_IMPL(node, prop)
#define LWDT_PROP_LEN_IMPL(node, prop) node##_P_##prop##_LEN

/* Path helpers. */
#define LWDT_PROP_PATH2(a, b, prop) LWDT_NS_##a##_S_##b##_P_##prop
#define LWDT_PROP_PATH3(a, b, c, prop) LWDT_NS_##a##_S_##b##_S_##c##_P_##prop
#define LWDT_PROP_PATH4(a, b, c, d, prop) LWDT_NS_##a##_S_##b##_S_##c##_S_##d##_P_##prop

/* Access by constant index. */
#define LWDT_PROP_BY_IDX(node, prop, idx) LWDT_PROP_BY_IDX_IMPL(node, prop, idx)
#define LWDT_PROP_BY_IDX_IMPL(node, prop, idx) node##_P_##prop##_IDX_##idx
#define LWDT_PROP_BY_IDX_PATH2(a, b, prop, idx) LWDT_NS_##a##_S_##b##_P_##prop##_IDX_##idx
#define LWDT_PROP_BY_IDX_PATH3(a, b, c, prop, idx) LWDT_NS_##a##_S_##b##_S_##c##_P_##prop##_IDX_##idx

/* Phandle / node reference helpers. */
#define LWDT_PROP_NODE(node, prop) LWDT_PROP_NODE_IMPL(node, prop)
#define LWDT_PROP_NODE_IMPL(node, prop) node##_P_##prop##_NODE
#define LWDT_PROP_PHANDLE(node, prop) LWDT_PROP_PHANDLE_IMPL(node, prop)
#define LWDT_PROP_PHANDLE_IMPL(node, prop) node##_P_##prop##_PHANDLE
#define LWDT_PROP_PH(node, prop) LWDT_PROP_PHANDLE(node, prop)

/* Zephyr-style phandle helpers. */
#define LWDT_PROP_NODE_PATH2(a, b, prop) LWDT_NS_##a##_S_##b##_P_##prop##_NODE
#define LWDT_PROP_PHANDLE_PATH2(a, b, prop) LWDT_NS_##a##_S_##b##_P_##prop##_PHANDLE
#define LWDT_PROP_PH_PATH2(a, b, prop) LWDT_PROP_PHANDLE_PATH2(a, b, prop)
