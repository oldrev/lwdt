from __future__ import annotations

from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
BOARD_ROOT = REPO_ROOT / "example" / "boards"


EXPECTED_BOARDS = {
    "espressif/esp32-devkitc-1": "esp32",
    "nologo/esp32-c3-supermini": "esp32c3",
    "espressif/esp32-s3-devkitc-1": "esp32s3",
}


def test_example_boards_use_directory_ids() -> None:
    for board_id, idf_target in EXPECTED_BOARDS.items():
        board_dir = BOARD_ROOT / board_id
        board_file = board_dir / "board.lwdt"
        board_meta = board_dir / "board.cmake"
        meta_text = board_meta.read_text(encoding="utf-8")

        assert board_dir.is_dir(), board_id
        assert board_file.is_file(), board_file
        assert board_meta.is_file(), board_meta
        assert f'set(LWDT_BOARD_IDF_TARGET "{idf_target}")' in meta_text


def test_example_boards_follow_vendor_model_layout() -> None:
    for board_id in EXPECTED_BOARDS:
        parts = Path(board_id).parts
        assert len(parts) == 2, board_id
        assert all(parts), board_id