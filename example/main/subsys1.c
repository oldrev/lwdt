#include "esp_log.h"

#include "drvfx/drvfx.h"

static const char* TAG = "subsys1";

static int subsys1_init(const struct drvfx_device* dev)
{
    (void)dev;
    ESP_LOGI(TAG, "Hello! I'm `subsys1`!");
    return 0;
}

DRVFX_SUBSYS_INIT(subsys1_init, DRVFX_INIT_POST_KERNEL_DEVICE_PRIORITY);
