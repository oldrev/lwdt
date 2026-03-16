#include <stdio.h>
#include "devicetree_generated.h"

int main(void) {
    printf("lighting.status_rgb pwms[0]=%s\n", LWDT_NS_lighting_S_status_rgb_P_pwms_IDX_0);
    printf("lighting.status_rgb enable_gpios pin=%d\n", LWDT_NS_lighting_S_status_rgb_P_enable_gpios_PIN);
    printf("soc.i2c0 status=%s (enabled=%d)\n", LWDT_NS_soc_S_i2c0_STATUS, LWDT_NS_soc_S_i2c0_ENABLED);
    printf("pcf8563 rtc compatible=%s\n", LWDT_NS_soc_S_i2c0_P_pcf8563_rtc_compatible);
    printf("pcf8563 rtc i2c address=0x%s\n", LWDT_NS_soc_S_i2c0_P_pcf8563_rtc_reg_IDX_0);
    return 0;
}
