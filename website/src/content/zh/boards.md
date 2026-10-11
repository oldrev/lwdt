# 板级解析与 Overlay

每个板型使用 `vendor/model` 形式的 ID，并对应一个包含 `board.cmake` 与 `board.lwdt` 的目录。

## 目录格式

```text
boards/<vendor>/<model>/
├── board.cmake        # IDF target 等板型元数据
├── board.lwdt         # 基础硬件描述
└── .lwdt.overlay      # 可选板级覆盖
```

`board.cmake` 至少指定 `LWDT_BOARD_IDF_TARGET`：

```cmake
set(LWDT_BOARD_IDF_TARGET esp32c3)
```

## 板型搜索顺序

解析器依次查找下列位置。第一个同时存在 `board.cmake` 和 `board.lwdt` 的目录被选中：

1. 当前项目的 `boards/` 目录。
2. `LWDT_BOARD_ROOTS` 指定的附加根目录。
3. `components/lwdt/boards/` 下的内置 BSP。

该机制允许项目通过同名目录覆盖内置板型，而不修改 LWDT 组件源码。

## Overlay 合并顺序

在选定基础 `board.lwdt` 后，以下文件以 Jsonnet `+` 语义按顺序合并：

1. `boards/<vendor>/<model>/.lwdt.overlay`
2. 项目根目录 `.lwdt.overlay`
3. `LWDT_OVERLAYS` 或 `-DLWDT_OVERLAYS=<path1>;<path2>` 显式文件列表

```jsonnet
// .lwdt.overlay
{
  soc+: {
    i2c0+: {
      clock_frequency: 1000000,
    },
  },
}
```

:::note[Windows 路径分隔符]
Windows 下多个 `LWDT_BOARD_ROOTS` 或 `LWDT_OVERLAYS` 路径使用分号分隔，避免与盘符冒号冲突。
:::