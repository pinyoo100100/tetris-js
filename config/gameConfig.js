/**
 * Global game configuration values.
 */
export const GAME_CONFIG = Object.freeze({
  grid: {
    columns: 10,
    rows: 20,
    hiddenRows: 2,
    cellSize: 28,
    lineWidth: 1,
    borderRadius: 6,
  },
  canvas: {
    padding: 20,
    panelWidth: 180,
    background: "#0b0f1a",
  },
  timing: {
    baseDropInterval: 1000,
    minDropInterval: 80,
    softDropInterval: 50,
    lockDelay: 500,
    das: 140,
    arr: 45,
    lineClearDelay: 220,
  },
  scoring: {
    lineClear: [0, 100, 300, 500, 800],
    softDrop: 1,
    hardDrop: 2,
    comboBonus: 50,
    linesPerLevel: 10,
  },
  ui: {
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    accent: "#7dd3fc",
    text: "#e2e8f0",
    muted: "#94a3b8",
    panel: "#111827",
  },
  input: {
    repeatDelay: 140,
    repeatInterval: 45,
    keyBindings: {
      moveLeft: ["ArrowLeft", "KeyA"],
      moveRight: ["ArrowRight", "KeyD"],
      softDrop: ["ArrowDown", "KeyS"],
      hardDrop: ["Space"],
      rotateCW: ["ArrowUp", "KeyX"],
      rotateCCW: ["KeyZ"],
      hold: ["ShiftLeft", "ShiftRight", "KeyC"],
      pause: ["Escape", "KeyP"],
      start: ["Enter"],
      reset: ["KeyR"],
    },
  },
});
