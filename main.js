import { Game } from "./core/Game.js";
import { Input } from "./core/Input.js";
import { Animation } from "./systems/Animation.js";
import { Renderer } from "./systems/Renderer.js";
import { Sound } from "./systems/Sound.js";
import { HUD } from "./ui/HUD.js";
import { Screens } from "./ui/Screens.js";
import { GameState, InputAction } from "./utils/enums.js";

const canvas = document.getElementById("game");
const renderer = new Renderer(canvas);
const game = new Game();
const input = new Input();
const animation = new Animation();
const hud = new HUD();
const screens = new Screens();
const sound = new Sound();

let lastTime = 0;
let lastState = game.state;

const handleEvents = (events) => {
  events.forEach((event) => {
    if (event.type === "line_clear") {
      animation.triggerLineClear(event.rows);
      sound.lineClear();
    }
  });
};

const handleStateTransition = () => {
  if (game.state !== lastState) {
    if (game.state === GameState.GAME_OVER) {
      sound.gameOver();
    }
    lastState = game.state;
  }
};

const resizeCanvas = () => {
  const { canvasWidth, canvasHeight } = renderer.layout;
  const scale = Math.min(
    window.innerWidth / (canvasWidth + 40),
    window.innerHeight / (canvasHeight + 40),
    1
  );
  canvas.style.transform = `scale(${scale})`;
};

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const loop = (timestamp) => {
  const delta = Math.min(timestamp - lastTime, 1000 / 30);
  lastTime = timestamp;

  const actions = input.update(delta);
  if (game.state === GameState.PLAYING && actions.has(InputAction.HARD_DROP)) {
    sound.hardDrop();
  }

  const events = game.update(delta, actions);
  handleEvents(events);
  animation.update(delta);
  renderer.render(game, hud, animation);
  screens.render(renderer.ctx, renderer.layout, game.state, game);
  handleStateTransition();

  requestAnimationFrame(loop);
};

requestAnimationFrame(loop);
