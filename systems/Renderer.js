/**
 * Renderer draws the board, pieces, and UI panels on canvas.
 */
import { GAME_CONFIG } from "../config/gameConfig.js";
import { PIECE_COLORS, TETROMINO_SHAPES } from "../utils/constants.js";
import { GameState } from "../utils/enums.js";

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.layout = this.computeLayout();
    this.blockTextures = this.createBlockTextures();
    this.configureCanvas();
  }

  computeLayout() {
    const { columns, rows, cellSize } = GAME_CONFIG.grid;
    const padding = GAME_CONFIG.canvas.padding;
    const panelWidth = GAME_CONFIG.canvas.panelWidth;
    const boardWidth = columns * cellSize;
    const boardHeight = rows * cellSize;
    const gap = padding;

    const width = padding * 4 + panelWidth * 2 + boardWidth;
    const height = padding * 2 + boardHeight;

    return {
      canvasWidth: width,
      canvasHeight: height,
      boardX: padding + panelWidth + gap,
      boardY: padding,
      boardWidth,
      boardHeight,
      panelWidth,
      leftPanelX: padding,
      rightPanelX: padding + panelWidth + gap + boardWidth + gap,
      panelY: padding,
    };
  }

  configureCanvas() {
    this.canvas.width = this.layout.canvasWidth;
    this.canvas.height = this.layout.canvasHeight;
    this.ctx.imageSmoothingEnabled = true;
  }

  createBlockTextures() {
    const textures = {};
    Object.entries(PIECE_COLORS).forEach(([type, color]) => {
      textures[type] = this.createBlockTexture(color);
    });
    return textures;
  }

  createBlockTexture(color) {
    const size = GAME_CONFIG.grid.cellSize;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, this.adjustColor(color, 30));
    gradient.addColorStop(0.5, color);
    gradient.addColorStop(1, this.adjustColor(color, -20));

    ctx.fillStyle = gradient;
    ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;
    ctx.beginPath();
    this.roundRect(ctx, 1, 1, size - 2, size - 2, GAME_CONFIG.grid.borderRadius);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
    ctx.lineWidth = 1;
    ctx.stroke();

    return canvas;
  }

  adjustColor(hex, percent) {
    const num = parseInt(hex.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const r = (num >> 16) + amt;
    const g = ((num >> 8) & 0x00ff) + amt;
    const b = (num & 0x0000ff) + amt;
    return `#${(
      0x1000000 +
      (Math.min(255, Math.max(0, r)) << 16) +
      (Math.min(255, Math.max(0, g)) << 8) +
      Math.min(255, Math.max(0, b))
    )
      .toString(16)
      .slice(1)}`;
  }

  roundRect(ctx, x, y, width, height, radius) {
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
  }

  render(game, hud, animation) {
    const { ctx } = this;
    const { boardX, boardY, boardWidth, boardHeight, panelWidth, leftPanelX, rightPanelX } =
      this.layout;
    const cellSize = GAME_CONFIG.grid.cellSize;

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.fillStyle = GAME_CONFIG.canvas.background;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawPanel(leftPanelX, boardY, panelWidth, boardHeight);
    this.drawPanel(rightPanelX, boardY, panelWidth, boardHeight);
    this.drawBoardContainer(boardX, boardY, boardWidth, boardHeight);
    this.drawGrid(boardX, boardY, boardWidth, boardHeight, cellSize);

    this.drawLockedPieces(game, boardX, boardY, cellSize);

    if (game.currentPiece) {
      this.drawGhostPiece(game, boardX, boardY, cellSize);
    }

    if (game.currentPiece) {
      const interval = game.score.getDropInterval();
      const grounded = !game.board.isValidPosition(game.currentPiece, 0, 1);
      const fallProgress =
        game.state === GameState.PLAYING && !grounded ? game.dropTimer / interval : 0;
      const yOffset = Math.min(fallProgress, 1) * cellSize;
      this.drawPiece(game.currentPiece, boardX, boardY + yOffset, cellSize, 1);
    }

    if (animation.lineClear) {
      this.drawLineClear(animation, boardX, boardY, cellSize);
    }

    hud.update(game);
    this.drawHUD(hud, game);
  }

  drawPanel(x, y, width, height) {
    const ctx = this.ctx;
    ctx.fillStyle = GAME_CONFIG.ui.panel;
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = "rgba(148, 163, 184, 0.2)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, width - 1, height - 1);
  }

  drawBoardContainer(x, y, width, height) {
    const ctx = this.ctx;
    ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = "rgba(226, 232, 240, 0.25)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 0.5, y + 0.5, width - 1, height - 1);
  }

  drawGrid(x, y, width, height, cellSize) {
    const ctx = this.ctx;
    ctx.strokeStyle = "rgba(148, 163, 184, 0.12)";
    ctx.lineWidth = 1;
    for (let col = 0; col <= width; col += cellSize) {
      ctx.beginPath();
      ctx.moveTo(x + col, y);
      ctx.lineTo(x + col, y + height);
      ctx.stroke();
    }
    for (let row = 0; row <= height; row += cellSize) {
      ctx.beginPath();
      ctx.moveTo(x, y + row);
      ctx.lineTo(x + width, y + row);
      ctx.stroke();
    }
  }

  drawLockedPieces(game, boardX, boardY, cellSize) {
    const { ctx } = this;
    game.board.grid.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (!cell) {
          return;
        }
        const texture = this.blockTextures[cell];
        if (!texture) {
          return;
        }
        const drawX = boardX + x * cellSize;
        const drawY = boardY + y * cellSize;
        ctx.drawImage(texture, drawX, drawY);
      });
    });
  }

  drawPiece(piece, boardX, boardY, cellSize, alpha = 1) {
    const { ctx } = this;
    ctx.save();
    ctx.globalAlpha = alpha;
    const texture = this.blockTextures[piece.type];
    piece.getBlocks().forEach(([x, y]) => {
      const drawX = boardX + (piece.position.x + x) * cellSize;
      const drawY = boardY + (piece.position.y + y) * cellSize;
      if (drawY + cellSize < boardY) {
        return;
      }
      ctx.drawImage(texture, drawX, drawY);
    });
    ctx.restore();
  }

  drawGhostPiece(game, boardX, boardY, cellSize) {
    const distance = game.board.getDropDistance(game.currentPiece);
    if (distance <= 0) {
      return;
    }
    const { ctx } = this;
    ctx.save();
    ctx.globalAlpha = 0.25;
    const texture = this.blockTextures[game.currentPiece.type];
    game.currentPiece.getBlocks().forEach(([x, y]) => {
      const drawX = boardX + (game.currentPiece.position.x + x) * cellSize;
      const drawY = boardY + (game.currentPiece.position.y + y + distance) * cellSize;
      ctx.drawImage(texture, drawX, drawY);
    });
    ctx.restore();
  }

  drawMiniPiece(type, x, y, cellSize) {
    const blocks = TETROMINO_SHAPES[type][0];
    const texture = this.blockTextures[type];
    const minX = Math.min(...blocks.map((cell) => cell[0]));
    const minY = Math.min(...blocks.map((cell) => cell[1]));
    blocks.forEach(([bx, by]) => {
      const drawX = x + (bx - minX) * cellSize;
      const drawY = y + (by - minY) * cellSize;
      this.ctx.drawImage(texture, drawX, drawY, cellSize, cellSize);
    });
  }

  drawHUD(hud, game) {
    const { ctx } = this;
    const { leftPanelX, rightPanelX, panelWidth, boardY, boardHeight } = this.layout;
    const panelPadding = 18;
    const miniCell = Math.floor(GAME_CONFIG.grid.cellSize * 0.6);
    const stats = hud.getStats(game);

    ctx.fillStyle = GAME_CONFIG.ui.text;
    ctx.font = `600 14px ${GAME_CONFIG.ui.fontFamily}`;
    ctx.textAlign = "left";

    const holdLabelY = boardY + panelPadding;
    ctx.fillText("HOLD", leftPanelX + panelPadding, holdLabelY);

    const holdBoxY = holdLabelY + 16;
    ctx.strokeStyle = "rgba(148, 163, 184, 0.35)";
    ctx.strokeRect(leftPanelX + panelPadding, holdBoxY, panelWidth - panelPadding * 2, 110);
    if (game.holdType) {
      this.drawMiniPiece(
        game.holdType,
        leftPanelX + panelPadding + 12,
        holdBoxY + 18,
        miniCell
      );
    }

    const statsStartY = holdBoxY + 130;
    ctx.fillStyle = GAME_CONFIG.ui.muted;
    ctx.fillText("SCORE", leftPanelX + panelPadding, statsStartY);
    ctx.fillStyle = GAME_CONFIG.ui.text;
    ctx.font = `700 18px ${GAME_CONFIG.ui.fontFamily}`;
    ctx.fillText(stats.score, leftPanelX + panelPadding, statsStartY + 24);

    ctx.fillStyle = GAME_CONFIG.ui.muted;
    ctx.font = `600 14px ${GAME_CONFIG.ui.fontFamily}`;
    ctx.fillText("LEVEL", leftPanelX + panelPadding, statsStartY + 54);
    ctx.fillStyle = GAME_CONFIG.ui.text;
    ctx.font = `700 18px ${GAME_CONFIG.ui.fontFamily}`;
    ctx.fillText(stats.level, leftPanelX + panelPadding, statsStartY + 78);

    ctx.fillStyle = GAME_CONFIG.ui.muted;
    ctx.font = `600 14px ${GAME_CONFIG.ui.fontFamily}`;
    ctx.fillText("LINES", leftPanelX + panelPadding, statsStartY + 108);
    ctx.fillStyle = GAME_CONFIG.ui.text;
    ctx.font = `700 18px ${GAME_CONFIG.ui.fontFamily}`;
    ctx.fillText(stats.lines, leftPanelX + panelPadding, statsStartY + 132);

    ctx.fillStyle = GAME_CONFIG.ui.text;
    ctx.font = `600 14px ${GAME_CONFIG.ui.fontFamily}`;
    const nextLabelY = boardY + panelPadding;
    ctx.fillText("NEXT", rightPanelX + panelPadding, nextLabelY);

    const nextBoxY = nextLabelY + 16;
    ctx.strokeStyle = "rgba(148, 163, 184, 0.35)";
    ctx.strokeRect(rightPanelX + panelPadding, nextBoxY, panelWidth - panelPadding * 2, 200);

    const nextPieces = game.getNextPieces(3);
    nextPieces.forEach((type, index) => {
      this.drawMiniPiece(
        type,
        rightPanelX + panelPadding + 12,
        nextBoxY + 12 + index * 64,
        miniCell
      );
    });

    const highScoreY = boardY + boardHeight - 70;
    ctx.fillStyle = GAME_CONFIG.ui.muted;
    ctx.font = `600 14px ${GAME_CONFIG.ui.fontFamily}`;
    ctx.fillText("HIGH SCORE", rightPanelX + panelPadding, highScoreY);
    ctx.fillStyle = GAME_CONFIG.ui.text;
    ctx.font = `700 18px ${GAME_CONFIG.ui.fontFamily}`;
    ctx.fillText(stats.highScore, rightPanelX + panelPadding, highScoreY + 24);

    if (stats.combo > 0) {
      ctx.fillStyle = GAME_CONFIG.ui.accent;
      ctx.font = `600 14px ${GAME_CONFIG.ui.fontFamily}`;
      ctx.fillText(`COMBO x${stats.combo}`, rightPanelX + panelPadding, highScoreY + 52);
    }
  }

  drawLineClear(animation, boardX, boardY, cellSize) {
    const alpha = animation.getLineClearAlpha();
    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    this.ctx.fillStyle = "rgba(248, 250, 252, 0.8)";
    animation.lineClear.rows.forEach((row) => {
      this.ctx.fillRect(boardX, boardY + row * cellSize, cellSize * GAME_CONFIG.grid.columns, cellSize);
    });
    this.ctx.restore();
  }
}
