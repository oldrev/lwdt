cmake_minimum_required(VERSION 3.16)

set(EXTRA_COMPONENT_DIRS "${CMAKE_CURRENT_LIST_DIR}/../components")
set(LWDT_BASEDIR "${CMAKE_CURRENT_LIST_DIR}/../components/lwdt/dt" CACHE PATH "LWDT Jsonnet base dir")
set(LWDT_BOARD_ROOT "${CMAKE_CURRENT_LIST_DIR}/boards")

if(DEFINED LWDT_BOARD_ID AND NOT "${LWDT_BOARD_ID}" STREQUAL "")
    set(LWDT_BOARD_ID "${LWDT_BOARD_ID}" CACHE STRING "LWDT board id")
elseif(DEFINED ENV{LWDT_BOARD_ID} AND NOT "$ENV{LWDT_BOARD_ID}" STREQUAL "")
    set(LWDT_BOARD_ID "$ENV{LWDT_BOARD_ID}" CACHE STRING "LWDT board id")
endif()

if(NOT DEFINED LWDT_BOARD_ID OR "${LWDT_BOARD_ID}" STREQUAL "")
    message(FATAL_ERROR "LWDT_BOARD_ID must be set via -DLWDT_BOARD_ID=<vendor>/<model> or environment variable LWDT_BOARD_ID")
endif()

string(REPLACE "\\" "/" LWDT_BOARD_ID "${LWDT_BOARD_ID}")
if(IS_ABSOLUTE "${LWDT_BOARD_ID}")
    message(FATAL_ERROR "LWDT_BOARD_ID must be a relative board path under ${LWDT_BOARD_ROOT}: ${LWDT_BOARD_ID}")
endif()
if("${LWDT_BOARD_ID}" MATCHES "(^|/)\\.\\.(/|$)")
    message(FATAL_ERROR "LWDT_BOARD_ID must not contain '..': ${LWDT_BOARD_ID}")
endif()

# ESP-IDF scans component requirements in a separate `cmake -P` process, so
# propagate the selected board id through the environment as well as the cache.
set(ENV{LWDT_BOARD_ID} "${LWDT_BOARD_ID}")

set(LWDT_BOARD_DIR "${LWDT_BOARD_ROOT}/${LWDT_BOARD_ID}")
set(LWDT_BOARD_FILE "${LWDT_BOARD_DIR}/board.lwdt")
set(LWDT_BOARD_META "${LWDT_BOARD_DIR}/board.cmake")

if(NOT EXISTS "${LWDT_BOARD_META}")
    message(FATAL_ERROR "LWDT board metadata not found for board '${LWDT_BOARD_ID}': ${LWDT_BOARD_META}")
endif()
if(NOT EXISTS "${LWDT_BOARD_FILE}")
    message(FATAL_ERROR "LWDT board definition not found for board '${LWDT_BOARD_ID}': ${LWDT_BOARD_FILE}")
endif()

include("${LWDT_BOARD_META}")
if(NOT DEFINED LWDT_BOARD_IDF_TARGET OR "${LWDT_BOARD_IDF_TARGET}" STREQUAL "")
    message(FATAL_ERROR "Board '${LWDT_BOARD_ID}' must define LWDT_BOARD_IDF_TARGET in ${LWDT_BOARD_META}")
endif()

if(DEFINED IDF_TARGET AND NOT "${IDF_TARGET}" STREQUAL "" AND NOT "${IDF_TARGET}" STREQUAL "${LWDT_BOARD_IDF_TARGET}")
    message(FATAL_ERROR "Board '${LWDT_BOARD_ID}' requires IDF_TARGET=${LWDT_BOARD_IDF_TARGET}, but IDF_TARGET=${IDF_TARGET} was provided")
endif()

set(IDF_TARGET "${LWDT_BOARD_IDF_TARGET}" CACHE STRING "ESP-IDF target" FORCE)

# Keep ESP-IDF's generated sdkconfig in the build directory so the repository
# stays board-description-only.
if(NOT DEFINED SDKCONFIG OR "${SDKCONFIG}" STREQUAL "")
    string(REPLACE "/" "_" _LWDT_BOARD_CONFIG_BASENAME "${LWDT_BOARD_ID}")
    set(SDKCONFIG "${CMAKE_BINARY_DIR}/sdkconfig.${_LWDT_BOARD_CONFIG_BASENAME}" CACHE STRING "ESP-IDF sdkconfig file" FORCE)
endif()

include($ENV{IDF_PATH}/tools/cmake/project.cmake)
project(lwdt_blink)