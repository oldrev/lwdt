#include <stdbool.h>

#include "driver/gpio.h"
#include "esp_err.h"
#include "esp_log.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

#include <lwdt/lwdt.h>
#include "lwdt_generated.h"

static const char* TAG = "lwdt.example";

#define BOARD_NODE LWDT_NODELABEL(board)

#if !LWDT_NODE_EXISTS(BOARD_NODE)
#error "Board node with label 'board' is missing from lwdt_generated.h"
#endif

#if !LWDT_PROP_EXISTS(BOARD_NODE, led_gpio)
#error "Board node must define led_gpio"
#endif

#define BLINK_GPIO LWDT_PROP(BOARD_NODE, led_gpio)

#if LWDT_PROP_EXISTS(BOARD_NODE, led_active_low)
#define LED_ACTIVE_LOW LWDT_PROP(BOARD_NODE, led_active_low)
#else
#define LED_ACTIVE_LOW 0
#endif

#if LWDT_PROP_EXISTS(BOARD_NODE, led_name)
#define LED_BOARD_NAME LWDT_PROP(BOARD_NODE, led_name)
#else
#define LED_BOARD_NAME "unnamed board LED"
#endif

static bool s_led_on;

static esp_err_t configure_led(void)
{
    ESP_LOGI(TAG, "board node: %s", LED_BOARD_NAME);
    ESP_LOGI(TAG, "led gpio=%d active_low=%d", BLINK_GPIO, LED_ACTIVE_LOW);

    esp_err_t err = gpio_reset_pin(BLINK_GPIO);
    if (err != ESP_OK) {
        ESP_LOGE(TAG, "gpio_reset_pin(%d) failed: %s", BLINK_GPIO, esp_err_to_name(err));
        return err;
    }

    err = gpio_set_direction(BLINK_GPIO, GPIO_MODE_OUTPUT);
    if (err != ESP_OK) {
        ESP_LOGE(TAG, "gpio_set_direction(%d) failed: %s", BLINK_GPIO, esp_err_to_name(err));
        return err;
    }

    return ESP_OK;
}

static void set_led(bool on)
{
    int level = LED_ACTIVE_LOW ? !on : on;
    esp_err_t err = gpio_set_level(BLINK_GPIO, level);
    if (err != ESP_OK) {
        ESP_LOGE(TAG, "gpio_set_level(%d, %d) failed: %s", BLINK_GPIO, level, esp_err_to_name(err));
        return;
    }

    ESP_LOGI(TAG, "LED %s gpio=%d level=%d", on ? "on" : "off", BLINK_GPIO, level);
}

void drvfx_app_main(void)
{
    if (configure_led() != ESP_OK) {
        return;
    }

    while (true) {
        set_led(s_led_on);
        s_led_on = !s_led_on;
        vTaskDelay(pdMS_TO_TICKS(500));
    }
}
