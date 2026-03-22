idf_component_register(SRCS "blink_example_main.c"
                       INCLUDE_DIRS "." "${CMAKE_SOURCE_DIR}/../include")

# Ensure device tree header is generated before building main component
add_dependencies(${COMPONENT_LIB} lwdt_generate)

