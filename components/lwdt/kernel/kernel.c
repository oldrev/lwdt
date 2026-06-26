#include <memory.h>

#include <esp_err.h>
#include <esp_event.h>
#include <esp_log.h>

#include "drvfx/drvfx.h"

#define TAG "kernel"

ESP_EVENT_DEFINE_BASE(KERNEL_EVENTS);

struct kernel {
    kernel_mode_t mode;
    uint32_t shutdown_reason;
};

static struct kernel s_kernel;

static esp_err_t k_ensure_default_event_loop(void)
{
    esp_err_t rc = esp_event_loop_create_default();
    if (rc == ESP_OK || rc == ESP_ERR_INVALID_STATE) {
        return ESP_OK;
    }

    ESP_LOGE(TAG, "Failed to create default event loop: %s", esp_err_to_name(rc));
    return rc;
}

void k_init()
{
    memset(&s_kernel, 0, sizeof(s_kernel));
}

kernel_mode_t k_get_mode() { return s_kernel.mode; }
uint32_t k_get_shutdown_reason() { return s_kernel.shutdown_reason; }

void k_safe_mode(uint32_t reason)
{
    ESP_LOGW(TAG, "System malfunction (%u), entering protection mode.", reason);
    s_kernel.mode = KERNEL_MODE_SAFE;
    s_kernel.shutdown_reason = reason;

    esp_err_t rc = k_ensure_default_event_loop();
    if (rc == ESP_OK) {
        rc = esp_event_post(KERNEL_EVENTS, KERNEL_EVENT_ENTERING_SAFE_MODE, NULL, 0, portMAX_DELAY);
    }
    if (rc != ESP_OK) {
        ESP_LOGE(TAG, "Failed to send safe mode message: %s", esp_err_to_name(rc));
    }
}

void k_ready()
{
    if (s_kernel.mode != KERNEL_MODE_INIT) {
        ESP_LOGE(TAG, "Bad kernel mode: %u", s_kernel.mode);
    }
    s_kernel.mode = KERNEL_MODE_NORMAL;

    esp_err_t rc = k_ensure_default_event_loop();
    if (rc == ESP_OK) {
        rc = esp_event_post(KERNEL_EVENTS, KERNEL_EVENT_READY, NULL, 0, portMAX_DELAY);
    }
    if (rc != ESP_OK) {
        ESP_LOGE(TAG, "Failed to send normal mode message: %s", esp_err_to_name(rc));
    }
}