#pragma once

#ifdef __cplusplus
extern "C" {
#endif

struct drvfx_device;

/** @brief Structure to store initialization entry information. */
struct drvfx_init_entry {
    int (*init)(const struct drvfx_device* dev);
    const struct drvfx_device* dev;
};

/*
Available level:
    * EARLY
    * PRE_KERNEL_1
    * PRE_KERNEL_2
    * POST_KERNEL
    * APPLICATION
*/

/*
 * Priority values intentionally follow Zephyr's 0-99 convention within each
 * initialization level. Lower numbers run first inside the same level.
 */
#define DRVFX_INIT_EARLY_DEFAULT_PRIORITY 00

#define DRVFX_INIT_PRE_KERNEL_1_DEFAULT_PRIORITY 00
#define DRVFX_INIT_PRE_KERNEL_1_TIMER_PRIORITY 10
#define DRVFX_INIT_PRE_KERNEL_1_GPIO_PRIORITY 50

#define DRVFX_INIT_PRE_KERNEL_2_BUS_PRIORITY 50
#define DRVFX_INIT_PRE_KERNEL_2_STORAGE_PRIORITY 80

#define DRVFX_INIT_POST_KERNEL_CONSOLE_PRIORITY 30
#define DRVFX_INIT_POST_KERNEL_DEVICE_PRIORITY 50
#define DRVFX_INIT_POST_KERNEL_NETWORK_CONTROLLER_PRIORITY 60
#define DRVFX_INIT_POST_KERNEL_NETIF_PRIORITY 70

#define DRVFX_INIT_APPLICATION_MIDDLEWARE_PRIORITY 90
#define DRVFX_INIT_APPLICATION_USER_PRIORITY 99

/* Backward-compatible aliases. Prefer the level-specific names above. */
#define DRVFX_INIT_PRE_KERNEL_DEFAULT_PRIORITY DRVFX_INIT_PRE_KERNEL_1_DEFAULT_PRIORITY
#define DRVFX_INIT_KERNEL_DEFAULT_PRIORITY DRVFX_INIT_PRE_KERNEL_1_TIMER_PRIORITY
#define DRVFX_INIT_DRIVER_DEFAULT_PRIORITY DRVFX_INIT_PRE_KERNEL_2_BUS_PRIORITY
#define DRVFX_INIT_POST_KERNEL_HIGH_PRIORITY DRVFX_INIT_POST_KERNEL_CONSOLE_PRIORITY
#define DRVFX_INIT_POST_KERNEL_DEFAULT_PRIORITY DRVFX_INIT_POST_KERNEL_DEVICE_PRIORITY
#define DRVFX_INIT_POST_KERNEL_LOW_PRIORITY DRVFX_INIT_POST_KERNEL_NETIF_PRIORITY
#define DRVFX_INIT_APP_HIGHEST_PRIORITY DRVFX_INIT_APPLICATION_MIDDLEWARE_PRIORITY
#define DRVFX_INIT_APP_HIGH_PRIORITY DRVFX_INIT_APPLICATION_MIDDLEWARE_PRIORITY
#define DRVFX_INIT_APP_DEFAULT_PRIORITY DRVFX_INIT_APPLICATION_MIDDLEWARE_PRIORITY
#define DRVFX_INIT_APP_LOW_PRIORITY DRVFX_INIT_APPLICATION_USER_PRIORITY
#define DRVFX_INIT_APP_LOWEST_PRIORITY DRVFX_INIT_APPLICATION_USER_PRIORITY

#define DRVFX_INIT_ENTRY_NAME(init_id) _CONCAT(__init_, init_id)

#define DRVFX_INIT_ENTRY_SECTION(level, prio)                                                                          \
    __attribute__((__section__(".drvfx_init_" #level "." _STRINGIFY(prio) "_"), used))

#define DRVFX_INIT_ENTRY_DEFINE(init_id, init_fn, device, level, prio)                                                 \
    static const DRVFX_DECL_ALIGN(struct drvfx_init_entry) DRVFX_INIT_ENTRY_SECTION(level, prio)                       \
        DRVFX_USED __DRVFX_NOASAN                                                                                      \
        DRVFX_INIT_ENTRY_NAME(init_id)                                                                                 \
        = {                                                                                                            \
              .init = (init_fn),                                                                                       \
              .dev = (device),                                                                                         \
          }

#define DRVFX_SYS_INIT(init_fn, level, prio) DRVFX_SYS_INIT_NAMED(init_fn, init_fn, level, prio)

#define DRVFX_SYS_INIT_NAMED(name, init_fn, level, prio) DRVFX_INIT_ENTRY_DEFINE(name, init_fn, NULL, level, prio)

#define DRVFX_SUBSYS_INIT(init_fn, prio) DRVFX_SYS_INIT_NAMED(init_fn, init_fn, POST_KERNEL, prio)

#define DRVFX_SUBSYS_INIT_NAMED(name, init_fn, prio) DRVFX_INIT_ENTRY_DEFINE(name, init_fn, NULL, POST_KERNEL, prio)

#ifdef __cplusplus
}
#endif