import { useMemo, useState, type ReactNode } from "react";
import { BOARDS, type Board, type Dict } from "../i18n";
import { CodeBlock } from "./CodeBlock";

type HW = {
  led_gpio: number;
  led_active_low: number;
  led_name: string;
  sda: number;
  scl: number;
  freq: number;
  has_rtc: boolean;
};

const fromBoard = (b: Board): HW => ({
  led_gpio: b.led_gpio,
  led_active_low: b.led_active_low,
  led_name: b.led_name,
  sda: b.sda,
  scl: b.scl,
  freq: b.freq,
  has_rtc: false,
});

const pad = (s: string, n: number) => s + " ".repeat(Math.max(1, n - s.length));

export function BoardStudio({ t }: { t: Dict }) {
  const [boardIdx, setBoardIdx] = useState(0);
  const [ovBoard, setOvBoard] = useState(true);
  const [ovProj, setOvProj] = useState(false);
  const s = t.studio;

  const board = BOARDS[boardIdx];

  const { hw, changed, source, highlightLeft } = useMemo(() => {
    const base: HW = fromBoard(board);
    const changedKeys = new Set<string>();
    let next = base;

    const blocks: { text: string; on: boolean }[] = [
      {
        text: `// components/lwdt/boards/${board.id}/board.lwdt   ← ${s.cBase}\n{\n  board: {\n    label: "board",\n    led_gpio: ${base.led_gpio},\n    led_active_low: ${base.led_active_low},\n    led_name: "${base.led_name}",\n  },\n  soc+: {\n    i2c0+: {\n      status: "okay",\n      sda_gpio: ${base.sda},\n      scl_gpio: ${base.scl},\n      clock_frequency: ${base.freq},\n    },\n  },\n}`,
        on: true,
      },
    ];

    if (ovBoard) {
      next = { ...next, led_gpio: 9, led_name: `${base.led_name} rev.B` };
      changedKeys.add("led_gpio");
      changedKeys.add("led_name");
      blocks.push({
        text: `// boards/${board.id}/.lwdt.overlay   ← ${s.cBoardOv}\n{\n  board+: {\n    led_gpio: 9,\n    led_name: "${base.led_name} rev.B",\n  },\n}`,
        on: true,
      });
    } else {
      blocks.push({ text: `// boards/${board.id}/.lwdt.overlay   — ${s.cOff}`, on: false });
    }

    if (ovProj) {
      next = { ...next, freq: 1000000, has_rtc: true };
      changedKeys.add("clock_frequency");
      changedKeys.add("rtc0");
      blocks.push({
        text: `// .lwdt.overlay   ← ${s.cProjOv}\n{\n  soc+: {\n    i2c0+: { clock_frequency: 1000000 },\n    rtc0: {\n      label: "rtc0",\n      compatible: "nxp,pcf8563",\n      status: "okay",\n      bus: "i2c0",\n      reg: [81],\n    },\n  },\n}`,
        on: true,
      });
    } else {
      blocks.push({ text: `// .lwdt.overlay   — ${s.cOff}`, on: false });
    }

    const lines: string[] = [];
    const hi: number[] = [];
    blocks.forEach((b) => {
      const start = lines.length;
      b.text.split("\n").forEach((l) => lines.push(l));
      if (b.on && start > 0) for (let i = start; i < lines.length; i++) hi.push(i);
    });

    return { hw: next, changed: changedKeys, source: lines.join("\n"), highlightLeft: hi };
  }, [board, ovBoard, ovProj, s]);

  const header = useMemo(() => {
    const L: string[] = [];
    const push = (text: string, ch = false) => L.push((ch ? "!" : " ") + text);
    const nOv = [ovBoard, ovProj].filter(Boolean).length;

    push(`/* ${s.cGen} + ${nOv} ${s.cOverlays} */`);
    push(`#ifndef LWDT_GENERATED_H`);
    push(`#define LWDT_GENERATED_H`);
    push(``);
    push(`${pad("#define LWDT_BOARD_ID", 30)}"${board.id}"`);
    push(`${pad("#define LWDT_BOARD_IDF_TARGET", 30)}${board.target}   /* board.cmake */`);
    push(``);
    push(`/* ${s.cNode}: board */`);
    push(`${pad("#define LWDT_NS_board_P_led_gpio", 30)}${hw.led_gpio}`, changed.has("led_gpio"));
    push(`${pad("#define LWDT_NS_board_P_led_active_low", 30)}${hw.led_active_low}`);
    push(`${pad("#define LWDT_NS_board_P_led_name", 30)}"${hw.led_name}"`, changed.has("led_name"));
    push(``);
    push(`/* ${s.cNode}: soc/i2c0   compatible = "esp32,i2c" */`);
    push(`${pad("#define LWDT_NS_soc_P_i2c0_P_sda_gpio", 30)}${hw.sda}`);
    push(`${pad("#define LWDT_NS_soc_P_i2c0_P_scl_gpio", 30)}${hw.scl}`);
    push(`${pad("#define LWDT_NS_soc_P_i2c0_P_clock_frequency", 30)}${hw.freq}`, changed.has("clock_frequency"));
    push(`${pad("#define LWDT_LABEL_soc_i2c0", 30)}"i2c0"`);
    if (hw.has_rtc) {
      push(``);
      push(`/* ${s.cNode}: soc/rtc0   compatible = "nxp,pcf8563" */`, true);
      push(`${pad("#define LWDT_INST_0_nxp_pcf8563", 30)}"rtc0"`, true);
      push(`${pad("#define LWDT_NS_soc_P_rtc0_P_reg_0", 30)}81`, true);
      push(`${pad("#define LWDT_NS_soc_P_rtc0_P_bus", 30)}LWDT_NODELABEL(i2c0)`, true);
    }
    push(``);
    push(`/* ${s.cUse} */`);
    push(`#define BOARD_NODE   LWDT_NODELABEL(board)`);
    push(`#define BLINK_GPIO   LWDT_PROP(BOARD_NODE, led_gpio)`);
    push(`#define BOARD_NAME   LWDT_PROP(BOARD_NODE, led_name)`);
    push(`#endif /* LWDT_GENERATED_H */`);

    const hi: number[] = [];
    const text = L.map((raw, i) => {
      const ch = raw.startsWith("!");
      if (ch) hi.push(i);
      return ch ? raw.slice(1) : raw;
    });
    return { text: text.join("\n"), hi };
  }, [hw, board, changed, ovBoard, ovProj, s]);

  const roots = [
    { n: "1", p: "boards/<vendor>/<model>/", hit: false },
    { n: "2", p: "LWDT_BOARD_ROOTS", hit: false },
    { n: "3", p: "components/lwdt/boards/", hit: true },
  ];

  const Chip = ({
    active,
    onClick,
    children,
  }: {
    active: boolean;
    onClick: () => void;
    children: ReactNode;
  }) => (
    <button
      onClick={onClick}
      className={`micro border px-3 py-2 transition-colors duration-150 ${
        active
          ? "border-orange bg-orange text-on-orange"
          : "border-line-soft bg-transparent text-ink hover:border-line hover:bg-paper-3"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="border-2 border-line bg-paper">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 bg-panel px-4 py-3 text-panel-fg">
        <span className="micro text-hazard">{s.title}</span>
        <span className="micro opacity-60">{s.sub}</span>
      </div>

      <div className="border-b border-line-soft px-4 py-4">
        <div className="micro mb-3 text-warm">{s.step1}</div>
        <div className="flex flex-wrap gap-2">
          {BOARDS.map((b, i) => (
            <Chip key={b.id} active={i === boardIdx} onClick={() => setBoardIdx(i)}>
              {b.id}
            </Chip>
          ))}
        </div>
        <div className="micro mb-3 mt-5 text-warm">{s.step2}</div>
        <div className="flex flex-wrap gap-2">
          <Chip active={ovBoard} onClick={() => setOvBoard(!ovBoard)}>
            {s.ovBoard}
          </Chip>
          <Chip active={ovProj} onClick={() => setOvProj(!ovProj)}>
            {s.ovProj}
          </Chip>
        </div>
      </div>

      <div className="grid lg:grid-cols-2">
        <div className="border-b border-line-soft lg:border-b-0 lg:border-r">
          <CodeBlock
            t={t}
            code={source}
            file={s.leftFile}
            tone="dark"
            highlight={highlightLeft}
            caption={s.leftCap}
          />
        </div>
        <div>
          <CodeBlock
            t={t}
            code={header.text}
            file={s.rightFile}
            tone="paper"
            highlight={header.hi}
            caption={s.rightCap}
          />
        </div>
      </div>

      <div className="grid border-t-2 border-line bg-paper-2 sm:grid-cols-3">
        {[
          { k: "LWDT_BOARD_ID", v: board.id },
          { k: "LWDT_BOARD_IDF_TARGET", v: board.target },
          { k: "LED_GPIO →", v: String(hw.led_gpio) },
        ].map((x) => (
          <div key={x.k} className="border-line-soft px-4 py-3 sm:border-r sm:last:border-r-0">
            <div className="micro text-warm">{x.k}</div>
            <div className="mt-1.5 font-mono text-[13px] font-medium text-ink">{x.v}</div>
          </div>
        ))}
      </div>

      <div className="border-t border-line-soft px-4 py-4">
        <div className="micro mb-3 text-warm">{s.resolveTitle}</div>
        <ol className="flex flex-col gap-1.5">
          {roots.map((r) => (
            <li key={r.n} className="flex flex-wrap items-center gap-3 font-mono text-[12.5px]">
              <span
                className={`grid h-5 w-5 shrink-0 place-items-center text-[11px] ${
                  r.hit ? "bg-orange text-on-orange" : "bg-paper-3 text-warm"
                }`}
              >
                {r.n}
              </span>
              <span className={r.hit ? "text-ink" : "text-warm line-through decoration-warm-2"}>{r.p}</span>
              {r.hit && <span className="micro text-orange-ink">{s.hit}</span>}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
