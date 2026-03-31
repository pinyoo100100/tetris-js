/**
 * Screens renders modal overlays for menu and pause states.
 */
import { GAME_CONFIG } from "../config/gameConfig.js";
import { GameState } from "../utils/enums.js";

export class Screens {
  render(ctx, layout, state, game) {
    if (state === GameState.PLAYING) {
      return;
    }

    ctx.save();
    ctx.fillStyle = "rgba(15, 23, 42, 0.78)";
    ctx.fillRect(layout.boardX, layout.boardY, layout.boardWidth, layout.boardHeight);

    ctx.fillStyle = GAME_CONFIG.ui.text;
    ctx.textAlign = "center";

    const centerX = layout.boardX + layout.boardWidth / 2;
    const centerY = layout.boardY + layout.boardHeight / 2;

    if (state === GameState.MENU) {
      ctx.font = `700 28px ${GAME_CONFIG.ui.fontFamily}`;
      ctx.fillText("TETRIS", centerX, centerY - 20);
      ctx.font = `500 16px ${GAME_CONFIG.ui.fontFamily}`;
      ctx.fillStyle = GAME_CONFIG.ui.muted;
      ctx.fillText("Press Enter to Start", centerX, centerY + 20);
    }

    if (state === GameState.PAUSED) {
      ctx.font = `700 24px ${GAME_CONFIG.ui.fontFamily}`;
      ctx.fillText("PAUSED", centerX, centerY - 10);
      ctx.font = `500 16px ${GAME_CONFIG.ui.fontFamily}`;
      ctx.fillStyle = GAME_CONFIG.ui.muted;
      ctx.fillText("Press Esc to Resume", centerX, centerY + 22);
    }

    if (state === GameState.GAME_OVER) {
      ctx.font = `700 24px ${GAME_CONFIG.ui.fontFamily}`;
      ctx.fillText("GAME OVER", centerX, centerY - 24);
      ctx.font = `500 16px ${GAME_CONFIG.ui.fontFamily}`;
      ctx.fillStyle = GAME_CONFIG.ui.muted;
      ctx.fillText(`Score: ${game.score.score}`, centerX, centerY + 4);
      ctx.fillText("Press Enter to Restart", centerX, centerY + 28);
    }

    ctx.restore();
  }
}
