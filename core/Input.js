/**
 * Input handles keyboard bindings and action dispatch.
 */
import { GAME_CONFIG } from "../config/gameConfig.js";
import { InputAction } from "../utils/enums.js";

export class Input {
  constructor() {
    this.bindings = GAME_CONFIG.input.keyBindings;
    this.repeatDelay = GAME_CONFIG.input.repeatDelay;
    this.repeatInterval = GAME_CONFIG.input.repeatInterval;
    this.heldKeys = new Set();
    this.actionQueue = new Set();

    this.repeatState = {
      [InputAction.MOVE_LEFT]: { active: false, elapsed: 0, hasRepeated: false },
      [InputAction.MOVE_RIGHT]: { active: false, elapsed: 0, hasRepeated: false },
      [InputAction.SOFT_DROP]: { active: false, elapsed: 0, hasRepeated: false },
    };

    this.keyMap = this.createKeyMap();
    this.attach();
  }

  createKeyMap() {
    const map = new Map();
    const register = (action, keys) => {
      keys.forEach((key) => map.set(key, action));
    };

    register(InputAction.MOVE_LEFT, this.bindings.moveLeft);
    register(InputAction.MOVE_RIGHT, this.bindings.moveRight);
    register(InputAction.SOFT_DROP, this.bindings.softDrop);
    register(InputAction.HARD_DROP, this.bindings.hardDrop);
    register(InputAction.ROTATE_CW, this.bindings.rotateCW);
    register(InputAction.ROTATE_CCW, this.bindings.rotateCCW);
    register(InputAction.HOLD, this.bindings.hold);
    register(InputAction.PAUSE, this.bindings.pause);
    register(InputAction.START, this.bindings.start);
    register(InputAction.RESET, this.bindings.reset);

    return map;
  }

  attach() {
    window.addEventListener("keydown", (event) => {
      const action = this.keyMap.get(event.code);
      if (!action) {
        return;
      }
      event.preventDefault();
      if (!this.heldKeys.has(event.code)) {
        if (this.repeatState[action]) {
          this.repeatState[action] = { active: true, elapsed: 0, hasRepeated: false };
          this.actionQueue.add(action);
        } else {
          this.actionQueue.add(action);
        }
      }
      this.heldKeys.add(event.code);
    });

    window.addEventListener("keyup", (event) => {
      const action = this.keyMap.get(event.code);
      if (!action) {
        return;
      }
      event.preventDefault();
      this.heldKeys.delete(event.code);
      if (this.repeatState[action]) {
        this.repeatState[action] = { active: false, elapsed: 0, hasRepeated: false };
      }
    });
  }

  update(delta) {
    const actions = new Set(this.actionQueue);
    this.actionQueue.clear();

    Object.entries(this.repeatState).forEach(([action, state]) => {
      if (!state.active) {
        return;
      }
      state.elapsed += delta;
      const interval = state.hasRepeated ? this.repeatInterval : this.repeatDelay;
      while (state.elapsed >= interval) {
        actions.add(action);
        state.elapsed -= interval;
        state.hasRepeated = true;
      }
    });

    return actions;
  }
}
