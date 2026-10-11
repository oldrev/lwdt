export type Lang = "zh" | "en";

/* ------------------------------------------------------------- shared data */

export type Board = {
  id: string;
  target: string;
  led_gpio: number;
  led_active_low: number;
  led_name: string;
  sda: number;
  scl: number;
  freq: number;
};

export const BOARDS: Board[] = [
  { id: "nologo/esp32-c3-supermini", target: "esp32c3", led_gpio: 8, led_active_low: 1, led_name: "ESP32-C3 SuperMini", sda: 4, scl: 5, freq: 400000 },
  { id: "espressif/esp32-devkitc-1", target: "esp32", led_gpio: 2, led_active_low: 0, led_name: "ESP32 DevKitC", sda: 21, scl: 22, freq: 100000 },
  { id: "espressif/esp32-c3-devkitm-1", target: "esp32c3", led_gpio: 8, led_active_low: 1, led_name: "ESP32-C3 DevKitM-1", sda: 5, scl: 6, freq: 400000 },
  { id: "espressif/esp32-s3-devkitc-1", target: "esp32s3", led_gpio: 48, led_active_low: 0, led_name: "ESP32-S3 DevKitC-1", sda: 8, scl: 9, freq: 400000 },
];

export const BOOT_LEVELS = ["EARLY", "PRE_KERNEL_1", "PRE_KERNEL_2", "POST_KERNEL", "APPLICATION"];

export const BOOT_ORDER: [string, number][] = [
  ["EARLY", 0],
  ["PRE_KERNEL_1", 0],
  ["PRE_KERNEL_1", 10],
  ["PRE_KERNEL_1", 50],
  ["PRE_KERNEL_2", 50],
  ["PRE_KERNEL_2", 80],
  ["POST_KERNEL", 30],
  ["POST_KERNEL", 50],
  ["POST_KERNEL", 60],
  ["POST_KERNEL", 70],
  ["APPLICATION", 90],
  ["APPLICATION", 99],
];

export const MACRO_SIGS = [
  "LWDT_NODELABEL(label)",
  "LWDT_NODE2(a, b)",
  "LWDT_NODE_EXISTS(node)",
  "LWDT_PROP(node, prop)",
  "LWDT_PROP_EXISTS(node, prop)",
  "LWDT_PROP_BY_IDX(node, prop, i)",
  "LWDT_PROP_LEN(node, prop)",
  "LWDT_PROP_NODE(node, prop)",
  "LWDT_PROP_PHANDLE(node, prop)",
  "LWDT_LABEL(node)",
  "LWDT_INST(i, compat)",
  "LWDT_INST_PROP(i, compat, prop)",
  "LWDT_INST_FOREACH_STATUS_OKAY(c, m)",
];

export const RT_SIGS = [
  "k_device_get_binding(name)",
  "k_device_is_ready(dev)",
  "DRVFX_SYS_INIT(fn, level, prio)",
  "DRVFX_SUBSYS_INIT(fn, level, prio)",
  "DRVFX_DEVICE_DT_INST_DEFINE(...)",
  "drvfx_app_main()",
];

export const DRIVER_META = [
  { impl: "ESP-IDF i2c_master", api: "drvfx_i2c_* / i2c0", level: "PRE_KERNEL_2", prio: 50 },
  { impl: "ESP-IDF spi_master", api: "drvfx_spi_* / spi2", level: "PRE_KERNEL_2", prio: 50 },
  { impl: "ESP-IDF system time", api: "rtc_* / idf", level: "POST_KERNEL", prio: 50 },
  { impl: "DS1302 · GPIO bit-bang", api: "rtc_* / rtc_dev", level: "POST_KERNEL", prio: 50 },
  { impl: "PCF8563 · I2C", api: "rtc_* / rtc0", level: "POST_KERNEL", prio: 50 },
];

export const GH = "https://github.com/oldrev/lwdt";

/* ------------------------------------------------------------------ zh */

