# Board Resolution & Overlays

Each board uses a `vendor/model` ID and maps to a directory containing both `board.cmake` and `board.lwdt`.

## Directory Layout

```text
boards/<vendor>/<model>/
├── board.cmake        # Board metadata, including target
├── board.lwdt         # Base hardware description
└── .lwdt.overlay      # Optional board-level override
```

`board.cmake` must at least define `LWDT_BOARD_IDF_TARGET`:

```cmake
set(LWDT_BOARD_IDF_TARGET esp32c3)
```

## Board Search Precedence

The resolver searches locations in this order. The first directory containing both required files is selected:

1. The project's `boards/` directory.
2. Additional roots supplied through `LWDT_BOARD_ROOTS`.
3. Built-in BSPs under `components/lwdt/boards/`.

Projects can override a built-in board by creating a same-ID directory locally without modifying the LWDT component.

## Overlay Merge Order

After the selected base `board.lwdt`, these files merge in order using Jsonnet `+` semantics:

1. `boards/<vendor>/<model>/.lwdt.overlay`
2. Project-root `.lwdt.overlay`
3. Explicit list from `LWDT_OVERLAYS` or `-DLWDT_OVERLAYS=<path1>;<path2>`

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

:::note[Windows path separator]
On Windows, use semicolons between `LWDT_BOARD_ROOTS` and `LWDT_OVERLAYS` paths because colons conflict with drive letters.
:::