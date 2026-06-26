#pragma once

#ifdef __cplusplus
extern "C" {
#endif

#define K_TRY(expression)                                                                                              \
    do {                                                                                                               \
        int _rc = (expression);                                                                                        \
        if (_rc != 0) {                                                                                                \
            return _rc;                                                                                                \
        }                                                                                                              \
    } while (0)

#define K_MUST(expression)                                                                                             \
    do {                                                                                                               \
        int _rc = (expression);                                                                                        \
        if (_rc != 0) {                                                                                                \
            abort();                                                                                                   \
        }                                                                                                              \
    } while (0)

#define K_TRY_OR_UNLOCK(expression, semi)                                                                              \
    do {                                                                                                               \
        int _rc = (expression);                                                                                        \
        if (_rc != 0) {                                                                                                \
            xSemaphoreGive(semi);                                                                                      \
            return _rc;                                                                                                \
        }                                                                                                              \
    } while (0)

#define K_TRY_WITH_MESSAGE(expression, msg)                                                                            \
    do {                                                                                                               \
        int _rc = (expression);                                                                                        \
        if (_rc != 0) {                                                                                                \
            ESP_LOGE("drvfx", "Error(%d): %s - %s:%d#%s", _rc, msg, __FILE__, __LINE__, __FUNCTION__);                 \
            return _rc;                                                                                                \
        }                                                                                                              \
    } while (0)

#ifdef __cplusplus
}
#endif