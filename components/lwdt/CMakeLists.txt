set(LWDT_ROOT "${CMAKE_CURRENT_LIST_DIR}")
set(LWDT_TOOL "${LWDT_ROOT}/lwdt2h.py")
set(LWDT_BOARD_ROOT "${PROJECT_DIR}/boards")
set(LWDT_GENERATED_HEADER "${CMAKE_CURRENT_BINARY_DIR}/lwdt_generated.h")

if(NOT EXISTS "${LWDT_TOOL}")
    message(FATAL_ERROR "lwdt generator not found: ${LWDT_TOOL}")
endif()

set(_LWDT_BOARD_ID "")
if(DEFINED LWDT_BOARD_ID AND NOT "${LWDT_BOARD_ID}" STREQUAL "")
    set(_LWDT_BOARD_ID "${LWDT_BOARD_ID}")
elseif(DEFINED ENV{LWDT_BOARD_ID} AND NOT "$ENV{LWDT_BOARD_ID}" STREQUAL "")
    set(_LWDT_BOARD_ID "$ENV{LWDT_BOARD_ID}")
endif()

if("${_LWDT_BOARD_ID}" STREQUAL "")
    message(FATAL_ERROR "LWDT_BOARD_ID must be set via -DLWDT_BOARD_ID=<vendor>/<model> or environment variable LWDT_BOARD_ID")
endif()

string(REPLACE "\\" "/" LWDT_BOARD_ID "${_LWDT_BOARD_ID}")
if(IS_ABSOLUTE "${LWDT_BOARD_ID}")
    message(FATAL_ERROR "LWDT_BOARD_ID must be a relative board path under ${LWDT_BOARD_ROOT}: ${LWDT_BOARD_ID}")
endif()
if("${LWDT_BOARD_ID}" MATCHES "(^|/)\\.\\.(/|$)")
    message(FATAL_ERROR "LWDT_BOARD_ID must not contain '..': ${LWDT_BOARD_ID}")
endif()

set(LWDT_BOARD_DIR "${LWDT_BOARD_ROOT}/${LWDT_BOARD_ID}")
set(LWDT_BOARD_FILE "${LWDT_BOARD_DIR}/board.lwdt")
if(NOT EXISTS "${LWDT_BOARD_FILE}")
    message(FATAL_ERROR "LWDT board definition not found for board '${LWDT_BOARD_ID}': ${LWDT_BOARD_FILE}")
endif()

if(NOT DEFINED LWDT_BASEDIR)
    set(LWDT_BASEDIR "${LWDT_ROOT}/dt")
endif()

find_package(Python3 REQUIRED COMPONENTS Interpreter)

file(GLOB_RECURSE LWDT_SRCS
    "kernel/*.c"
)

idf_component_register(
    SRCS ${LWDT_SRCS}
    INCLUDE_DIRS "include" "${CMAKE_CURRENT_BINARY_DIR}"
    REQUIRES driver esp_event esp_driver_i2c esp_driver_spi esp_timer
    LDFRAGMENTS kernel-linker.lf
    WHOLE_ARCHIVE TRUE
)

add_custom_command(
    OUTPUT "${LWDT_GENERATED_HEADER}"
    COMMAND ${CMAKE_COMMAND} -E make_directory "${CMAKE_CURRENT_BINARY_DIR}"
    COMMAND ${Python3_EXECUTABLE} "${LWDT_TOOL}" --basedir "${LWDT_BASEDIR}" -o "${LWDT_GENERATED_HEADER}" "${LWDT_BOARD_FILE}"
    DEPENDS "${LWDT_TOOL}" "${LWDT_BOARD_FILE}"
    COMMENT "Generating LWDT header for board '${LWDT_BOARD_ID}'"
    VERBATIM
)

add_custom_target(lwdt_generate DEPENDS "${LWDT_GENERATED_HEADER}")

add_dependencies(${COMPONENT_LIB} lwdt_generate)
