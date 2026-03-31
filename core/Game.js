/**
 * Game orchestrates core state and gameplay.
 */
import { GAME_CONFIG } from "../config/gameConfig.js";
import { Board } from "./Board.js";
import { Piece } from "./Piece.js";
import { Score } from "./Score.js";
import { PIECE_TYPES } from "../utils/constants.js";
import { shuffle } from "../utils/helpers.js";
import { GameState, InputAction, RotationDirection } from "../utils/enums.js";

export class Game {
  constructor() {
    this.board = new Board(GAME_CONFIG.grid.rows, GAME_CONFIG.grid.columns);
    this.score = new Score();
    this.state = GameState.MENU;
    this.events = [];
    this.nextQueue = [];
    this.holdType = null;
    this.canHold = true;
    this.dropTimer = 0;
    this.lockTimer = 0;
    this.currentPiece = null;
    this.spawnPosition = {
      x: Math.floor((GAME_CONFIG.grid.columns - 4) / 2),
      y: -GAME_CONFIG.grid.hiddenRows,
    };
    this.refillQueue();
  }

  reset() {
    this.board.reset();
    this.score.reset();
    this.state = GameState.MENU;
    this.events = [];
    this.nextQueue = [];
    this.holdType = null;
    this.canHold = true;
    this.dropTimer = 0;
    this.lockTimer = 0;
    this.currentPiece = null;
    this.refillQueue();
  }

  start() {
    if (this.state === GameState.PLAYING) {
      return;
    }
    this.board.reset();
    this.score.reset();
    this.holdType = null;
    this.canHold = true;
    this.dropTimer = 0;
    this.lockTimer = 0;
    this.nextQueue = [];
    this.refillQueue();
    this.currentPiece = this.spawnPiece();
    if (!this.currentPiece) {
      this.state = GameState.GAME_OVER;
      return;
    }
    this.state = GameState.PLAYING;
  }

  togglePause() {
    if (this.state === GameState.PLAYING) {
      this.state = GameState.PAUSED;
    } else if (this.state === GameState.PAUSED) {
      this.state = GameState.PLAYING;
    }
  }

  update(delta, actions = new Set()) {
    this.events = [];

    if (actions.has(InputAction.RESET)) {
      this.reset();
    }

    if (actions.has(InputAction.START) && this.state !== GameState.PLAYING) {
      this.start();
    }

    if (actions.has(InputAction.PAUSE)) {
      this.togglePause();
    }

    if (this.state !== GameState.PLAYING || !this.currentPiece) {
      return this.events;
    }

    let moved = false;

    const orderedActions = [
      InputAction.HARD_DROP,
      InputAction.HOLD,
      InputAction.ROTATE_CW,
      InputAction.ROTATE_CCW,
      InputAction.MOVE_LEFT,
      InputAction.MOVE_RIGHT,
      InputAction.SOFT_DROP,
    ];

    orderedActions.forEach((action) => {
      if (!actions.has(action)) {
        return;
      }
      switch (action) {
        case InputAction.MOVE_LEFT:
          moved = this.tryMove(-1, 0) || moved;
          break;
        case InputAction.MOVE_RIGHT:
          moved = this.tryMove(1, 0) || moved;
          break;
        case InputAction.SOFT_DROP:
          if (this.tryMove(0, 1)) {
            this.score.addSoftDrop(1);
            moved = true;
          }
          break;
        case InputAction.ROTATE_CW:
          moved = this.tryRotate(RotationDirection.CW) || moved;
          break;
        case InputAction.ROTATE_CCW:
          moved = this.tryRotate(RotationDirection.CCW) || moved;
          break;
        case InputAction.HARD_DROP:
          this.hardDrop();
          moved = true;
          break;
        case InputAction.HOLD:
          moved = this.hold();
          break;
        default:
          break;
      }
    });

    if (this.state !== GameState.PLAYING) {
      return this.events;
    }

    if (moved) {
      this.lockTimer = 0;
    }

    this.dropTimer += delta;
    const interval = this.score.getDropInterval();
    while (this.dropTimer >= interval) {
      this.dropTimer -= interval;
      if (!this.tryMove(0, 1)) {
        break;
      }
    }

    const grounded = !this.board.isValidPosition(this.currentPiece, 0, 1);
    if (grounded) {
      this.lockTimer += delta;
      if (this.lockTimer >= GAME_CONFIG.timing.lockDelay) {
        this.lockPiece();
      }
    } else {
      this.lockTimer = 0;
    }

    return this.events;
  }

  tryMove(dx, dy) {
    if (this.board.isValidPosition(this.currentPiece, dx, dy)) {
      this.currentPiece.position.x += dx;
      this.currentPiece.position.y += dy;
      return true;
    }
    return false;
  }

  tryRotate(direction) {
    return this.currentPiece.rotate(direction, this.board);
  }

  hardDrop() {
    const distance = this.board.getDropDistance(this.currentPiece);
    if (distance > 0) {
      this.currentPiece.position.y += distance;
      this.score.addHardDrop(distance);
    }
    this.lockPiece();
  }

  hold() {
    if (!this.canHold) {
      return false;
    }
    this.canHold = false;
    const currentType = this.currentPiece.type;
    if (this.holdType) {
      this.currentPiece = this.spawnPiece(this.holdType);
      this.holdType = currentType;
    } else {
      this.holdType = currentType;
      this.currentPiece = this.spawnPiece();
    }
    if (!this.currentPiece) {
      this.state = GameState.GAME_OVER;
    }
    return true;
  }

  lockPiece() {
    this.board.lockPiece(this.currentPiece);
    const cleared = this.board.clearLines();
    this.score.addLines(cleared.length);
    if (cleared.length > 0) {
      this.events.push({ type: "line_clear", rows: cleared });
    }
    this.currentPiece = this.spawnPiece();
    this.canHold = true;
    this.lockTimer = 0;
    this.dropTimer = 0;

    if (!this.currentPiece) {
      this.state = GameState.GAME_OVER;
    }
  }

  spawnPiece(type = null) {
    if (this.nextQueue.length < 7) {
      this.refillQueue();
    }
    const nextType = type || this.nextQueue.shift();
    const piece = new Piece(nextType, { ...this.spawnPosition });
    if (!this.board.isValidPosition(piece, 0, 0)) {
      return null;
    }
    return piece;
  }

  refillQueue() {
    this.nextQueue.push(...shuffle(PIECE_TYPES));
  }

  getNextPieces(count = 3) {
    if (this.nextQueue.length < count) {
      this.refillQueue();
    }
    return this.nextQueue.slice(0, count);
  }
}
