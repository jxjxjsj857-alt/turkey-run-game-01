// Gobble Dash — Turkey's Great Escape: game loop, screens and input wiring.
// Served as static files; game/index.html opens in desktop Chrome and plays
// with no network request. `?shot=start|play|chase|end&seed=N` stages one
// deterministic screenshot scene instead of the title screen.
import { BEST_KEY, GROUND_Y, VIEW } from './config.js';
import { createInput } from './input.js';
import { createAudio } from './audio.js';
import { createWorld, EVENT_CAUGHT, EVENT_ESCAPED, EVENT_FOUND, EVENT_HIDE, EVENT_HIT, EVENT_NET, EVENT_PICKUP } from './world.js';
import { SCREEN_ESCAPED, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE, drawWorld } from './render.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');
const seed = Number(params.get('seed') || '1') || 1;

const audio = createAudio();
const input = createInput(canvas);
const world = createWorld(seed);

let screen = SCREEN_TITLE;
let best = 0;
try {
  best = Number(window.localStorage.getItem(BEST_KEY) || '0') || 0;
} catch {
  best = 0;
}
let time = 0;
let last = performance.now();
let titleCard = null;
let endCard = null;
let wasAirborne = false;

function saveBest() {
  const score = Math.floor(world.state.score);
  if (score > best) {
    best = score;
    try {
      window.localStorage.setItem(BEST_KEY, String(best));
    } catch {
      // Private mode or no storage: the best score just does not persist.
    }
  }
}

function startRun() {
  world.reset();
  screen = SCREEN_PLAY;
  audio.unlock();
  audio.gobble();
  audio.startMusic();
}

function toTitle() {
  world.reset();
  screen = SCREEN_TITLE;
  audio.stopMusic();
}

function clickedInside(clicks, card) {
  if (!card) return false;
  return clicks.some((c) => c.x >= card.x && c.x <= card.x + card.width && c.y >= card.y && c.y <= card.y + card.height);
}

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  time += dt;
  const state = world.state;
  state.muted = audio.muted;

  if (input.mutePressed) {
    const muted = audio.toggleMute();
    if (!muted && screen === SCREEN_PLAY) audio.startMusic();
    if (muted) audio.stopMusic();
  }

  if (screen === SCREEN_TITLE) {
    if (input.jumpPressed || clickedInside(input.takeClicks(), titleCard)) {
      startRun();
    }
  } else if (screen === SCREEN_PLAY) {
    if (input.pausePressed) {
      screen = SCREEN_PAUSED;
      audio.stopMusic();
    } else {
      const events = world.step(dt, input.jumpPressed || input.jumpHeld, input.slideHeld);
      if (wasAirborne && state.player.onGround && state.player.vy === 0) audio.land();
      wasAirborne = !state.player.onGround;
      if (events & EVENT_HIT) audio.hit();
      if (events & EVENT_PICKUP) audio.pickup();
      if (events & EVENT_HIDE) audio.hide();
      if (events & EVENT_FOUND) audio.yell();
      if (events & EVENT_NET) audio.yell();
      if (events & EVENT_ESCAPED) {
        screen = SCREEN_ESCAPED;
        saveBest();
        audio.stopMusic();
        audio.win();
      } else if (events & EVENT_CAUGHT) {
        screen = SCREEN_OVER;
        saveBest();
        audio.stopMusic();
        audio.lose();
      }
    }
  } else if (screen === SCREEN_PAUSED) {
    if (input.pausePressed) {
      screen = SCREEN_PLAY;
      audio.startMusic();
    } else if (input.restartPressed) {
      startRun();
    }
  } else if (screen === SCREEN_OVER || screen === SCREEN_ESCAPED) {
    const clicks = input.takeClicks();
    if (input.restartPressed || clickedInside(clicks, endCard)) {
      startRun();
    }
  }

  const card = drawWorld(ctx, world, screen, best, time);
  if (screen === SCREEN_TITLE) titleCard = card;
  if (screen === SCREEN_OVER || screen === SCREEN_ESCAPED) endCard = card;
  input.endFrame();
  requestAnimationFrame(frame);
}

if (shotName) {
  // Screenshot mode: stage the scene, draw one frame, stop. The page
  // signals readiness with document.title so the screenshot tool can wait.
  const staged = stageShot(shotName, world);
  screen = staged.screen;
  if (screen === SCREEN_ESCAPED) saveBest();
  world.state.muted = true;
  drawWorld(ctx, world, screen, best, 1.2);
  document.title = 'gobble-dash-ready';
} else {
  document.title = "Gobble Dash — Turkey's Great Escape";
  requestAnimationFrame(frame);
}
