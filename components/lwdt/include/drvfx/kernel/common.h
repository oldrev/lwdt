#pragma once

#ifdef __cplusplus
extern "C" {
#endif

#define __WEAK __attribute__((weak))

#define _DO_STRINGIFY(x) #x
#define _STRINGIFY(s) _DO_STRINGIFY(s)

#define _DO_CONCAT(x, y) x##y
#define _CONCAT(x, y) _DO_CONCAT(x, y)

#ifdef __cplusplus
}
#endif