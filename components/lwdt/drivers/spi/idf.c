#include <driver/spi_master.h>
#include <esp_log.h>
#include <freertos/FreeRTOS.h>
#include <freertos/semphr.h>

#include "drvfx/drivers/spi.h"
#include "drvfx/drvfx.h"
#include "lwdt/lwdt.h"
#include "lwdt_generated.h"

#define TAG "drvfx.spi"

struct drvfx_spi_idf_config {
    spi_host_device_t host;
    int mosi_gpio;
    int miso_gpio;
    int sclk_gpio;
    int max_transfer_sz;
};

struct drvfx_spi_idf_data {
    SemaphoreHandle_t lock;
    StaticSemaphore_t lock_buf;
};

static int drvfx_spi_idf_acquire_impl(const struct drvfx_device* dev, const struct drvfx_spi_device_config* config,
                                      void** handle)
{
    struct drvfx_spi_idf_data* data = (struct drvfx_spi_idf_data*)dev->data;
    if ((config == NULL) || (handle == NULL)) {
        return -EINVAL;
    }

    if (xSemaphoreTake(data->lock, portMAX_DELAY) != pdTRUE) {
        return -1;
    }

    spi_device_interface_config_t device_config = {
        .clock_speed_hz = (int)config->clock_hz,
        .mode = config->mode,
        .spics_io_num = config->cs_gpio,
        .queue_size = config->queue_size == 0 ? 1 : config->queue_size,
        .command_bits = config->command_bits,
        .address_bits = config->address_bits,
    };

    const struct drvfx_spi_idf_config* bus_config = (const struct drvfx_spi_idf_config*)dev->config;
    spi_device_handle_t spi_handle = NULL;
    esp_err_t rc = spi_bus_add_device(bus_config->host, &device_config, &spi_handle);
    xSemaphoreGive(data->lock);
    if (rc != ESP_OK) {
        ESP_LOGE(TAG, "Failed to acquire SPI device on %s: %s", dev->name, esp_err_to_name(rc));
        return rc;
    }

    *handle = spi_handle;
    return 0;
}

static int drvfx_spi_idf_release_impl(const struct drvfx_device* dev, void* handle)
{
    struct drvfx_spi_idf_data* data = (struct drvfx_spi_idf_data*)dev->data;
    if (handle == NULL) {
        return -EINVAL;
    }

    if (xSemaphoreTake(data->lock, portMAX_DELAY) != pdTRUE) {
        return -1;
    }

    esp_err_t rc = spi_bus_remove_device((spi_device_handle_t)handle);
    xSemaphoreGive(data->lock);
    return rc;
}

static int drvfx_spi_idf_transceive_impl(const struct drvfx_device* dev, void* handle, const void* tx_buf, void* rx_buf,
                                         size_t len)
{
    struct drvfx_spi_idf_data* data = (struct drvfx_spi_idf_data*)dev->data;
    if ((handle == NULL) || (len == 0)) {
        return -EINVAL;
    }

    if (xSemaphoreTake(data->lock, portMAX_DELAY) != pdTRUE) {
        return -1;
    }

    spi_transaction_t transaction = {
        .length = len * 8,
        .tx_buffer = tx_buf,
        .rx_buffer = rx_buf,
    };
    esp_err_t rc = spi_device_transmit((spi_device_handle_t)handle, &transaction);
    xSemaphoreGive(data->lock);
    return rc;
}

static int drvfx_spi_idf_init(const struct drvfx_device* dev)
{
    const struct drvfx_spi_idf_config* config = (const struct drvfx_spi_idf_config*)dev->config;
    struct drvfx_spi_idf_data* data = (struct drvfx_spi_idf_data*)dev->data;

    data->lock = xSemaphoreCreateMutexStatic(&data->lock_buf);
    if (data->lock == NULL) {
        return -1;
    }

    spi_bus_config_t bus_config = {
        .mosi_io_num = config->mosi_gpio,
        .miso_io_num = config->miso_gpio,
        .sclk_io_num = config->sclk_gpio,
        .quadwp_io_num = -1,
        .quadhd_io_num = -1,
        .max_transfer_sz = config->max_transfer_sz,
    };

    esp_err_t rc = spi_bus_initialize(config->host, &bus_config, SPI_DMA_CH_AUTO);
    if (rc != ESP_OK) {
        ESP_LOGE(TAG, "Failed to initialize %s: %s", dev->name, esp_err_to_name(rc));
        return rc;
    }

    return 0;
}

static const struct drvfx_spi_driver_api s_spi_api = {
    .acquire = drvfx_spi_idf_acquire_impl,
    .release = drvfx_spi_idf_release_impl,
    .transceive = drvfx_spi_idf_transceive_impl,
};

#define DRVFX_SPI_IDF_DEFINE(inst, node_id)                                                                            \
    static const struct drvfx_spi_idf_config s_spi_##inst##_config = {                                                 \
        .host = (spi_host_device_t)LWDT_PROP(node_id, host),                                                           \
        .mosi_gpio = LWDT_PROP(node_id, mosi_gpio),                                                                    \
        .miso_gpio = LWDT_PROP(node_id, miso_gpio),                                                                    \
        .sclk_gpio = LWDT_PROP(node_id, sclk_gpio),                                                                    \
        .max_transfer_sz = LWDT_PROP(node_id, max_transfer_size),                                                      \
    };                                                                                                                 \
    static struct drvfx_spi_idf_data s_spi_##inst##_data = { 0 };                                                      \
    DRVFX_DEVICE_DT_INST_DEFINE(inst, esp32_spi, LWDT_LABEL(node_id), drvfx_spi_idf_init,                       \
                                &s_spi_##inst##_data, &s_spi_##inst##_config, PRE_KERNEL_2,                           \
                                DRVFX_INIT_PRE_KERNEL_2_BUS_PRIORITY, &s_spi_api);

#ifdef LWDT_INST_FOREACH_STATUS_OKAY_esp32_spi
LWDT_INST_FOREACH_STATUS_OKAY(esp32_spi, DRVFX_SPI_IDF_DEFINE)
#endif
