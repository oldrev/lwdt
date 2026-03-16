#pragma once

/**
 * @file lwdt.h
 * @brief Lightweight DeviceTree helper macros (inspired by Zephyr DT_ macros).
 *
 * This header wraps the generated device tree header and provides a small set
 * of convenience macros for accessing node properties and array lengths.
 *
 * Example:
 * @code{.c}
 * #include "lwdt.h"
 *
 * for (int i = 0; i < LWDT_PROP_LEN(LWDT_NODE2(lighting, status_rgb), pwms); i++) {
 *     // NOTE: index must be a compile-time literal
 *     int val = LWDT_PROP_BY_IDX_PATH2(lighting, status_rgb, pwms, 0);
 * }
 * @endcode
 */

/* Node helpers */
#define LWDT_NODE(node) node

/* Zephyr-style helpers: build node identifiers from path segments. */
#define LWDT_NODE2(a, b) LWDT_NS_##a##_S_##b
#define LWDT_NODE3(a, b, c) LWDT_NS_##a##_S_##b##_S_##c
#define LWDT_NODE4(a, b, c, d) LWDT_NS_##a##_S_##b##_S_##c##_S_##d

/* Label-based node lookup (similar to Zephyr LWDT_NODELABEL()).
 * The generator emits LWDT_NODELABEL_<label> for any node with a `label`.
 * Usage: `#define I2C0_NODE LWDT_NODELABEL(i2c0)`.
 */
#define LWDT_NODELABEL(label) LWDT_NODELABEL_##label

/* Property helpers for node labels (avoid spelling out the full LWDT_NS_... token). */
#define LWDT_PROP_NODELABEL(label, prop) LWDT_NODELABEL_##label##_P_##prop
#define LWDT_PROP_LEN_NODELABEL(label, prop) LWDT_NODELABEL_##label##_P_##prop##_LEN
#define LWDT_PROP_BY_IDX_NODELABEL(label, prop, idx) LWDT_NODELABEL_##label##_P_##prop##_IDX_##idx

/* LWDT_INST-like helpers (instance + compatible), similar to Zephyr LWDT_INST().
 * Requires the generator to emit LWDT_NS_INST_<n>_<compat> for each compatible.
 */
#define LWDT_INST(n, compat) LWDT_NS_INST_##n##_##compat
#define LWDT_INST_PROP(n, compat, prop) LWDT_PROP(LWDT_INST(n, compat), prop)
#define LWDT_INST_PROP_BY_IDX(n, compat, prop, idx) LWDT_PROP_BY_IDX(LWDT_INST(n, compat), prop, idx)

/* Iterate over all instances of a compatible (LWDT_INST_FOREACH style). */
#define LWDT_INST_FOREACH(compat, macro) DT_INST_FOREACH_##compat(macro)

/* Property helpers */
#define LWDT_PROP(node, prop) LWDT_PROP_IMPL(node, prop)
#define LWDT_PROP_IMPL(node, prop) node##_P_##prop
#define LWDT_PROP_LEN(node, prop) node##_P_##prop##_LEN

/* Zephyr-style combined path+property macros */
#define LWDT_PROP_PATH2(a, b, prop) LWDT_NS_##a##_S_##b##_P_##prop
#define LWDT_PROP_PATH3(a, b, c, prop) LWDT_NS_##a##_S_##b##_S_##c##_P_##prop
#define LWDT_PROP_PATH4(a, b, c, d, prop) LWDT_NS_##a##_S_##b##_S_##c##_S_##d##_P_##prop

/* Access a property array element by a compile-time constant index. */
#define LWDT_PROP_BY_IDX(node, prop, idx) LWDT_PROP_BY_IDX_IMPL(node, prop, idx)
#define LWDT_PROP_BY_IDX_IMPL(node, prop, idx) node##_P_##prop##_IDX_##idx
#define LWDT_PROP_BY_IDX_PATH2(a, b, prop, idx) LWDT_NS_##a##_S_##b##_P_##prop##_IDX_##idx
#define LWDT_PROP_BY_IDX_PATH3(a, b, c, prop, idx) LWDT_NS_##a##_S_##b##_S_##c##_P_##prop##_IDX_##idx

/* Phandle / node reference helpers (node is a label-like token) */
#define LWDT_PROP_NODE(node, prop) node##_P_##prop##_NODE
#define LWDT_PROP_PHANDLE(node, prop) node##_P_##prop##_PHANDLE
#define LWDT_PROP_PH(node, prop) LWDT_PROP_PHANDLE(node, prop)

/* Zephyr-style phandle helpers */
#define LWDT_PROP_NODE_PATH2(a, b, prop) LWDT_NS_##a##_S_##b##_P_##prop##_NODE
#define LWDT_PROP_PHANDLE_PATH2(a, b, prop) LWDT_NS_##a##_S_##b##_P_##prop##_PHANDLE
#define LWDT_PROP_PH_PATH2(a, b, prop) LWDT_PROP_PHANDLE_PATH2(a, b, prop)