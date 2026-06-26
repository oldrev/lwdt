from __future__ import annotations

import subprocess
import sys
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
SCRIPT = REPO_ROOT / "components/lwdt/lwdt2h.py"


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
    header = generate_header(tmp_path, "components/lwdt/dt/board.lwdt")

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
{
  soc: {
    bad_ref: "#/soc/missing",
  },
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
{
  soc: {
    peripheral: { node: "missing-device", pin: 3 },
  },
}
""".strip(),
        encoding="utf-8",
    )

    result = run_lwdt("--strict", "--check", str(source), cwd=tmp_path)

    assert result.returncode != 0
    assert "Unresolved node reference 'missing-device'" in result.stderr


def test_import_resolves_from_basedir(tmp_path: Path) -> None:
    include_base = tmp_path / "dt"
    source_dir = tmp_path / "app"
    include_base.mkdir()
    source_dir.mkdir()

    (include_base / "soc.lwdt").write_text(
        """
{
  soc: {
    uart0: {
      compatible: "demo,uart",
      reg: [16384],
    },
  },
}
""".strip(),
        encoding="utf-8",
    )
    (source_dir / "board.lwdt").write_text(
        """
(import "soc.lwdt") + {
  chosen: {
    console: "#/soc/uart0",
  },
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


def test_import_stays_relative_to_including_file(tmp_path: Path) -> None:
    include_base = tmp_path / "dt"
    source_dir = tmp_path / "app"
    drivers_dir = source_dir / "drivers"
    include_base.mkdir()
    source_dir.mkdir()
    drivers_dir.mkdir()

    (include_base / "common.lwdt").write_text(
        """
{
  common: {
    from_base: true,
  },
}
""".strip(),
        encoding="utf-8",
    )
    (drivers_dir / "sensor.lwdt").write_text(
        """
{
  sensor: {
    compatible: "demo,sensor",
    reg: [20480],
  },
}
""".strip(),
        encoding="utf-8",
    )
    (source_dir / "board.lwdt").write_text(
        """
(import "common.lwdt") + (import "drivers/sensor.lwdt") + {
  chosen: {
    device: "#/sensor",
  },
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
    assert "#define LWDT_NS_common_P_from_base 1" in header


def test_overlay_applies_after_base(tmp_path: Path) -> None:
    base = tmp_path / "board.lwdt"
    overlay = tmp_path / ".lwdt.overlay"
    output = tmp_path / "generated.h"
    base.write_text(
        """
{
  board: {
    label: "board",
    led_gpio: 8,
    led_name: "base",
  },
}
""".strip(),
        encoding="utf-8",
    )
    overlay.write_text(
        """
{
  board+: {
    led_gpio: 10,
    led_name: "overlay",
  },
}
""".strip(),
        encoding="utf-8",
    )

    result = run_lwdt("--overlay", str(overlay), "-o", str(output), str(base), cwd=tmp_path)

    assert result.returncode == 0, result.stderr or result.stdout
    header = output.read_text(encoding="utf-8")
    assert "#define LWDT_NS_board_P_led_gpio 10" in header
    assert "#define LWDT_NS_board_P_led_name \"overlay\"" in header


def test_multiple_overlays_apply_in_order(tmp_path: Path) -> None:
    base = tmp_path / "board.lwdt"
    first = tmp_path / "first.lwdt.overlay"
    second = tmp_path / "second.lwdt.overlay"
    output = tmp_path / "generated.h"
    base.write_text("{ board: { led_gpio: 1, led_name: \"base\" } }", encoding="utf-8")
    first.write_text("{ board+: { led_gpio: 2, led_name: \"first\" } }", encoding="utf-8")
    second.write_text("{ board+: { led_name: \"second\" } }", encoding="utf-8")

    result = run_lwdt(
        "--overlay",
        str(first),
        "--overlay",
        str(second),
        "-o",
        str(output),
        str(base),
        cwd=tmp_path,
    )

    assert result.returncode == 0, result.stderr or result.stdout
    header = output.read_text(encoding="utf-8")
    assert "#define LWDT_NS_board_P_led_gpio 2" in header
    assert "#define LWDT_NS_board_P_led_name \"second\"" in header


def test_missing_import_reports_search_paths(tmp_path: Path) -> None:
    source = tmp_path / "board.lwdt"
    source.write_text(
        """
(import "missing.lwdt") + {
  root: {
    ok: true,
  },
}
""".strip(),
        encoding="utf-8",
    )

    result = run_lwdt("--check", str(source), cwd=tmp_path)

    assert result.returncode != 0
    assert "could not import 'missing.lwdt'" in result.stderr


def test_instance_foreach_status_okay_is_file_scope_friendly(tmp_path: Path) -> None:
    source = tmp_path / "multi_inst.lwdt"
    output = tmp_path / "generated.h"
    source.write_text(
        """
{
  soc: {
    i2c0: {
      label: "i2c0",
      compatible: "esp32,i2c",
      status: "okay",
      port: 0,
      sda_gpio: 4,
      scl_gpio: 5,
      clock_frequency: 400000,
      pullup: true,
    },
    i2c1: {
      label: "i2c1",
      compatible: "esp32,i2c",
      status: "disabled",
      port: 1,
      sda_gpio: 6,
      scl_gpio: 7,
      clock_frequency: 100000,
      pullup: true,
    },
  },
}
""".strip(),
        encoding="utf-8",
    )

    result = run_lwdt("-o", str(output), str(source), cwd=tmp_path)

    assert result.returncode == 0, result.stderr or result.stdout
    header = output.read_text(encoding="utf-8")
    assert (
        "#define LWDT_INST_FOREACH_esp32_i2c(macro) "
        "macro(0, LWDT_NS_INST_0_esp32_i2c) macro(1, LWDT_NS_INST_1_esp32_i2c)"
    ) in header
    assert (
        "#define LWDT_INST_FOREACH_STATUS_OKAY_esp32_i2c(macro) "
        "macro(0, LWDT_NS_INST_0_esp32_i2c)"
    ) in header
    assert "do {" not in header
