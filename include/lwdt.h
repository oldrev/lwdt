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
 * for (int i = 0; i < LWDT_PROP_LEN(LWDT_NS_lighting_S_status_rgb, pwms); i++) {
 *     // NOTE: index must be a compile-time literal
 *     int val = LWDT_PROP_BY_IDX(LWDT_NS_lighting_S_status_rgb, pwms, 0);
 * }
 * @endcode
 */

#include "devicetree_generated.h"

/* Node helpers */
#define LWDT_NODE(node) LWDT_##node

/* Property helpers */
#define LWDT_PROP(node, prop) LWDT_##node##_P_##prop
#define LWDT_PROP_LEN(node, prop) LWDT_##node##_P_##prop##_LEN

/* Access a property array element by a compile-time constant index. */
#define LWDT_PROP_BY_IDX(node, prop, idx) LWDT_##node##_P_##prop##_IDX_##idx##_VAL

/* Phandle / node reference helpers (node is a label-like token) */
#define LWDT_PROP_NODE(node, prop) LWDT_##node##_P_##prop##_NODE
#define LWDT_PROP_PH(node, prop) LWDT_##node##_P_##prop##_PH