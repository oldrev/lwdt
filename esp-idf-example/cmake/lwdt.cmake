# lwdt.cmake - ESP-IDF 项目 LWDT 头自动生成
# 放到 esp-idf-example/cmake/, 在 CMakeLists.txt 用 `include(lwdt)` 引入

if(NOT DEFINED Python3_EXECUTABLE)
    find_package(Python3 REQUIRED COMPONENTS Interpreter)
endif()

# 默认 board.lwdt（可由外部覆盖）
if(NOT DEFINED LWDT_BOARD_FILE)
    set(LWDT_BOARD_FILE "${CMAKE_SOURCE_DIR}/boards/esp32c3supermini.lwdt" CACHE FILEPATH "LWDT board device tree file")
endif()

if(NOT DEFINED LWDT_HEADER_OUT)
    set(LWDT_HEADER_OUT "${CMAKE_SOURCE_DIR}/main/lwdt_generated.h" CACHE FILEPATH "LWDT generated header file")
endif()

if(NOT DEFINED LWDT_BASEDIR)
    set(LWDT_BASEDIR "${CMAKE_SOURCE_DIR}/../dt" CACHE PATH "LWDT include base dir")
endif()

add_custom_command(
    OUTPUT "${LWDT_HEADER_OUT}"
    COMMAND ${CMAKE_COMMAND} -E make_directory "${CMAKE_SOURCE_DIR}/main"
    COMMAND ${Python3_EXECUTABLE} "${CMAKE_SOURCE_DIR}/../lwdt2h.py" --basedir "${LWDT_BASEDIR}" -o "${LWDT_HEADER_OUT}" "${LWDT_BOARD_FILE}"
    DEPENDS "${CMAKE_SOURCE_DIR}/../lwdt2h.py" "${LWDT_BOARD_FILE}"
    COMMENT "Generating LWDT header for esp-idf-example"
    VERBATIM
)

add_custom_target(lwdt_generate ALL DEPENDS "${LWDT_HEADER_OUT}")
