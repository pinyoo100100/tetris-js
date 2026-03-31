/**
 * Animation handles transient visual effects.
 */
import { GAME_CONFIG } from "../config/gameConfig.js";

export class Animation {
  constructor() {
    this.lineClear = null;
  }

  triggerLineClear(rows) {
    this.lineClear = {
      rows,
      elapsed: 0,
      duration: GAME_CONFIG.timing.lineClearDelay,
    };
  }

  update(delta) {
    if (!this.lineClear) {
      return;
    }
    this.lineClear.elapsed += delta;
    if (this.lineClear.elapsed >= this.lineClear.duration) {
      this.lineClear = null;
    }
  }

  getLineClearAlpha() {
    if (!this.lineClear) {
      return 0;
    }
    const progress = this.lineClear.elapsed / this.lineClear.duration;
    return 1 - Math.min(progress, 1);
  }
}
