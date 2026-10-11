# 快速开始与构建

仓库提供了一个 ESP-IDF Blink 示例。构建时传入板型 ID，LWDT 会选择对应的 `board.lwdt` 和 `board.cmake`。

## 1. 配置 ESP-IDF 环境

安装 ESP-IDF 6.0.x 或更高版本，并在当前终端导出环境变量。

```bash
# Linux / macOS
. $HOME/esp/esp-idf/export.sh

# Windows PowerShell
. $env:IDF_PATH\export.ps1
```

## 2. 选择板型并构建

板型 ID 固定使用 `vendor/model` 格式。`board.cmake` 指定芯片目标，`board.lwdt` 提供板级硬件配置。

```bash
cd example
idf.py build -DLWDT_BOARD_ID=nologo/esp32-c3-supermini
```

也可以通过环境变量传递板型：

```bash
export LWDT_BOARD_ID=espressif/esp32-devkitc-1
idf.py build
```

## 3. 烧录和查看日志

```bash
idf.py flash monitor
```

## 内置板型

| Board ID | IDF target |
| --- | --- |
| `espressif/esp32-devkitc-1` | `esp32` |
| `espressif/esp32-c3-devkitm-1` | `esp32c3` |
| `nologo/esp32-c3-supermini` | `esp32c3` |
| `espressif/esp32-s3-devkitc-1` | `esp32s3` |

:::warning[切换目标前清理 sdkconfig]
切换到不同芯片目标时，如构建目录保留了另一目标生成的 `sdkconfig`，请删除后重新配置。ESP-IDF 会先校验该 target 的一致性。
:::