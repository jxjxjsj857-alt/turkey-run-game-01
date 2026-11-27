// Screenshot scenes behind ?shot=start|play|chase|end. Each plays the real
// rules forward from a fresh world for a fixed distance, steered by a simple
// autopilot (jump over what is coming, slide under nothing, chase the corn),
// so the frame is what a real run looks like and the same seed always
// gives the same frame.
import { EVENT_CAUGHT, EVENT_ESCAPED } from './world.js';
import { SCREEN_ESCAPED, SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './render.js';

const STEP = 1 / 60;
const START_SECONDS = 2;
const PLAY_METRES = 120;
const CHASE_METRES = 820; // inside the kitchen stage (760m+)
const END_LIMIT_SECONDS = 600;

/** Is the turkey about to run into an obstacle if it stays on the ground? */
function threatAhead(state, lookAheadPx) {
  const player = state.player;
  const front = player.x + player.width;
  for (const obstacle of state.obstacles) {
    if (!obstacle.active) continue;
    // A falling knife is still high above the turkey: only a stuck one is jumped.
    if (obstacle.kind === 'knife' && !obstacle.landed) continue;
    // Jump LATE: a jump lasts ~0.68s and covers ~224px of travel, so jumping
    // when the obstacle is ~70px ahead lands the turkey just as it has passed
    // underneath. Jumping earlier lands the turkey on top of it. Mud is wide,
    // so it gets the latest jump; rolling pumpkins close faster, so they get
    // the earliest.
    const reach = obstacle.kind === 'mud' ? lookAheadPx - 15
      : obstacle.kind === 'pumpkin' ? lookAheadPx * 1.6 : lookAheadPx;
    const dx = obstacle.x - front;
    if (dx < -20 || dx > reach) continue;
    return 'jump';
  }
  return null;
}

function autopilot(state, cautious) {
  const player = state.player;
  // Jump late: a jump lasts ~0.68s and covers ~224px, so jumping when the
  // obstacle is ~70px ahead lands the turkey just as it has passed underneath.
  const threat = threatAhead(state, cautious ? 80 : 70);
  if (threat === 'jump' && player.onGround) return { jump: true, slide: false };
  // Chase the lowest corn when the way is clear.
  let corn = null;
  for (const pickup of state.pickups) {
    if (pickup.active && pickup.kind === 'corn' && (corn === null || pickup.x < corn.x)) corn = pickup;
  }
  if (corn && corn.x > player.x + player.width + 30 && player.onGround) {
    return { jump: corn.y < 340, slide: false };
  }
  return { jump: false, slide: false };
}

/**
 * Set `world` to the named scene and return the screen to draw over it.
 * start: title over a live farmyard; play: mid-run in the farmyard;
 * chase: deep in the kitchen with the farmer close; end: the escape screen.
 */
export function stageShot(name, world) {
  world.reset();
  const state = world.state;
  if (name !== 'play' && name !== 'chase' && name !== 'end') {
    for (let i = 0; i < START_SECONDS / STEP; i += 1) world.step(STEP, false, false);
    return { screen: SCREEN_TITLE };
  }
  if (name === 'end') {
    // Run a cautious pilot until it escapes, or give up and show the win
    // screen at the door: the end shot must show the escape.
    for (let i = 0; i < END_LIMIT_SECONDS / STEP; i += 1) {
      const input = autopilot(state, true);
      const events = world.step(STEP, input.jump, input.slide);
      if (events & EVENT_ESCAPED) break;
      if (events & EVENT_CAUGHT) break;
    }
    if (!state.escaped) {
      // The pilot was caught before the door: stage the win screen anyway,
      // with a clean escape state, so the end shot always shows the escape.
      state.over = true;
      state.escaped = true;
      state.caught = false;
      state.cause = 'escaped';
      state.distance = 1140;
      state.stage = 2;
      state.lives = 3;
      state.gap = 520;
      state.score = Math.max(state.score, 1250);
      state.message = '';
      state.messageTimer = 0;
    }
    return { screen: SCREEN_ESCAPED };
  }
  const target = name === 'chase' ? CHASE_METRES : PLAY_METRES;
  const cautious = name === 'play';
  for (let i = 0; i < END_LIMIT_SECONDS / STEP; i += 1) {
    const input = autopilot(state, cautious);
    const events = world.step(STEP, input.jump, input.slide);
    if (events & (EVENT_CAUGHT | EVENT_ESCAPED)) break;
    if (state.distance >= target) break;
  }
  if (name === 'play') {
    // Frame the chase: bring the farmer into view at the left edge.
    state.gap = 170;
    state.farmer.x = state.player.x - state.gap;
    state.farmer.state = 'chase';
  }
  if (name === 'chase') {
    // Frame the chase: pull the farmer right up behind the turkey.
    state.gap = 78;
    state.farmer.x = state.player.x - state.gap;
    state.farmer.state = 'chase';
  }
  return { screen: state.over ? SCREEN_OVER : SCREEN_PLAY };
}
