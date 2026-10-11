import type { Lang } from "../i18n";

import overviewZh from "./zh/overview.md?raw";
import quickstartZh from "./zh/quickstart.md?raw";
import cmakeZh from "./zh/cmake.md?raw";
import devicetreeZh from "./zh/devicetree.md?raw";
import boardsZh from "./zh/boards.md?raw";
import drvfxZh from "./zh/drvfx.md?raw";
import bootZh from "./zh/boot.md?raw";
import driversZh from "./zh/drivers.md?raw";
import apiMacrosZh from "./zh/api-macros.md?raw";
import apiRuntimeZh from "./zh/api-runtime.md?raw";
import faqZh from "./zh/faq.md?raw";

import overviewEn from "./en/overview.md?raw";
import quickstartEn from "./en/quickstart.md?raw";
import cmakeEn from "./en/cmake.md?raw";
import devicetreeEn from "./en/devicetree.md?raw";
import boardsEn from "./en/boards.md?raw";
import drvfxEn from "./en/drvfx.md?raw";
import bootEn from "./en/boot.md?raw";
import driversEn from "./en/drivers.md?raw";
import apiMacrosEn from "./en/api-macros.md?raw";
import apiRuntimeEn from "./en/api-runtime.md?raw";
import faqEn from "./en/faq.md?raw";

export const DOCS: Record<Lang, Record<string, string>> = {
  zh: {
    overview: overviewZh,
    quickstart: quickstartZh,
    cmake: cmakeZh,
    devicetree: devicetreeZh,
    boards: boardsZh,
    drvfx: drvfxZh,
    boot: bootZh,
    drivers: driversZh,
    "api-macros": apiMacrosZh,
    "api-runtime": apiRuntimeZh,
    faq: faqZh,
  },
  en: {
    overview: overviewEn,
    quickstart: quickstartEn,
    cmake: cmakeEn,
    devicetree: devicetreeEn,
    boards: boardsEn,
    drvfx: drvfxEn,
    boot: bootEn,
    drivers: driversEn,
    "api-macros": apiMacrosEn,
    "api-runtime": apiRuntimeEn,
    faq: faqEn,
  },
};