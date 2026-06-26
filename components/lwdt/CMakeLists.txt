set(LWDT_ROOT "${CMAKE_CURRENT_LIST_DIR}")
set(LWDT_TOOL "${LWDT_ROOT}/lwdt2h.py")
set(LWDT_SYSTEM_BOARD_ROOT "${LWDT_ROOT}/boards")
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
    message(FATAL_ERROR "LWDT_BOARD_ID must be a relative board id in <vendor>/<model> form: ${LWDT_BOARD_ID}")
endif()
if("${LWDT_BOARD_ID}" MATCHES "(^|/)\\.\\.(/|$)")
    message(FATAL_ERROR "LWDT_BOARD_ID must not contain '..': ${LWDT_BOARD_ID}")
endif()

set(_LWDT_BOARD_FILE "")
if(DEFINED LWDT_BOARD_FILE AND NOT "${LWDT_BOARD_FILE}" STREQUAL "")
    set(_LWDT_BOARD_FILE "${LWDT_BOARD_FILE}")
elseif(DEFINED ENV{LWDT_BOARD_FILE} AND NOT "$ENV{LWDT_BOARD_FILE}" STREQUAL "")
    set(_LWDT_BOARD_FILE "$ENV{LWDT_BOARD_FILE}")
endif()

if("${_LWDT_BOARD_FILE}" STREQUAL "")
    set(_LWDT_BOARD_ROOTS "${PROJECT_DIR}/boards")
    if(DEFINED LWDT_BOARD_ROOTS AND NOT "${LWDT_BOARD_ROOTS}" STREQUAL "")
        list(APPEND _LWDT_BOARD_ROOTS ${LWDT_BOARD_ROOTS})
    elseif(DEFINED ENV{LWDT_BOARD_ROOTS} AND NOT "$ENV{LWDT_BOARD_ROOTS}" STREQUAL "")
        list(APPEND _LWDT_BOARD_ROOTS $ENV{LWDT_BOARD_ROOTS})
    endif()
    list(APPEND _LWDT_BOARD_ROOTS "${LWDT_SYSTEM_BOARD_ROOT}")

    foreach(_LWDT_ROOT IN LISTS _LWDT_BOARD_ROOTS)
        if("${_LWDT_ROOT}" STREQUAL "")
            continue()
        endif()
        get_filename_component(_LWDT_ABS_ROOT "${_LWDT_ROOT}" ABSOLUTE BASE_DIR "${PROJECT_DIR}")
        set(_LWDT_CANDIDATE_FILE "${_LWDT_ABS_ROOT}/${LWDT_BOARD_ID}/board.lwdt")
        if(EXISTS "${_LWDT_CANDIDATE_FILE}")
            set(_LWDT_BOARD_FILE "${_LWDT_CANDIDATE_FILE}")
            break()
        endif()
    endforeach()
endif()

if("${_LWDT_BOARD_FILE}" STREQUAL "" OR NOT EXISTS "${_LWDT_BOARD_FILE}")
    message(FATAL_ERROR "LWDT board definition not found for board '${LWDT_BOARD_ID}': ${_LWDT_BOARD_FILE}")
endif()
set(LWDT_BOARD_FILE "${_LWDT_BOARD_FILE}")

set(LWDT_BOARD_OVERLAYS "")
if(DEFINED LWDT_BOARD_OVERLAYS AND NOT "${LWDT_BOARD_OVERLAYS}" STREQUAL "")
    set(LWDT_BOARD_OVERLAYS "${LWDT_BOARD_OVERLAYS}")
elseif(DEFINED ENV{LWDT_BOARD_OVERLAYS} AND NOT "$ENV{LWDT_BOARD_OVERLAYS}" STREQUAL "")
    set(LWDT_BOARD_OVERLAYS "$ENV{LWDT_BOARD_OVERLAYS}")
endif()

set(_LWDT_OVERLAY_ARGS "")
foreach(_LWDT_OVERLAY IN LISTS LWDT_BOARD_OVERLAYS)
    if(NOT EXISTS "${_LWDT_OVERLAY}")
        message(FATAL_ERROR "LWDT overlay not found: ${_LWDT_OVERLAY}")
    endif()
    list(APPEND _LWDT_OVERLAY_ARGS --overlay "${_LWDT_OVERLAY}")
endforeach()

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
    COMMAND ${Python3_EXECUTABLE} "${LWDT_TOOL}" --basedir "${LWDT_BASEDIR}" ${_LWDT_OVERLAY_ARGS} -o "${LWDT_GENERATED_HEADER}" "${LWDT_BOARD_FILE}"
    DEPENDS "${LWDT_TOOL}" "${LWDT_BOARD_FILE}" ${LWDT_BOARD_OVERLAYS}
    COMMENT "Generating LWDT header for board '${LWDT_BOARD_ID}'"
    VERBATIM
)

add_custom_target(lwdt_generate DEPENDS "${LWDT_GENERATED_HEADER}")

add_dependencies(${COMPONENT_LIB} lwdt_generate)
