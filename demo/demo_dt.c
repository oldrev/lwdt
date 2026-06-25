#include <stdio.h>
#include "lwdt_generated.h"
#include "lwdt.h"

#define STATUS_RGB_NODE LWDT_NODELABEL(status_rgb)
#define I2C0_NODE LWDT_NODELABEL(i2c0)

#define PRINT_PCF_INST(idx, node) \
    do { \
        printf("pcf8563[%d] compatible=%s, reg=0x%d\n", (idx), \
               LWDT_PROP(node, compatible), \
               LWDT_PROP_BY_IDX(node, reg, 0)); \
    } while (0)

int main(void) {
    printf("lighting.status_rgb pwms[0]=%s\n",
           LWDT_PROP_BY_IDX_NODELABEL(status_rgb, pwms, 0));
    printf("lighting.status_rgb enable_gpios pin=%d\n",
           LWDT_PROP_NODELABEL(status_rgb, enable_gpios_PIN));
    printf("soc.i2c0 status=%s (enabled=%d)\n",
           LWDT_PROP_NODELABEL(i2c0, status),
           LWDT_PROP_NODELABEL(i2c0, enabled));

    LWDT_INST_FOREACH(nxp_pcf8563, PRINT_PCF_INST);

    return 0;
}
