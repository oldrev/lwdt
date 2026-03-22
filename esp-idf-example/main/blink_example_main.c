/* Blink Example

   This example code is in the Public Domain (or CC0 licensed, at your option.)

   Unless required by applicable law or agreed to in writing, this
   software is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
   CONDITIONS OF ANY KIND, either express or implied.
*/
#include <stdio.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "driver/gpio.h"
#include "esp_log.h"
#include "sdkconfig.h"
#include "lwdt.h"
#include "lwdt_generated.h"

static const char *TAG = "example";

/* LED GPIO from lightweight device tree only (no CONFIG_BLINK_GPIO fallback). */
#if !defined(LWDT_NODELABEL_status_led_P_enable_gpios_PIN)
#error "No status_led pin defined in device tree; define LWDT_NODELABEL_status_led_P_enable_gpios_PIN"
#endif
#define BLINK_GPIO LWDT_NODELABEL_status_led_P_enable_gpios_PIN

static uint8_t s_led_state = 0;

#if defined(LWDT_NODELABEL_status_led_P_enable_gpios_FLAGS)
#define STATUS_LED_ACTIVE_LOW (LWDT_NODELABEL_status_led_P_enable_gpios_FLAGS & 1)
#else
#define STATUS_LED_ACTIVE_LOW 0
#endif

static void blink_led(void)
{
    /* Set the GPIO level according to the state (LOW or HIGH) */
    int out_level = STATUS_LED_ACTIVE_LOW ? !s_led_state : s_led_state;
    gpio_set_level(BLINK_GPIO, out_level);
}

static void blink_led(void)
{
    /* Set the GPIO level according to the state (LOW or HIGH) */
    int out_level = STATUS_LED_ACTIVE_LOW ? !s_led_state : s_led_state;
    gpio_set_level(BLINK_GPIO, out_level);
}

static void configure_led(void)
{
    ESP_LOGI(TAG, "Example configured to blink GPIO LED!");
    gpio_reset_pin(BLINK_GPIO);
    /* Set the GPIO as a push/pull output */
    gpio_set_direction(BLINK_GPIO, GPIO_MODE_OUTPUT);
}

void app_main(void)
{

    /* Configure the peripheral according to the LED type */
    configure_led();

    while (1) {
        ESP_LOGI(TAG, "Turning the LED %s!", s_led_state == true ? "ON" : "OFF");
        blink_led();
        /* Toggle the LED state */
        s_led_state = !s_led_state;
        vTaskDelay(CONFIG_BLINK_PERIOD / portTICK_PERIOD_MS);
    }
}