const zh = {
  htmlLang: "zh-CN",
  title: "LWDT —— 面向 ESP-IDF 的轻量设备树与驱动框架",
  ui: {
    home: "首页",
    docs: "文档",
    api: "API 速查",
    github: "GitHub",
    search: "搜索文档与 API...",
    noResults: "未找到相关文档",
    copy: "复制",
    copied: "已复制",
    menu: "目录",
    close: "关闭",
    theme: "主题",
    light: "浅色",
    dark: "深色",
    system: "跟随系统",
    snippet: "代码片段",
    backTop: "回到顶部",
    prev: "上一篇",
    next: "下一篇",
    onThisPage: "本页目录",
    breadcrumbDocs: "文档",
  },
  home: {
    kicker: "LIGHTWEIGHT DEVICE TREE · FOR ESP-IDF",
    t1: "面向 ESP-IDF 的",
    t2: "设备树与驱动框架",
    lead: "为 ESP32 多板型项目提供统一的硬件描述与驱动初始化机制。构建时将 board.lwdt 编译为 C 宏；运行时由 drvfx 按优先级初始化设备。零运行时解析开销，且不改变 ESP-IDF 原生生态支持。",
    ctaDocs: "查看详细文档",
    ctaQuickstart: "快速上手指南",
    ctaGithub: "GitHub 仓库",
    imageAlt: "置于电路设计图纸上的电路板实拍",
    photoCredit: "摄影：ThisIsEngineering / Pexels ↗",
    stats: [
      { v: "4", k: "内置 BSP 板定义" },
      { v: "5", k: "内置 drvfx 驱动" },
      { v: "13", k: "编译期设备树宏" },
      { v: "0", k: "运行时解析开销" },
    ],
    pillarsTitle: "核心架构与设计特点",
    pillarsLead: "LWDT 将板级硬件差异从 C 源码中抽离，通过构建期编译与静态驱动模型实现跨板复用。",
    pillars: [
      {
        tag: "BUILD-TIME GENERATION",
        title: "构建期编译 · 零运行开销",
        desc: "使用 Python 与 Jsonnet 在 CMake 构建阶段将 board.lwdt 编译为纯 C 宏头文件。运行期无需解析器与动态内存分配。",
        linkId: "devicetree",
      },
      {
        tag: "DRIVER RUNTIME",
        title: "drvfx 静态驱动运行时",
        desc: "支持从 EARLY 到 APPLICATION 5 个初始化级别，同级别内按 0–99 升序执行。支持多实例与依赖注入。",
        linkId: "drvfx",
      },
      {
        tag: "OVERLAY HIERARCHY",
        title: "分层覆盖与板型解析",
        desc: "支持项目本地 boards/ 覆盖内置 BSP，并支持通过 .lwdt.overlay 和 CMake 变量在构建时增量合并硬件配置。",
        linkId: "boards",
      },
      {
        tag: "NATIVE COMPATIBILITY",
        title: "完全保留 ESP-IDF 原生生态",
        desc: "作为标准 ESP-IDF 组件集成，原生 Wi-Fi、BLE 配网、Mesh 协议栈、原厂工具链及示例均保持兼容。",
        linkId: "overview",
      },
    ],
    compareTitle: "为什么需要硬件描述与驱动解耦",
    compareLead: "对比多板型适配场景下传统硬编码与设备树方案的实现差异。",
    beforeLabel: "传统 ESP-IDF 方式（硬编码与条件编译）",
    afterLabel: "LWDT 方式（设备树驱动）",
    beforeCode: `/* 引脚与板级参数分散在不同宏分支中 */
#ifdef BOARD_ESP32_DEVKITC
  #define LED_GPIO 2
  #define LED_ACTIVE_LOW 0
#elif defined(BOARD_C3_SUPERMINI)
  #define LED_GPIO 8
  #define LED_ACTIVE_LOW 1
#elif defined(BOARD_S3_DEVKITC)
  #define LED_GPIO 48
  #define LED_ACTIVE_LOW 0
#else
  #error "unknown board, add another branch"
#endif

static const char* board_name(void) {
#ifdef BOARD_C3_SUPERMINI
  return "ESP32-C3 SuperMini";
#else
  return "unknown";     /* 需为每块新增板型手动维护 */
#endif
}`,
    afterCode: `/* 板级参数由 boards/<vendor>/<model>/board.lwdt 提供 */
#define BOARD_NODE  LWDT_NODELABEL(board)
#define BLINK_GPIO  LWDT_PROP(BOARD_NODE, led_gpio)
#define LED_ACTIVE  LWDT_PROP(BOARD_NODE, led_active_low)
#define BOARD_NAME  LWDT_PROP(BOARD_NODE, led_name)

#if !LWDT_NODE_EXISTS(BOARD_NODE)
#error "missing board node"
#endif

/* 新增板型时只需添加目录与 board.lwdt，驱动逻辑保持不变 */`,
    studioTitle: "在线交互实验台",
    studioLead: "选择不同板型与 overlay，实时查看构建期生成的 lwdt_generated.h 宏定义。",
    studioLinkText: "查看设备树与 Overlay 详细规范 →",
    quickstartTitle: "三步开始使用",
    quickstartCmd: "cd example\nidf.py build -DLWDT_BOARD_ID=nologo/esp32-c3-supermini\nidf.py flash monitor",
    quickstartLinkText: "查看完整工程集成与 CMake 文档 →",
    docsIndexTitle: "文档导航",
    docsCards: [
      { id: "overview", title: "起步与概念", desc: "项目背景、核心术语说明与基本工作流。" },
      { id: "quickstart", title: "快速开始", desc: "搭建环境、构建示例与接入已有工程。" },
      { id: "devicetree", title: "设备树规范", desc: "Jsonnet 语法、节点声明与属性类型。" },
      { id: "boards", title: "板级解析与 Overlay", desc: "目录命名约定、多级覆盖与 CMake 选项。" },
      { id: "drvfx", title: "drvfx 驱动模型", desc: "静态设备宏、初始化级别与依赖声明。" },
      { id: "api-macros", title: "API 参考手册", desc: "完整宏函数定义与运行期设备访问接口。" },
    ],
  },
  docs: {
    sidebarGroups: [
      {
        title: "起步指南",
        items: [
          { id: "overview", label: "概览与设计背景" },
          { id: "quickstart", label: "快速开始与构建" },
          { id: "cmake", label: "CMake 与工程集成" },
        ],
      },
      {
        title: "设备树与板级配置",
        items: [
          { id: "devicetree", label: "Jsonnet 设备树格式" },
          { id: "boards", label: "板级解析与 Overlay" },
        ],
      },
      {
        title: "驱动框架 (drvfx)",
        items: [
          { id: "drvfx", label: "驱动模型与实例定义" },
          { id: "boot", label: "初始化级别与时序" },
          { id: "drivers", label: "已实现的内置驱动" },
        ],
      },
      {
        title: "API 参考",
        items: [
          { id: "api-macros", label: "设备树编译期宏" },
          { id: "api-runtime", label: "drvfx 运行期接口" },
        ],
      },
      {
        title: "附录与支持",
        items: [
          { id: "faq", label: "注意事项与常见问题" },
        ],
      },
    ],
  },
  studio: {
    title: "LWDT · BOARD STUDIO — 板级描述实验台",
    sub: "构建期编译 · 运行期零解析",
    step1: "① 选择目标板型 —— -DLWDT_BOARD_ID=<vendor>/<model>",
    step2: "② 叠加 overlay（模拟工程或定制硬件修改）",
    ovBoard: "板级 .lwdt.overlay",
    ovProj: "工程级 .lwdt.overlay",
    leftFile: "board.lwdt — Jsonnet 源文件",
    leftCap: "覆盖层按列表顺序、通过 Jsonnet 的 + 运算符在基座定义之后应用。",
    rightFile: "lwdt_generated.h — 构建生成的头文件",
    rightCap: "橙色高亮表示本次改动影响到的宏；驱动直接通过宏读取属性。",
    resolveTitle: "板型目录解析顺序 —— 命中首个同时包含 board.cmake 与 board.lwdt 的目录",
    hit: "← 命中：内置 BSP",
    cBase: "内置板定义（基座）",
    cBoardOv: "板级覆盖层，先于工程覆盖层应用",
    cProjOv: "工程级覆盖层，最后应用，Jsonnet + 合并",
    cOff: "未启用（文件不存在）",
    cGen: "构建期生成 —— 请勿手动修改。数据来源：board.lwdt",
    cOverlays: "个 overlay",
    cNode: "节点",
    cUse: "C 代码中的属性访问示例",
  },
  boot: {
    num: "06",
    en: "BOOT SEQUENCE",
    zh: "设备初始化顺序",
    lead: "drvfx 按 EARLY、PRE_KERNEL_1、PRE_KERNEL_2、POST_KERNEL、APPLICATION 的顺序运行入口；同一级别内按 0–99 的优先级升序执行。",
    reset: "复位 / POWER-ON",
    end: "drvfx_app_main()",
    legend: "段宽 ∝ 该级别登记的入口数量 · 同一级别内按优先级 0–99 升序执行，数字越小越早",
    rows: [
      { use: "极底层框架钩子", note: "用于极早期底层配置，ESP-IDF 服务尚未就绪" },
      { use: "时钟 / 电源类原语", note: "供总线控制器依赖的底层时钟与供电配置" },
      { use: "系统定时器一类原语", note: "保持精简、不可阻塞" },
      { use: "基础 GPIO 控制器", note: "GPIO 消费外设应在后续阶段初始化" },
      { use: "内部总线：I2C / SPI / UART / DMA", note: "总线控制器优先于挂载设备就绪" },
      { use: "Flash、RTC、存储原语", note: "仅在后续阶段确有依赖时配置" },
      { use: "控制台 / 日志相关胶水", note: "ESP-IDF 默认日志已可用，多数驱动无需配置" },
      { use: "I2C / SPI / GPIO 上的外部设备、传感器、RTC 芯片", note: "常规硬件外设的默认初始化档位" },
      { use: "Wi-Fi / 蓝牙控制器级硬件", note: "射频与控制器硬件启动" },
      { use: "网络接口绑定", note: "排在控制器级网络硬件就绪之后" },
      { use: "中间件：文件系统、UI、协议客户端", note: "进入应用阶段后执行" },
      { use: "最后的用户应用钩子", note: "常规应用优先级的最后一档" },
    ],
    foot: "优先级仅控制同级入口的顺序。硬件依赖应使用 DRVFX_DEVICE_DT_INST_DEFINE_WITH_DEPS() 显式声明；优先级建议使用 drvfx/kernel/init.h 中的命名宏，例如 DRVFX_INIT_PRE_KERNEL_2_BUS_PRIORITY。",
  },
  drivers: {
    num: "07",
    en: "IMPLEMENTED DRIVERS",
    zh: "目前实现的 drvfx 驱动",
    lead: "I2C、SPI 和 PCF8563 驱动使用设备树 compatible 属性实例化。仅 status 为 okay 或未设置 status 的节点会生成实例。",
    fig: "图 3 — 开发板与面包板连接示意（示意摄影）",
    figMeta: "PRE_KERNEL_2 → POST_KERNEL",
    imageAlt: "微控制器开发板连接面包板与指示灯的实拍照片",
    photoCredit: "摄影：Chengxin Zhao / Pexels ↗",
    rows: [
      { name: "I2C 主机", note: 'DT 驱动多实例，compatible: "esp32,i2c"；支持 attach/detach、probe、transceive' },
      { name: "SPI 主机", note: 'DT 驱动多实例，compatible: "esp32,spi"；支持 acquire/release 与 transceive' },
      { name: "RTC（软件）", note: "遗留的单实例驱动，把 ESP-IDF 系统时间当作 RTC 用" },
      { name: "RTC（DS1302）", note: "遗留的单实例驱动，GPIO 位敲模拟时序" },
      { name: "RTC（PCF8563）", note: 'DT 驱动多实例，compatible: "nxp,pcf8563"，依赖 phandle 指向的 I2C 总线' },
    ],
    foot: "公开头文件在 components/lwdt/include/drvfx/drivers/，实现在 components/lwdt/drivers/。",
  },
  api: {
    num: "08",
    en: "API REFERENCE",
    zh: "API 速查",
    lead: "设备树宏在编译期提供节点与属性值；drvfx 接口用于获取运行期设备对象及注册初始化入口。",
    macrosTitle: "编译期 —— 设备树访问宏",
    rtTitle: "运行期 —— drvfx 设备接口",
    macros: [
      "按节点标签取节点 id，最常用入口",
      "按路径拼出节点 id，如 soc/i2c0",
      "节点是否存在，用于 #if 编译期校验",
      "读取标量属性值，返回常量",
      "属性是否存在",
      "读取数组属性的第 i 项，如 reg[0]",
      "数组属性长度",
      '解析 phandle 式引用，如 bus: "i2c0"',
      "同上，返回 phandle 形式",
      "获取节点的 label 字符串，用作运行期设备名",
      "按 compatible 获取第 i 个实例节点",
      "按 compatible 获取第 i 个实例的属性",
      "对所有 status=okay 的实例展开指定宏",
    ],
    rt: [
      "按设备名称获取运行期设备指针；失败返回 NULL",
      "查询设备是否完成初始化就绪",
      "注册系统级启动入口（需 WHOLE_ARCHIVE 链接）",
      "注册子系统级启动入口",
      "从设备树实例定义静态设备对象",
      "应用入口函数，由 LWDT 的 app_main() 调用",
    ],
    sampleFile: "按 label 获取设备示例",
    sample: `#include "drvfx/drvfx.h"
#include <lwdt/lwdt.h>
#include "lwdt_generated.h"

#define I2C0_NODE LWDT_NODELABEL(i2c0)

const struct drvfx_device* i2c0 = k_device_get_binding(LWDT_LABEL(I2C0_NODE));
if ((i2c0 == NULL) || !k_device_is_ready(i2c0)) {
    return -ENODEV;
}`,
  },
  faq: {
    num: "09",
    en: "NOTES & FAQ",
    zh: "注意事项与常见问题",
    notesTitle: "构建注意事项",
    notes: [
      "IDF_TARGET 由所选板型的 board.cmake 指定；sdkconfig 不作为板型选择来源。",
      "切换目标芯片时，如现有 sdkconfig 的 target 与新板型不一致，需删除该文件并重新配置。",
      "Windows 下 LWDT_BOARD_ROOTS 与 LWDT_OVERLAYS 使用分号分隔路径；冒号会与盘符冲突。",
      "覆盖顺序：项目 boards/ → LWDT_BOARD_ROOTS → 内置 boards/，第一个同时拥有 board.cmake 和 board.lwdt 的目录获胜。",
    ],
    faqTitle: "常见问题",
    items: [
      { q: "LWDT 会替换 ESP-IDF 的任务调度吗？", a: "LWDT 不提供内核或调度器。应用仍使用 ESP-IDF 的构建系统与运行环境；LWDT 负责设备树宏生成和驱动初始化。" },
      { q: "能否继续使用 ESP-IDF 的 Wi-Fi 与蓝牙组件？", a: "可以。LWDT 作为 ESP-IDF 组件集成，Wi-Fi、BLE 配网、mesh 与官方工具链保持可用。" },
      { q: "运行时需要解析 board.lwdt 吗？", a: "无需解析。构建阶段已生成 C 宏和静态设备对象，运行时直接使用编译后的配置。" },
      { q: "drvfx_app_main() 的执行时机是什么？", a: "LWDT 运行时在 app_main() 中执行 APPLICATION 级初始化入口，完成后调用用户定义的 drvfx_app_main()。" },
      { q: "初始化入口未执行时应检查什么？", a: "检查定义 drvfx_app_main() 或注册初始化入口的组件是否以 WHOLE_ARCHIVE TRUE 链接。否则链接器可能剔除仅通过链接段引用的目标文件。" },
      { q: "支持哪些板子？", a: "内置四块：espressif/esp32-devkitc-1、espressif/esp32-c3-devkitm-1、nologo/esp32-c3-supermini、espressif/esp32-s3-devkitc-1。项目自己的 boards/ 目录可以随时新增或覆盖它们。" },
    ],
  },
  footer: {
    desc: "A lightweight device-tree and driver framework solution for ESP-IDF. 灵感来自 Zephyr RTOS 的解耦驱动模型与设备树硬件描述。",
    links: [
      { l: "GitHub 仓库 ↗", h: GH },
      { l: "中文 README ↗", h: `${GH}/blob/master/README.zh-cn.md` },
      { l: "ESP-IDF ↗", h: "https://github.com/espressif/esp-idf" },
      { l: "请作者喝杯咖啡 ↗", h: "https://ko-fi.com/oldrev" },
    ],
  },
};

