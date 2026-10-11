# CMake 与工程集成

在已有 ESP-IDF 工程中引入 LWDT 时，需要在 ESP-IDF 的 `project.cmake` 之前包含板型解析器。解析器负责根据 `LWDT_BOARD_ID` 查找板型目录、加载 metadata 并选择 `IDF_TARGET`。

## 根目录 CMakeLists.txt

```cmake
cmake_minimum_required(VERSION 3.16)

# 注册 LWDT 组件所在目录
set(EXTRA_COMPONENT_DIRS "path/to/lwdt/components")

# 必须在 project.cmake 之前包含
include("path/to/lwdt/components/lwdt/cmake/lwdt_board.cmake")

include($ENV{IDF_PATH}/tools/cmake/project.cmake)
project(my_app)
```

## 应用入口

LWDT 运行时实现 ESP-IDF 的 `app_main()`，用于执行 `APPLICATION` 级初始化入口。应用代码应实现 `drvfx_app_main()`。

```c
#include "drvfx/drvfx.h"

void drvfx_app_main(void)
{
    /* Application code */
}
```

## WHOLE_ARCHIVE 链接要求

定义 `drvfx_app_main()`、`DRVFX_SYS_INIT()` 或 `DRVFX_SUBSYS_INIT()` 的组件必须使用 `WHOLE_ARCHIVE TRUE` 链接。初始化入口通过链接段发现；常规静态库符号抽取可能移除没有显式引用的目标文件。

```cmake
idf_component_register(
    SRCS "app_main.c"
    INCLUDE_DIRS "."
    WHOLE_ARCHIVE TRUE
)
```