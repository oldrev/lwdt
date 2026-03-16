from __future__ import annotations

import subprocess
import sys
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
SCRIPT = REPO_ROOT / "lwdt2h.py"


def run_lwdt(*args: str, cwd: Path | None = None) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [sys.executable, str(SCRIPT), *args],
        cwd=cwd or REPO_ROOT,
        capture_output=True,
        text=True,
        check=False,
    )


def generate_header(tmp_path: Path, source: str) -> str:
    output = tmp_path / "generated.h"
    result = run_lwdt("--basedir", "dt", "-o", str(output), source)
    assert result.returncode == 0, result.stderr or result.stdout
    return output.read_text(encoding="utf-8")


def test_board_emits_phandle_compatibility_aliases(tmp_path: Path) -> None:
    header = generate_header(tmp_path, "dt/board.lwdt")

    assert "#define LWDT_NS_lighting_S_status_rgb_P_enable_gpios_PHANDLE LWDT_NS_soc_S_gpio0" in header
    assert (
        "#define LWDT_NS_lighting_S_status_rgb_P_enable_gpios_PH "
        "LWDT_NS_lighting_S_status_rgb_P_enable_gpios_PHANDLE"
    ) in header


def test_complex_tree_emits_string_reference_macros(tmp_path: Path) -> None:
    header = generate_header(tmp_path, "dt/board_complex.lwdt")

    assert "#define LWDT_NS_soc_P_fans_IDX_0_NODE LWDT_NS_soc_S_spi0" in header
    assert "#define LWDT_NS_soc_P_fans_IDX_2_NODE LWDT_NS_soc_S_spi0" in header


def test_board2_relative_reference_resolves_to_node(tmp_path: Path) -> None:
    header = generate_header(tmp_path, "dt/board2.lwdt")

    assert "#define LWDT_NS_power_P_spi_ref_NODE LWDT_NS_soc_S_spi0" in header
    assert "#define LWDT_NS_power_P_capacitor_NODE LWDT_NS_power" in header


def test_flat_dict_properties_do_not_become_child_nodes(tmp_path: Path) -> None:
    header = generate_header(tmp_path, "dt/board_complex.lwdt")

    assert "#define LWDT_NS_soc_S_spi0_S_touchscreen_P_config_mode \"4wire\"" in header
    assert "LWDT_NS_soc_S_spi0_S_touchscreen_S_config_EXISTS" not in header


def test_strict_fails_on_unresolved_explicit_string_reference(tmp_path: Path) -> None:
    source = tmp_path / "bad_ref.lwdt"
    source.write_text(
        """
soc {
    bad-ref = "#/soc/missing"
}
""".strip(),
        encoding="utf-8",
    )

    result = run_lwdt("--strict", "--check", str(source), cwd=tmp_path)

    assert result.returncode != 0
    assert "Unresolved node reference '#/soc/missing'" in result.stderr


def test_strict_fails_on_unresolved_phandle_spec(tmp_path: Path) -> None:
    source = tmp_path / "bad_phandle.lwdt"
    source.write_text(
        """
soc {
    peripheral = { node: "missing-device", pin: 3 }
}
""".strip(),
        encoding="utf-8",
    )

    result = run_lwdt("--strict", "--check", str(source), cwd=tmp_path)

    assert result.returncode != 0
    assert "Unresolved node reference 'missing-device'" in result.stderr


def test_angle_include_resolves_from_basedir(tmp_path: Path) -> None:
    include_base = tmp_path / "dt"
    source_dir = tmp_path / "app"
    include_base.mkdir()
    source_dir.mkdir()

    (include_base / "soc.lwdt").write_text(
        """
soc {
    uart0 {
        compatible = "demo,uart"
        reg = [ 0x4000 ]
    }
}
""".strip(),
        encoding="utf-8",
    )
    (source_dir / "board.lwdt").write_text(
        """
include <soc.lwdt>

chosen {
    console = "#/soc/uart0"
}
""".strip(),
        encoding="utf-8",
    )

    output = tmp_path / "generated.h"
    result = run_lwdt("--basedir", str(include_base), "-o", str(output), str(source_dir / "board.lwdt"), cwd=tmp_path)

    assert result.returncode == 0, result.stderr or result.stdout
    header = output.read_text(encoding="utf-8")
    assert "#define LWDT_NS_soc_S_uart0_EXISTS 1" in header
    assert "#define LWDT_N_ROOT_P_chosen_console_NODE LWDT_NS_soc_S_uart0" in header


def test_quoted_include_stays_relative_to_including_file(tmp_path: Path) -> None:
    include_base = tmp_path / "dt"
    source_dir = tmp_path / "app"
    drivers_dir = source_dir / "drivers"
    include_base.mkdir()
    source_dir.mkdir()
    drivers_dir.mkdir()

    (include_base / "common.lwdt").write_text(
        """
common {
    from-base = true
}
""".strip(),
        encoding="utf-8",
    )
    (drivers_dir / "sensor.lwdt").write_text(
        """
sensor {
    compatible = "demo,sensor"
    reg = [ 0x5000 ]
}
""".strip(),
        encoding="utf-8",
    )
    (source_dir / "board.lwdt").write_text(
        """
include <common.lwdt>
include "drivers/sensor.lwdt"

chosen {
    device = "#/sensor"
}
""".strip(),
        encoding="utf-8",
    )

    output = tmp_path / "generated.h"
    result = run_lwdt("--basedir", str(include_base), "-o", str(output), str(source_dir / "board.lwdt"), cwd=tmp_path)

    assert result.returncode == 0, result.stderr or result.stdout
    header = output.read_text(encoding="utf-8")
    assert "#define LWDT_NS_sensor_EXISTS 1" in header
    assert "#define LWDT_N_ROOT_P_chosen_device_NODE LWDT_NS_sensor" in header
    assert "#define LWDT_N_ROOT_P_common_from_base 1" in header


def test_angle_include_requires_basedir(tmp_path: Path) -> None:
    source = tmp_path / "board.lwdt"
    source.write_text(
        """
include <missing.lwdt>

root {
    ok = true
}
""".strip(),
        encoding="utf-8",
    )

    result = run_lwdt("--check", str(source), cwd=tmp_path)

    assert result.returncode != 0
    assert "requires --basedir" in result.stderr