# tetris-js

Vanilla JavaScript Tetris built with ES modules and HTML5 Canvas.

## Setup

No build step or dependencies are required.

1. Clone or download this repository.
2. Ensure the project files are available locally.

## Run

### Option 1: Open directly

Open `index.html` in your browser (double-click the file or use your browser’s file open dialog).

### Option 2: Serve locally

If your browser blocks module loading from the filesystem, run a simple local server:

```sh
cd /path/to/tetris-js
python3 -m http.server 8000
```

Then visit `http://localhost:8000` in your browser.

## Controls

Controls are configurable in `config/gameConfig.js`.