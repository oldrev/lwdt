#include <stdbool.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "driver/gpio.h"
#include "esp_log.h"
#include <lwdt/lwdt.h>
#include "lwdt_generated.h"

static const char *TAG = "example";

#ifndef LWDT_NS_board_P_led_gpio
#error "No board LED GPIO defined in device tree"
#endif

#define BLINK_GPIO LWDT_NS_board_P_led_gpio

#if defined(LWDT_NS_board_P_led_active_low)
#define LED_ACTIVE_LOW LWDT_NS_board_P_led_active_low
#else
#define LED_ACTIVE_LOW 0
#endif

#if defined(LWDT_NS_board_P_led_name)
#define LED_BOARD_NAME LWDT_NS_board_P_led_name
#else
#define LED_BOARD_NAME "unknown"
#endif

static bool s_led_on;

static void blink_led(void)
{
    gpio_set_level(BLINK_GPIO, LED_ACTIVE_LOW ? !s_led_on : s_led_on);
}

static void configure_led(void)
{
    ESP_LOGI(TAG, "Blinking board LED on %s (GPIO %d)", LED_BOARD_NAME, BLINK_GPIO);
    gpio_reset_pin(BLINK_GPIO);
    gpio_set_direction(BLINK_GPIO, GPIO_MODE_OUTPUT);
}

void app_main(void)
{
    configure_led();

    while (1) {
        ESP_LOGI(TAG, "Turning the LED %s!", s_led_on ? "ON" : "OFF");
        blink_led();
        s_led_on = !s_led_on;
        vTaskDelay(pdMS_TO_TICKS(500));
    }
}
