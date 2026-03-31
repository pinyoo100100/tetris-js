# AGENTS

## Project Overview
- Vanilla JS Tetris using ES modules and HTML5 Canvas.
- Entry point: `index.html` loads `main.js`.
- Core logic in `core/` (Board, Piece, Game, Score, Input) is DOM-free.

## Key Files
- `config/gameConfig.js`: gameplay, timing, UI, and input bindings.
- `utils/constants.js`: tetromino shapes, colors, kick tables.
- `systems/Renderer.js`: canvas rendering and HUD panels.

## Dev Notes
- No build tooling required; open `index.html` directly.
- LocalStorage key for high score: `tetris_high_score`.
