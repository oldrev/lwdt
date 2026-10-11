# CMake & Project Integration

To include LWDT in an existing ESP-IDF project, load the board resolver before ESP-IDF's `project.cmake`. The resolver locates the selected board, loads its metadata, and chooses `IDF_TARGET`.

## Root CMakeLists.txt

```cmake
cmake_minimum_required(VERSION 3.16)

# Register the directory containing LWDT components
set(EXTRA_COMPONENT_DIRS "path/to/lwdt/components")

# Must be included before project.cmake
include("path/to/lwdt/components/lwdt/cmake/lwdt_board.cmake")

include($ENV{IDF_PATH}/tools/cmake/project.cmake)
project(my_app)
```

## Application Entry Point

The LWDT runtime owns ESP-IDF's `app_main()` to run `APPLICATION` initializers. Application code implements `drvfx_app_main()`.

```c
#include "drvfx/drvfx.h"

void drvfx_app_main(void)
{
    /* Application code */
}
```

## WHOLE_ARCHIVE Link Requirement

Components defining `drvfx_app_main()`, `DRVFX_SYS_INIT()`, or `DRVFX_SUBSYS_INIT()` require `WHOLE_ARCHIVE TRUE`. Initializers are discovered through linker sections, and regular static-library extraction can discard objects with no direct symbol references.

```cmake
idf_component_register(
    SRCS "app_main.c"
    INCLUDE_DIRS "."
    WHOLE_ARCHIVE TRUE
)
```