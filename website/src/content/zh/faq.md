# 注意事项与常见问题

## 构建注意事项

1. `IDF_TARGET` 由已选择板型的 `board.cmake` 指定，`sdkconfig` 不用于选择板型。
2. 切换芯片目标时，如当前构建目录含有另一 target 生成的 `sdkconfig`，应删除并重新配置。
3. Windows 中 `LWDT_BOARD_ROOTS` 和 `LWDT_OVERLAYS` 使用分号分隔多个路径。
4. 覆盖顺序为：项目 `boards/`、`LWDT_BOARD_ROOTS`、内置 `components/lwdt/boards/`。

## FAQ

### LWDT 是否提供 RTOS 内核或任务调度？

不提供。项目保留 ESP-IDF 的 FreeRTOS、组件构建与运行环境；LWDT 处理板级硬件描述、宏生成和驱动初始化。

### 使用 LWDT 后能否继续使用 ESP-IDF Wi-Fi 和蓝牙组件？

可以。LWDT 是普通 ESP-IDF 组件，Wi-Fi、BLE 配网、Mesh、官方示例和工具链可继续使用。

### 运行时是否解析 `board.lwdt`？

不解析。`board.lwdt` 在构建阶段转换为 C 宏和静态设备对象，固件直接使用编译后的配置。

### 初始化函数未执行时应检查什么？

检查包含初始化入口的组件是否使用 `WHOLE_ARCHIVE TRUE` 链接。链接段发现机制要求相关目标文件进入最终镜像。