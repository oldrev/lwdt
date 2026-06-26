#pragma once

#ifdef __cplusplus
extern "C" {
#endif

#if defined(CONFIG_ASAN) && defined(__clang__)
#define __DRVFX_NOASAN __attribute__((no_sanitize("address")))
#else
#define __DRVFX_NOASAN /**/
#endif

#define DRVFX_USED __attribute__((__used__))
#define DRVFX_UNUSED __attribute__((__unused__))
#define DRVFX_MAYBE_UNUSED __attribute__((__unused__))

#ifndef __aligned
#define __aligned(x) __attribute__((__aligned__(x)))
#endif

#define DRVFX_DECL_ALIGN(type) __aligned(__alignof(type)) type

#ifdef __cplusplus
}
#endif