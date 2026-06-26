idf_component_register(SRCS "blink_example_main.c" "subsys1.c"
                       INCLUDE_DIRS "."
                       REQUIRES lwdt driver
                       PRIV_REQUIRES esp_driver_gpio
                       WHOLE_ARCHIVE TRUE)

add_dependencies(${COMPONENT_LIB} lwdt_generate)
