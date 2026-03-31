/**
 * Piece represents a tetromino and rotation logic.
 */
import { KICK_TABLE, PIECE_COLORS, TETROMINO_SHAPES } from "../utils/constants.js";

export class Piece {
  constructor(type, position = { x: 0, y: 0 }) {
    this.type = type;
    this.rotation = 0;
    this.position = { ...position };
  }

  get color() {
    return PIECE_COLORS[this.type];
  }

  getBlocks(rotation = this.rotation) {
    return TETROMINO_SHAPES[this.type][rotation];
  }

  setPosition(x, y) {
    this.position.x = x;
    this.position.y = y;
  }

  resetRotation() {
    this.rotation = 0;
  }

  rotate(direction, board) {
    if (this.type === "O") {
      return false;
    }

    const from = this.rotation;
    const to = (this.rotation + direction + 4) % 4;
    const key = `${from}>${to}`;
    const kicks = this.type === "I" ? KICK_TABLE.I[key] : KICK_TABLE.standard[key];

    for (const [offsetX, offsetY] of kicks) {
      if (board.isValidPosition(this, offsetX, offsetY, to)) {
        this.rotation = to;
        this.position.x += offsetX;
        this.position.y += offsetY;
        return true;
      }
    }

    return false;
  }
}
