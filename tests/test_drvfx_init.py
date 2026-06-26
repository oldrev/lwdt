from __future__ import annotations

from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
INIT_HEADER = REPO_ROOT / "components" / "lwdt" / "include" / "drvfx" / "kernel" / "init.h"


def test_drvfx_priorities_follow_zephyr_range() -> None:
    text = INIT_HEADER.read_text(encoding="utf-8")

    assert "#define DRVFX_INIT_PRE_KERNEL_2_BUS_PRIORITY 50" in text
    assert "#define DRVFX_INIT_POST_KERNEL_DEVICE_PRIORITY 50" in text
    assert "#define DRVFX_INIT_APPLICATION_USER_PRIORITY 99" in text
    assert "5000" not in text
    assert "5100" not in text
    assert "6200" not in text


def test_bus_drivers_use_pre_kernel_2_priority() -> None:
    i2c = (REPO_ROOT / "components" / "lwdt" / "drivers" / "i2c" / "idf.c").read_text(encoding="utf-8")
    spi = (REPO_ROOT / "components" / "lwdt" / "drivers" / "spi" / "idf.c").read_text(encoding="utf-8")

    assert "PRE_KERNEL_2" in i2c
    assert "DRVFX_INIT_PRE_KERNEL_2_BUS_PRIORITY" in i2c
    assert "PRE_KERNEL_2" in spi
    assert "DRVFX_INIT_PRE_KERNEL_2_BUS_PRIORITY" in spi


def test_example_uses_drvfx_app_main_entry() -> None:
    source = (REPO_ROOT / "example" / "main" / "blink_example_main.c").read_text(encoding="utf-8")

    assert "void drvfx_app_main(void)" in source
    assert "void app_main(void)" not in source


def test_example_main_component_uses_whole_archive() -> None:
    cmake = (REPO_ROOT / "example" / "main" / "CMakeLists.txt").read_text(encoding="utf-8")

    assert "WHOLE_ARCHIVE TRUE" in cmake
