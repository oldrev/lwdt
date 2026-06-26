# Resolve an LWDT board before ESP-IDF project() selects IDF_TARGET.
# Include this from the application's top-level CMakeLists.txt before
# include($ENV{IDF_PATH}/tools/cmake/project.cmake).

get_filename_component(_LWDT_RESOLVER_DIR "${CMAKE_CURRENT_LIST_FILE}" DIRECTORY)
get_filename_component(LWDT_ROOT "${_LWDT_RESOLVER_DIR}/.." ABSOLUTE)

if(NOT DEFINED LWDT_PROJECT_DIR OR "${LWDT_PROJECT_DIR}" STREQUAL "")
    set(LWDT_PROJECT_DIR "${CMAKE_CURRENT_SOURCE_DIR}")
endif()

set(LWDT_BASEDIR "${LWDT_ROOT}/dt" CACHE PATH "LWDT Jsonnet base dir")
set(LWDT_SYSTEM_BOARD_ROOT "${LWDT_ROOT}/boards" CACHE PATH "LWDT built-in board root")
set(LWDT_PROJECT_BOARD_ROOT "${LWDT_PROJECT_DIR}/boards" CACHE PATH "LWDT project board root")

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
    message(FATAL_ERROR "LWDT_BOARD_ID must be a relative board id in <vendor>/<model> form: ${LWDT_BOARD_ID}")
endif()
if("${LWDT_BOARD_ID}" MATCHES "(^|/)\\.\\.(/|$)")
    message(FATAL_ERROR "LWDT_BOARD_ID must not contain '..': ${LWDT_BOARD_ID}")
endif()

set(_LWDT_BOARD_ROOTS "${LWDT_PROJECT_BOARD_ROOT}")
if(DEFINED LWDT_BOARD_ROOTS AND NOT "${LWDT_BOARD_ROOTS}" STREQUAL "")
    list(APPEND _LWDT_BOARD_ROOTS ${LWDT_BOARD_ROOTS})
elseif(DEFINED ENV{LWDT_BOARD_ROOTS} AND NOT "$ENV{LWDT_BOARD_ROOTS}" STREQUAL "")
    list(APPEND _LWDT_BOARD_ROOTS $ENV{LWDT_BOARD_ROOTS})
endif()
list(APPEND _LWDT_BOARD_ROOTS "${LWDT_SYSTEM_BOARD_ROOT}")

set(LWDT_BOARD_DIR "")
set(LWDT_BOARD_FILE "")
set(LWDT_BOARD_META "")
set(LWDT_RESOLVED_BOARD_ROOT "")
foreach(_LWDT_ROOT IN LISTS _LWDT_BOARD_ROOTS)
    if("${_LWDT_ROOT}" STREQUAL "")
        continue()
    endif()
    get_filename_component(_LWDT_ABS_ROOT "${_LWDT_ROOT}" ABSOLUTE BASE_DIR "${LWDT_PROJECT_DIR}")
    set(_LWDT_CANDIDATE_DIR "${_LWDT_ABS_ROOT}/${LWDT_BOARD_ID}")
    if(EXISTS "${_LWDT_CANDIDATE_DIR}/board.cmake" AND EXISTS "${_LWDT_CANDIDATE_DIR}/board.lwdt")
        set(LWDT_RESOLVED_BOARD_ROOT "${_LWDT_ABS_ROOT}")
        set(LWDT_BOARD_DIR "${_LWDT_CANDIDATE_DIR}")
        set(LWDT_BOARD_META "${_LWDT_CANDIDATE_DIR}/board.cmake")
        set(LWDT_BOARD_FILE "${_LWDT_CANDIDATE_DIR}/board.lwdt")
        break()
    endif()
endforeach()

if("${LWDT_BOARD_FILE}" STREQUAL "")
    message(FATAL_ERROR "LWDT board '${LWDT_BOARD_ID}' not found. Searched: ${_LWDT_BOARD_ROOTS}")
endif()

set(LWDT_BOARD_OVERLAYS "")
foreach(_LWDT_PROJECT_BOARD_OVERLAY IN ITEMS
    "${LWDT_PROJECT_BOARD_ROOT}/${LWDT_BOARD_ID}/.lwdt.overlay"
    "${LWDT_PROJECT_BOARD_ROOT}/${LWDT_BOARD_ID}/board.lwdt.overlay"
)
    if(EXISTS "${_LWDT_PROJECT_BOARD_OVERLAY}")
        get_filename_component(_LWDT_PROJECT_BOARD_OVERLAY "${_LWDT_PROJECT_BOARD_OVERLAY}" ABSOLUTE)
        list(APPEND LWDT_BOARD_OVERLAYS "${_LWDT_PROJECT_BOARD_OVERLAY}")
    endif()
endforeach()
set(_LWDT_PROJECT_APP_OVERLAY "${LWDT_PROJECT_DIR}/.lwdt.overlay")
if(EXISTS "${_LWDT_PROJECT_APP_OVERLAY}")
    list(APPEND LWDT_BOARD_OVERLAYS "${_LWDT_PROJECT_APP_OVERLAY}")
endif()
if(DEFINED LWDT_OVERLAYS AND NOT "${LWDT_OVERLAYS}" STREQUAL "")
    list(APPEND LWDT_BOARD_OVERLAYS ${LWDT_OVERLAYS})
elseif(DEFINED ENV{LWDT_OVERLAYS} AND NOT "$ENV{LWDT_OVERLAYS}" STREQUAL "")
    list(APPEND LWDT_BOARD_OVERLAYS $ENV{LWDT_OVERLAYS})
endif()

set(_LWDT_NORMALIZED_OVERLAYS "")
foreach(_LWDT_OVERLAY IN LISTS LWDT_BOARD_OVERLAYS)
    get_filename_component(_LWDT_OVERLAY_ABS "${_LWDT_OVERLAY}" ABSOLUTE BASE_DIR "${LWDT_PROJECT_DIR}")
    if(NOT EXISTS "${_LWDT_OVERLAY_ABS}")
        message(FATAL_ERROR "LWDT overlay not found: ${_LWDT_OVERLAY_ABS}")
    endif()
    list(APPEND _LWDT_NORMALIZED_OVERLAYS "${_LWDT_OVERLAY_ABS}")
endforeach()
set(LWDT_BOARD_OVERLAYS "${_LWDT_NORMALIZED_OVERLAYS}" CACHE STRING "LWDT board overlay files" FORCE)
set(LWDT_BOARD_FILE "${LWDT_BOARD_FILE}" CACHE FILEPATH "Resolved LWDT board file" FORCE)
set(LWDT_BOARD_META "${LWDT_BOARD_META}" CACHE FILEPATH "Resolved LWDT board metadata" FORCE)
set(LWDT_BOARD_DIR "${LWDT_BOARD_DIR}" CACHE PATH "Resolved LWDT board directory" FORCE)
set(LWDT_RESOLVED_BOARD_ROOT "${LWDT_RESOLVED_BOARD_ROOT}" CACHE PATH "Resolved LWDT board root" FORCE)

# ESP-IDF scans component requirements in a separate `cmake -P` process, so
# propagate resolved board state through the environment as well as the cache.
set(ENV{LWDT_BOARD_ID} "${LWDT_BOARD_ID}")
set(ENV{LWDT_BOARD_FILE} "${LWDT_BOARD_FILE}")
set(ENV{LWDT_BOARD_OVERLAYS} "${LWDT_BOARD_OVERLAYS}")
set(ENV{LWDT_BOARD_ROOTS} "${_LWDT_BOARD_ROOTS}")

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
