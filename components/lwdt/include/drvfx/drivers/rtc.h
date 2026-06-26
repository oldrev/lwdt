#pragma once

/* Include core drvfx definitions (struct drvfx_device, kernel helpers, etc.) */
#include <errno.h>

#ifdef __cplusplus
extern "C" {
#endif

struct drvfx_device;

/**
 * rtc_driver_api - Real Time Clock driver API
 *
 * This structure contains pointers to the driver-specific implementations
 * of the RTC user-facing functions. Drivers should populate an instance of
 * this structure and register it with their device instance so callers can
 * use the common inline wrappers below.
 */
struct rtc_driver_api {
    /**
     * Read the current date/time from the device.
     *
     * @param dev   Pointer to the drvfx device instance.
     * @param now   Output pointer to a struct tm to receive the current time.
     * @return 0 on success, negative on error.
     */
    int (*now)(const struct drvfx_device* dev, struct tm* now);

    /**
     * Set the device date/time.
     *
     * @param dev   Pointer to the drvfx device instance.
     * @param now   Pointer to a struct tm containing the desired time.
     * @return 0 on success, negative on error.
     */
    int (*set_datetime)(const struct drvfx_device* dev, const struct tm* now);

    /**
     * Query whether the RTC oscillator/clock is halted.
     *
     * @param dev     Pointer to the drvfx device instance.
     * @param halted  Output boolean set to true if halted, false otherwise.
     * @return 0 on success, negative on error.
     */
    int (*is_halted)(const struct drvfx_device* dev, bool* halted);

    /**
     * Halt/stop the RTC (if supported by the hardware).
     *
     * @param dev   Pointer to the drvfx device instance.
     * @return 0 on success, negative on error.
     */
    int (*halt)(const struct drvfx_device* dev);
};

/**
 * rtc_now - Read current RTC time
 *
 * This is a convenience inline wrapper that forwards to the registered
 * driver's `now` implementation.
 *
 * @param dev   Pointer to the drvfx device instance.
 * @param now   Output pointer to struct tm that will be filled with the
 *              current date/time. tm_isdst should be set to -1 if unknown.
 * @return 0 on success, negative on failure.
 */
__SYSCALL int rtc_now(const struct drvfx_device* dev, struct tm* now)
{
    const struct rtc_driver_api* api = dev ? dev->api : NULL;
    if (api == NULL) {
        return -ENOSYS;
    }
    return api->now(dev, now);
}

/**
 * rtc_set_datetime - Set the RTC date/time
 *
 * Inline wrapper that forwards to the driver's `set_datetime` method.
 *
 * @param dev   Pointer to the drvfx device instance.
 * @param now   Pointer to a struct tm containing the desired date/time.
 * @return 0 on success, negative on error.
 */
__SYSCALL int rtc_set_datetime(const struct drvfx_device* dev, const struct tm* now)
{
    const struct rtc_driver_api* api = dev ? dev->api : NULL;
    if (api == NULL) {
        return -ENOSYS;
    }
    return api->set_datetime(dev, now);
}

/**
 * rtc_is_halted - Check whether the RTC is halted
 *
 * Inline wrapper that forwards to the driver's `is_halted` method.
 *
 * @param dev     Pointer to the drvfx device instance.
 * @param halted  Output boolean set to true if the RTC is halted.
 * @return 0 on success, negative on error.
 */
__SYSCALL int rtc_is_halted(const struct drvfx_device* dev, bool* halted)
{
    const struct rtc_driver_api* api = dev ? dev->api : NULL;
    if (api == NULL) {
        return -ENOSYS;
    }
    return api->is_halted(dev, halted);
}

/**
 * rtc_halt - Halt/stop the RTC
 *
 * Inline wrapper that forwards to the driver's `halt` implementation.
 *
 * @param dev   Pointer to the drvfx device instance.
 * @return 0 on success, negative on error.
 */
__SYSCALL int rtc_halt(const struct drvfx_device* dev)
{
    const struct rtc_driver_api* api = dev ? dev->api : NULL;
    if (api == NULL) {
        return -ENOSYS;
    }
    return api->halt(dev);
}

#ifdef __cplusplus
}
#endif