export type Dict = typeof zh;

/* ------------------------------------------------------------------ en */

const en: Dict = {
  htmlLang: "en",
  title: "LWDT — Lightweight Device Tree & Driver Framework for ESP-IDF",
  ui: {
    home: "Home",
    docs: "Docs",
    api: "API Ref",
    github: "GitHub",
    search: "Search docs and APIs...",
    noResults: "No matching documents found",
    copy: "Copy",
    copied: "Copied",
    menu: "Menu",
    close: "Close",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    system: "System",
    snippet: "snippet",
    backTop: "Back to top",
    prev: "Previous",
    next: "Next",
    onThisPage: "On this page",
    breadcrumbDocs: "Documentation",
  },
  home: {
    kicker: "LIGHTWEIGHT DEVICE TREE · FOR ESP-IDF",
    t1: "Device Tree & Driver Framework",
    t2: "for ESP-IDF",
    lead: "Unified hardware description and ordered driver initialization for ESP32 multi-board projects. Compiles board.lwdt into C macros at build time; initializes devices by priority with drvfx at runtime. Zero runtime parsing cost, retaining full native ESP-IDF compatibility.",
    ctaDocs: "Read Documentation",
    ctaQuickstart: "Quick Start Guide",
    ctaGithub: "GitHub Repo",
    imageAlt: "Close-up of electronic circuit board on technical drawings",
    photoCredit: "Photo: ThisIsEngineering / Pexels ↗",
    stats: [
      { v: "4", k: "Built-in BSP Boards" },
      { v: "5", k: "Core drvfx Drivers" },
      { v: "13", k: "Compile-Time DT Macros" },
      { v: "0", k: "Runtime Parsing Cost" },
    ],
    pillarsTitle: "Core Architecture & Design",
    pillarsLead: "LWDT decouples board hardware facts from C source files via build-time compilation and a static driver model.",
    pillars: [
      {
        tag: "BUILD-TIME GENERATION",
        title: "Build-Time Compilation · Zero Overhead",
        desc: "Python & Jsonnet compile board.lwdt into C macros during CMake configuration. No runtime JSON parser or dynamic memory allocation.",
        linkId: "devicetree",
      },
      {
        tag: "DRIVER RUNTIME",
        title: "drvfx Driver Runtime",
        desc: "5 init levels from EARLY to APPLICATION, executed in priority 0–99 order. Supports multi-instance drivers and dependency declaration.",
        linkId: "drvfx",
      },
      {
        tag: "OVERLAY HIERARCHY",
        title: "Hierarchical Board & Overlay Resolution",
        desc: "Project boards/ override built-in BSPs. Custom overlays merge via Jsonnet '+' semantics at configure time.",
        linkId: "boards",
      },
      {
        tag: "NATIVE COMPATIBILITY",
        title: "Full Native ESP-IDF Ecosystem",
        desc: "Integrates as a standard ESP-IDF component. Native Wi-Fi, BLE provisioning, mesh, toolchains, and idf.py commands remain fully functional.",
        linkId: "overview",
      },
    ],
    compareTitle: "Why Decouple Hardware from Drivers",
    compareLead: "Compare traditional hardcoded #ifdef wiring against device-tree macro queries across multiple board variants.",
    beforeLabel: "Traditional ESP-IDF (Hardcoded branches)",
    afterLabel: "LWDT (Device Tree Driver)",
    beforeCode: `/* Pin configuration varies across board #ifdefs */
#ifdef BOARD_ESP32_DEVKITC
  #define LED_GPIO 2
  #define LED_ACTIVE_LOW 0
#elif defined(BOARD_C3_SUPERMINI)
  #define LED_GPIO 8
  #define LED_ACTIVE_LOW 1
#elif defined(BOARD_S3_DEVKITC)
  #define LED_GPIO 48
  #define LED_ACTIVE_LOW 0
#else
  #error "unknown board, add another branch"
#endif

static const char* board_name(void) {
#ifdef BOARD_C3_SUPERMINI
  return "ESP32-C3 SuperMini";
#else
  return "unknown";     /* Requires manual update for each board */
#endif
}`,
    afterCode: `/* Board facts live in boards/<vendor>/<model>/board.lwdt */
#define BOARD_NODE  LWDT_NODELABEL(board)
#define BLINK_GPIO  LWDT_PROP(BOARD_NODE, led_gpio)
#define LED_ACTIVE  LWDT_PROP(BOARD_NODE, led_active_low)
#define BOARD_NAME  LWDT_PROP(BOARD_NODE, led_name)

#if !LWDT_NODE_EXISTS(BOARD_NODE)
#error "missing board node"
#endif

/* Adding a new board only requires a directory; driver C code stays identical */`,
    studioTitle: "Interactive Board Studio",
    studioLead: "Switch boards and toggle overlays to preview real-time generated lwdt_generated.h macros.",
    studioLinkText: "View full Device Tree & Overlay guide →",
    quickstartTitle: "Get Started in 3 Steps",
    quickstartCmd: "cd example\nidf.py build -DLWDT_BOARD_ID=nologo/esp32-c3-supermini\nidf.py flash monitor",
    quickstartLinkText: "Read CMake integration & setup docs →",
    docsIndexTitle: "Documentation Navigation",
    docsCards: [
      { id: "overview", title: "Overview & Background", desc: "Project goals, terminology glossary, and core workflow." },
      { id: "quickstart", title: "Quick Start", desc: "Environment setup, sample build, and adopting into your app." },
      { id: "devicetree", title: "Device Tree Specification", desc: "Jsonnet syntax, node declarations, and property types." },
      { id: "boards", title: "Board Resolution & Overlays", desc: "Directory naming rules, resolution precedence, and CMake flags." },
      { id: "drvfx", title: "drvfx Driver Model", desc: "Static device definition macros, init levels, and dependency rules." },
      { id: "api-macros", title: "API Reference", desc: "Complete compile-time macro signatures and runtime driver APIs." },
    ],
  },
  docs: {
    sidebarGroups: [
      {
        title: "Getting Started",
        items: [
          { id: "overview", label: "Overview & Background" },
          { id: "quickstart", label: "Quick Start & Build" },
          { id: "cmake", label: "CMake & Project Integration" },
        ],
      },
      {
        title: "Device Tree & Boards",
        items: [
          { id: "devicetree", label: "Jsonnet Device Tree Format" },
          { id: "boards", label: "Board Resolution & Overlays" },
        ],
      },
      {
        title: "Driver Framework (drvfx)",
        items: [
          { id: "drvfx", label: "Driver Model & Instances" },
          { id: "boot", label: "Init Levels & Timeline" },
          { id: "drivers", label: "Implemented Drivers" },
        ],
      },
      {
        title: "API Reference",
        items: [
          { id: "api-macros", label: "Compile-Time DT Macros" },
          { id: "api-runtime", label: "drvfx Runtime APIs" },
        ],
      },
      {
        title: "Reference & FAQ",
        items: [
          { id: "faq", label: "Notes & FAQ" },
        ],
      },
    ],
  },
  studio: {
    title: "LWDT · BOARD STUDIO",
    sub: "Compiled at build time · zero parsing at runtime",
    step1: "① Select Target Board —— -DLWDT_BOARD_ID=<vendor>/<model>",
    step2: "② Stack Overlays (Simulate project or custom revision)",
    ovBoard: "Board .lwdt.overlay",
    ovProj: "Project .lwdt.overlay",
    leftFile: "board.lwdt — Jsonnet Source",
    leftCap: "Overlays are applied in list order after base definitions using Jsonnet '+' operator.",
    rightFile: "lwdt_generated.h — Generated Header",
    rightCap: "Orange highlights macros updated by overlay; drivers query properties through macros.",
    resolveTitle: "Board Resolution Precedence — First directory containing both board.cmake and board.lwdt wins",
    hit: "← HIT: built-in BSP",
    cBase: "built-in board definition (base)",
    cBoardOv: "board overlay, applied before project overlay",
    cProjOv: "project overlay, applied last via Jsonnet '+' merge",
    cOff: "disabled (file not found)",
    cGen: "Generated at build time — do not edit. Source: board.lwdt",
    cOverlays: "overlay(s)",
    cNode: "node",
    cUse: "Property access from C",
  },
  boot: {
    num: "06",
    en: "BOOT SEQUENCE",
    zh: "Device Initialization Order",
    lead: "drvfx runs registered entries in EARLY, PRE_KERNEL_1, PRE_KERNEL_2, POST_KERNEL and APPLICATION order. Within each level, entries execute by priority 0–99 in ascending order.",
    reset: "RESET / POWER-ON",
    end: "drvfx_app_main()",
    legend: "Segment width ∝ number of registered entries · within each level, priority 0–99 ascending",
    rows: [
      { use: "Extremely low-level framework hooks", note: "Reserved for early framework setup before ESP-IDF services are ready" },
      { use: "Clock or power primitives", note: "Low-level clock and power setup required before bus initialization" },
      { use: "System timer or watchdog primitives", note: "Keep minimal and non-blocking" },
      { use: "Basic GPIO controller support", note: "GPIO consumers should initialize in later stages" },
      { use: "Internal buses: I2C / SPI / UART / DMA", note: "Bus controllers must be ready before peripheral devices" },
      { use: "Flash, RTC or storage primitives", note: "Configure early only when subsequent stages depend on them" },
      { use: "Console or logging glue", note: "ESP-IDF logging is already active; most drivers skip this" },
      { use: "External sensors, RTCs, and I2C/SPI devices", note: "Default slot for standard hardware devices" },
      { use: "Wi-Fi / Bluetooth controller level hardware", note: "Radio and controller initialization" },
      { use: "Network interface binding", note: "Executes after controller-level network hardware is ready" },
      { use: "Middleware: filesystems, UI stacks, protocol clients", note: "Runs during application phase" },
      { use: "Final user application hooks", note: "Last standard application priority slot" },
    ],
    foot: "Priority orders entries only within the same level. Declare hardware dependencies with DRVFX_DEVICE_DT_INST_DEFINE_WITH_DEPS(). Named priorities in drvfx/kernel/init.h (e.g. DRVFX_INIT_PRE_KERNEL_2_BUS_PRIORITY) are recommended.",
  },
  drivers: {
    num: "07",
    en: "IMPLEMENTED DRIVERS",
    zh: "Implemented drvfx Drivers",
    lead: "The I2C, SPI and PCF8563 drivers instantiate from matching device-tree compatible properties. Only nodes with status okay or without a status property are instantiated.",
    fig: "FIG. 3 — Development board and breadboard (illustrative photo)",
    figMeta: "PRE_KERNEL_2 → POST_KERNEL",
    imageAlt: "Microcontroller development board wired to a breadboard and LED",
    photoCredit: "Photo: Chengxin Zhao / Pexels ↗",
    rows: [
      { name: "I2C master bus", note: 'DT-driven multi-instance via compatible: "esp32,i2c"; attach/detach, probe, transceive' },
      { name: "SPI master bus", note: 'DT-driven multi-instance via compatible: "esp32,spi"; acquire/release and transceive' },
      { name: "RTC (software)", note: "Legacy single-instance driver using ESP-IDF system time as an RTC-like device" },
      { name: "RTC (DS1302)", note: "Legacy single-instance GPIO bit-banged support" },
      { name: "RTC (PCF8563)", note: 'DT-driven multi-instance via compatible: "nxp,pcf8563"; depends on the referenced I2C bus' },
    ],
    foot: "Public headers live in components/lwdt/include/drvfx/drivers/, implementations in components/lwdt/drivers/.",
  },
  api: {
    num: "08",
    en: "API REFERENCE",
    zh: "API Reference",
    lead: "Device-tree macros provide compile-time constants from nodes; drvfx APIs retrieve runtime device objects and register initialization entries.",
    macrosTitle: "COMPILE TIME — Device-Tree Access Macros",
    rtTitle: "RUNTIME — drvfx Device APIs",
    macros: [
      "Get a node ID by label — primary entry point",
      "Build a node ID from a path, e.g. soc/i2c0",
      "Check whether a node exists; usable in #if compile-time assertions",
      "Read a scalar property as a constant",
      "Check whether a property exists",
      "Read array property at index i, e.g. reg[0]",
      "Length of an array property",
      'Resolve a phandle reference such as bus: "i2c0"',
      "Same as above, returned as phandle format",
      "Get node label string, used as runtime device name",
      "Get the i-th instance node for a compatible string",
      "Get a property of the i-th instance for a compatible string",
      "Expand macro for every instance with status okay",
    ],
    rt: [
      "Fetch a runtime device object by name; returns NULL on failure",
      "Check whether a device has finished initialization",
      "Register a system-level startup entry (requires WHOLE_ARCHIVE linking)",
      "Register a subsystem-level startup entry",
      "Define a static device object from a device-tree instance",
      "Application entry point, called by LWDT's app_main()",
    ],
    sampleFile: "Fetching a device by label example",
    sample: `#include "drvfx/drvfx.h"
#include <lwdt/lwdt.h>
#include "lwdt_generated.h"

#define I2C0_NODE LWDT_NODELABEL(i2c0)

const struct drvfx_device* i2c0 = k_device_get_binding(LWDT_LABEL(I2C0_NODE));
if ((i2c0 == NULL) || !k_device_is_ready(i2c0)) {
    return -ENODEV;
}`,
  },
  faq: {
    num: "09",
    en: "NOTES & FAQ",
    zh: "Notes & Frequently Asked Questions",
    notesTitle: "Build Considerations",
    notes: [
      "IDF_TARGET is specified by the chosen board.cmake; sdkconfig does not select the board.",
      "When changing targets, remove an existing sdkconfig generated for a different target and reconfigure.",
      "On Windows, separate LWDT_BOARD_ROOTS and LWDT_OVERLAYS paths with semicolons.",
      "Override order: project boards/ → LWDT_BOARD_ROOTS → built-in boards/. First directory with both board.cmake and board.lwdt wins.",
    ],
    faqTitle: "Frequently Asked Questions",
    items: [
      { q: "Does LWDT replace ESP-IDF task scheduling?", a: "LWDT provides no kernel or scheduler. Applications retain the standard ESP-IDF build and runtime environment while LWDT generates device-tree macros and initializes drivers." },
      { q: "Can I still use ESP-IDF Wi-Fi and Bluetooth?", a: "Yes. LWDT integrates as an ESP-IDF component; Wi-Fi, BLE provisioning, mesh and official tooling remain fully available." },
      { q: "Is board.lwdt parsed at runtime?", a: "No. The build generates C macros and static device objects; runtime code uses the compiled configuration directly." },
      { q: "When is drvfx_app_main() called?", a: "The LWDT runtime executes APPLICATION-level init entries in app_main(), then calls the user-defined drvfx_app_main()." },
      { q: "What should I check if an init entry does not execute?", a: "Check that components defining drvfx_app_main() or registering init entries are linked with WHOLE_ARCHIVE TRUE. Otherwise the linker may discard objects referenced only through linker sections." },
      { q: "Which boards are supported out of the box?", a: "Four built in: espressif/esp32-devkitc-1, espressif/esp32-c3-devkitm-1, nologo/esp32-c3-supermini, and espressif/esp32-s3-devkitc-1. Your own boards/ directory can add or override them at any time." },
    ],
  },
  footer: {
    desc: "A lightweight device-tree and driver framework solution for ESP-IDF, inspired by the decoupled driver model and device-tree hardware description of Zephyr RTOS.",
    links: [
      { l: "GitHub Repository ↗", h: GH },
      { l: "README ↗", h: `${GH}#readme` },
      { l: "ESP-IDF ↗", h: "https://github.com/espressif/esp-idf" },
      { l: "Buy me a coffee ↗", h: "https://ko-fi.com/oldrev" },
    ],
  },
};

export const DICT: Record<Lang, Dict> = { zh, en };
