/**
 * Enumerations for core game values.
 */
export const GameState = Object.freeze({
  MENU: "menu",
  PLAYING: "playing",
  PAUSED: "paused",
  GAME_OVER: "game_over",
});

export const RotationDirection = Object.freeze({
  CW: 1,
  CCW: -1,
});

export const InputAction = Object.freeze({
  MOVE_LEFT: "move_left",
  MOVE_RIGHT: "move_right",
  SOFT_DROP: "soft_drop",
  HARD_DROP: "hard_drop",
  ROTATE_CW: "rotate_cw",
  ROTATE_CCW: "rotate_ccw",
  HOLD: "hold",
  PAUSE: "pause",
  RESET: "reset",
  START: "start",
});
