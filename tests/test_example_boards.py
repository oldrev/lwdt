from __future__ import annotations

from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
BUILTIN_BOARD_ROOT = REPO_ROOT / "components" / "lwdt" / "boards"
PROJECT_BOARD_ROOT = REPO_ROOT / "example" / "boards"


EXPECTED_BOARDS = {
    "espressif/esp32-devkitc-1": "esp32",
    "nologo/esp32-c3-supermini": "esp32c3",
    "espressif/esp32-s3-devkitc-1": "esp32s3",
}


def test_builtin_boards_use_directory_ids() -> None:
    for board_id, idf_target in EXPECTED_BOARDS.items():
        board_dir = BUILTIN_BOARD_ROOT / board_id
        board_file = board_dir / "board.lwdt"
        board_meta = board_dir / "board.cmake"
        meta_text = board_meta.read_text(encoding="utf-8")

        assert board_dir.is_dir(), board_id
        assert board_file.is_file(), board_file
        assert board_meta.is_file(), board_meta
        assert f'set(LWDT_BOARD_IDF_TARGET "{idf_target}")' in meta_text


def test_builtin_boards_follow_vendor_model_layout() -> None:
    for board_id in EXPECTED_BOARDS:
        parts = Path(board_id).parts
        assert len(parts) == 2, board_id
        assert all(parts), board_id


def test_project_board_overlay_can_override_builtin_board() -> None:
    overlay = PROJECT_BOARD_ROOT / "nologo" / "esp32-c3-supermini" / ".lwdt.overlay"

    assert overlay.is_file()
    assert "board+:" in overlay.read_text(encoding="utf-8")


def test_example_uses_reusable_board_resolver() -> None:
    cmake_text = (REPO_ROOT / "example" / "CMakeLists.txt").read_text(encoding="utf-8")

    assert "components/lwdt/cmake/lwdt_board.cmake" in cmake_text
    assert cmake_text.index("lwdt_board.cmake") < cmake_text.index("project.cmake")
