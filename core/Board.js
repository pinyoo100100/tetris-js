/**
 * Board manages the grid and collision detection.
 */
import { createMatrix } from "../utils/helpers.js";

export class Board {
  constructor(rows, columns) {
    this.rows = rows;
    this.columns = columns;
    this.grid = createMatrix(rows, columns, 0);
  }

  reset() {
    this.grid = createMatrix(this.rows, this.columns, 0);
  }

  isInside(x, y) {
    return x >= 0 && x < this.columns && y < this.rows;
  }

  isValidPosition(piece, offsetX = 0, offsetY = 0, rotation = piece.rotation) {
    const blocks = piece.getBlocks(rotation);
    return blocks.every(([x, y]) => {
      const boardX = piece.position.x + x + offsetX;
      const boardY = piece.position.y + y + offsetY;
      if (boardX < 0 || boardX >= this.columns || boardY >= this.rows) {
        return false;
      }
      if (boardY < 0) {
        return true;
      }
      return this.grid[boardY][boardX] === 0;
    });
  }

  lockPiece(piece) {
    piece.getBlocks().forEach(([x, y]) => {
      const boardX = piece.position.x + x;
      const boardY = piece.position.y + y;
      if (boardY >= 0 && boardY < this.rows && boardX >= 0 && boardX < this.columns) {
        this.grid[boardY][boardX] = piece.type;
      }
    });
  }

  clearLines() {
    const cleared = [];
    for (let y = 0; y < this.rows; y += 1) {
      if (this.grid[y].every((cell) => cell !== 0)) {
        cleared.push(y);
      }
    }

    if (cleared.length > 0) {
      cleared
        .slice()
        .sort((a, b) => b - a)
        .forEach((rowIndex) => {
          this.grid.splice(rowIndex, 1);
        });
      const newRows = createMatrix(cleared.length, this.columns, 0);
      this.grid.unshift(...newRows);
    }

    return cleared;
  }

  getDropDistance(piece) {
    let offset = 0;
    while (this.isValidPosition(piece, 0, offset + 1)) {
      offset += 1;
    }
    return offset;
  }
}
