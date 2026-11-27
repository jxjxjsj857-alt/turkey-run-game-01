// The game world: the turkey, the farmer, obstacles, pickups and stages.
// Pure state plus stepping; rendering lives in render.js.
import {
  ESCAPE_DISTANCE,
  FARMER,
  GRAVITY,
  GROUND_Y,
  LIVES_START,
  RUN_SPEED,
  SCORE,
  SPAWN,
  STAGE_LENGTH,
  TURKEY,
} from './config.js';
import { intBetween, makeRandom, pick } from './random.js';

export const KIND_FENCE = 'fence';
export const KIND_MUD = 'mud';
export const KIND_HAYBALE = 'haybale';
export const KIND_PUMPKIN = 'pumpkin';
export const KIND_OVEN = 'oven';
export const KIND_KNIFE = 'knife';
export const KIND_NET = 'net';
export const KIND_CORN = 'corn';
export const KIND_FEATHER = 'feather';
export const KIND_WISHBONE = 'wishbone';
export const KIND_HAYSTACK = 'haystack';

export const EVENT_NONE = 0;
export const EVENT_HIT = 1;
export const EVENT_PICKUP = 2;
export const EVENT_CAUGHT = 4;
export const EVENT_ESCAPED = 8;
export const EVENT_HIDE = 16;
export const EVENT_FOUND = 32;
export const EVENT_NET = 64;

// Obstacles the turkey must jump over (hit while on the ground).
const JUMP_OVER = [KIND_FENCE, KIND_HAYBALE, KIND_PUMPKIN, KIND_OVEN];
// Obstacles the turkey must slide under or jump (hit while standing tall).
const DUCK_UNDER = [];
// Hazards that hurt however the turkey meets them, unless it jumps clear.
const ALWAYS_HURTS = [KIND_KNIFE, KIND_NET];

function obstacleFor(stage, rng, distance) {
  if (stage === 0) return pick(rng, [KIND_FENCE, KIND_MUD, KIND_HAYBALE, KIND_PUMPKIN]);
  if (stage === 1) return pick(rng, [KIND_FENCE, KIND_HAYBALE, KIND_PUMPKIN, KIND_KNIFE, KIND_MUD]);
  return pick(rng, [KIND_OVEN, KIND_KNIFE, KIND_HAYBALE, KIND_PUMPKIN, KIND_FENCE]);
}

function obstacleSize(kind) {
  switch (kind) {
    case KIND_FENCE: return { width: 26, height: 58 };
    case KIND_MUD: return { width: 96, height: 12 };
    case KIND_HAYBALE: return { width: 64, height: 56 };
    case KIND_PUMPKIN: return { width: 44, height: 40 };
    case KIND_OVEN: return { width: 86, height: 96 };
    case KIND_KNIFE: return { width: 18, height: 54 };
    case KIND_NET: return { width: 46, height: 34 };
    default: return { width: 40, height: 40 };
  }
}

export function createWorld(seed) {
  const rng = makeRandom(seed);
  const state = {
    seed,
    time: 0,
    distance: 0, // metres run
    score: 0,
    corn: 0,
    feathers: 0,
    lives: LIVES_START,
    gap: FARMER.startGap, // px between farmer and turkey; 0 means caught
    stage: 0,
    speed: RUN_SPEED,
    hidden: false,
    hideTimer: 0,
    over: false,
    escaped: false,
    caught: false,
    cause: '',
    player: {
      x: TURKEY.x,
      y: GROUND_Y - TURKEY.height,
      width: TURKEY.width,
      height: TURKEY.height,
      vy: 0,
      onGround: true,
      sliding: false,
      stumble: 0,
      invincible: 0,
      runCycle: 0,
    },
    farmer: {
      x: TURKEY.x - FARMER.startGap,
      y: GROUND_Y - FARMER.height,
      width: FARMER.width,
      height: FARMER.height,
      state: 'chase', // chase | search | throw
      stateTimer: 0,
      runCycle: 0,
      arm: 0,
    },
    obstacles: [],
    pickups: [],
    haystacks: [],
    knives: [],
    decor: [],
    spawnTimer: 0.6,
    pickupTimer: 1.2,
    netTimer: 6,
    message: '',
    messageTimer: 0,
  };

  // Pre-scatter background decor (fences, trees, pumpkins, barn, kitchen props)
  // so the farm reads as a place from the first frame.
  let decorX = 0;
  for (let i = 0; i < 40; i += 1) {
    const kind = pick(rng, ['tree', 'fencepost', 'pumpkin', 'barn', 'bush']);
    state.decor.push({ kind, x: decorX, jitter: intBetween(rng, -30, 30), scale: 0.8 + rng() * 0.5 });
    decorX += intBetween(rng, 180, 420);
  }

  function stageOf(distance) {
    if (distance >= STAGE_LENGTH * 2) return 2;
    if (distance >= STAGE_LENGTH) return 1;
    return 0;
  }

  function showMessage(text, seconds) {
    state.message = text;
    state.messageTimer = seconds;
  }

  function spawnObstacle() {
    const stage = state.stage;
    const kind = obstacleFor(stage, rng, state.distance);
    const size = obstacleSize(kind);
    const obstacle = {
      kind,
      x: 1000,
      y: kind === KIND_KNIFE ? -80 : GROUND_Y - size.height,
      width: size.width,
      height: size.height,
      active: true,
      vy: kind === KIND_KNIFE ? intBetween(rng, 520, 700) : 0,
      warn: kind === KIND_KNIFE ? 0.55 : 0, // seconds of falling shadow before it lands
      landed: false,
      stuck: 0,
      roll: 0,
    };
    if (kind === KIND_KNIFE) obstacle.y = -80;
    state.obstacles.push(obstacle);
    // A haystack to hide in appears every so often from the barn on.
    if (stage >= 1 && rng() < 0.45) {
      state.haystacks.push({ kind: KIND_HAYSTACK, x: 1060, y: GROUND_Y - 74, width: 84, height: 74, active: true });
    }
  }

  function spawnPickup() {
    const roll = rng();
    const kind = roll < 0.62 ? KIND_CORN : roll < 0.88 ? KIND_FEATHER : KIND_WISHBONE;
    const count = kind === KIND_CORN ? 3 : 1;
    for (let i = 0; i < count; i += 1) {
      state.pickups.push({
        kind,
        x: 1000 + i * 46,
        y: GROUND_Y - (kind === KIND_CORN ? 74 : 120) - (kind === KIND_FEATHER ? intBetween(rng, 0, 40) : 0),
        width: 30,
        height: 30,
        active: true,
        bob: rng() * 6.28,
      });
    }
  }

  function overlap(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
  }

  function hurtPlayer(kind) {
    const player = state.player;
    if (player.invincible > 0 || state.hidden) return EVENT_NONE;
    state.lives -= 1;
    state.gap = Math.max(0, state.gap - FARMER.hitLoss);
    player.stumble = TURKEY.stumbleSeconds;
    player.invincible = TURKEY.invincibleSeconds;
    if (kind === KIND_MUD) {
      showMessage('Stuck in the mud!', 1.2);
    } else if (kind === KIND_KNIFE) {
      showMessage('Ouch! A carving knife!', 1.2);
    } else if (kind === KIND_NET) {
      showMessage('Tangled in the net!', 1.2);
    } else {
      showMessage('Tripped! The farmer gains!', 1.2);
    }
    if (state.lives <= 0 || state.gap <= 0) {
      state.over = true;
      state.caught = true;
      state.cause = state.lives <= 0 ? 'out-of-lives' : 'caught';
      return EVENT_HIT | EVENT_CAUGHT;
    }
    return EVENT_HIT;
  }

  function collect(pickup) {
    pickup.active = false;
    if (pickup.kind === KIND_CORN) {
      state.score += SCORE.corn;
      state.corn += 1;
      state.gap = Math.min(FARMER.maxGap, state.gap + FARMER.cornGain);
    } else if (pickup.kind === KIND_FEATHER) {
      state.score += SCORE.feather;
      state.feathers += 1;
      state.gap = Math.min(FARMER.maxGap, state.gap + FARMER.featherGain);
      showMessage('Feather burst! +speed', 1.0);
    } else {
      state.score += SCORE.wishbone;
      state.lives = Math.min(3, state.lives + 1);
      showMessage('Golden wishbone! +1 life', 1.4);
    }
    return EVENT_PICKUP;
  }

  /**
   * Advance the world by dt seconds. `move` is -1, 0 or 1 (unused: the turkey
   * always runs right; kept for the autopilot's signature), `jump` and `slide`
   * are the player's inputs this frame. Returns an event bitmask.
   */
  function step(dt, jump, slide) {
    if (state.over) return EVENT_NONE;
    let events = EVENT_NONE;
    state.time += dt;
    const player = state.player;
    const farmer = state.farmer;

    // --- player vertical motion
    if (jump && player.onGround && player.stumble <= 0 && !state.hidden) {
      player.vy = TURKEY.jumpVelocity;
      player.onGround = false;
    }
    player.vy += GRAVITY * dt;
    player.y += player.vy * dt;
    if (player.y >= GROUND_Y - player.height) {
      player.y = GROUND_Y - player.height;
      player.vy = 0;
      player.onGround = true;
    }
    player.sliding = slide && player.onGround && !state.hidden;
    player.height = player.sliding ? TURKEY.slideHeight : TURKEY.height;
    if (player.sliding) player.y = GROUND_Y - player.height;
    player.runCycle += dt * (player.onGround ? 14 : 4);
    if (player.stumble > 0) player.stumble -= dt;
    if (player.invincible > 0) player.invincible -= dt;

    // --- distance, score, stage
    const speedNow = player.stumble > 0 ? RUN_SPEED * 0.45 : RUN_SPEED;
    state.speed = speedNow;
    state.distance += (speedNow * dt) / 28; // px -> metres
    state.score += SCORE.metre * (speedNow * dt) / 28;
    const stage = stageOf(state.distance);
    if (stage !== state.stage) {
      state.stage = stage;
      if (stage === 1) showMessage('Into the barn — hide in the hay!', 2.0);
      if (stage === 2) showMessage('The kitchen! Mind the oven!', 2.0);
    }
    if (state.distance >= ESCAPE_DISTANCE) {
      state.over = true;
      state.escaped = true;
      state.cause = 'escaped';
      return EVENT_ESCAPED;
    }

    // --- hiding in a haystack
    if (state.hidden) {
      state.hideTimer -= dt;
      if (state.hideTimer <= 0) {
        state.hidden = false;
        farmer.state = 'chase';
        farmer.stateTimer = 0;
      }
    } else if (slide && player.onGround) {
      for (const stack of state.haystacks) {
        if (stack.active && overlap(player, stack)) {
          state.hidden = true;
          state.hideTimer = 999; // until the farmer finishes searching
          farmer.state = 'search';
          farmer.stateTimer = FARMER.searchSeconds;
          showMessage('Hidden! Hold still…', 1.6);
          events |= EVENT_HIDE;
          break;
        }
      }
    }

    // --- farmer: gap, chase, search, net throws
    if (farmer.state === 'search') {
      farmer.stateTimer -= dt;
      farmer.x += 26 * dt; // creeps toward the haystack, looking
      if (farmer.stateTimer <= 0) {
        farmer.state = 'chase';
        state.hidden = false;
        state.hideTimer = 0;
        state.gap = Math.min(FARMER.maxGap, state.gap + 90); // he lost the trail
        showMessage('He gave up — run!', 1.4);
        events |= EVENT_FOUND;
      }
    } else {
      // Clean running widens the gap; stumbling closes it fast.
      if (player.stumble > 0) state.gap -= 55 * dt;
      else state.gap = Math.min(FARMER.maxGap, state.gap + FARMER.cleanGainPerSecond * dt);
      if (state.gap <= 0) {
        state.over = true;
        state.caught = true;
        state.cause = 'caught';
        return EVENT_CAUGHT;
      }
      farmer.x = player.x - state.gap;
      farmer.runCycle += dt * 12;
      // Nets from the barn stage on.
      if (state.distance >= FARMER.netThrowAfter) {
        state.netTimer -= dt;
        if (state.netTimer <= 0) {
          state.netTimer = 3.4 + rng() * 2.2;
          const size = obstacleSize(KIND_NET);
          state.obstacles.push({
            kind: KIND_NET,
            x: farmer.x + farmer.width,
            y: GROUND_Y - 190,
            width: size.width,
            height: size.height,
            active: true,
            vy: 260,
            vx: 300,
            warn: 0,
            roll: 0,
          });
          events |= EVENT_NET;
        }
      }
    }
    farmer.y = GROUND_Y - farmer.height;

    // --- spawning
    state.spawnTimer -= dt;
    if (state.spawnTimer <= 0) {
      spawnObstacle();
      const t = state.distance / ESCAPE_DISTANCE;
      state.spawnTimer = SPAWN.gapStart + (SPAWN.gapEnd - SPAWN.gapStart) * t + rng() * 0.5;
    }
    state.pickupTimer -= dt;
    if (state.pickupTimer <= 0) {
      spawnPickup();
      state.pickupTimer = SPAWN.pickupEvery + rng() * 1.2;
    }

    // --- move obstacles, pickups, haystacks; collide
    const scroll = speedNow * dt;
    for (const obstacle of state.obstacles) {
      if (!obstacle.active) continue;
      if (obstacle.kind === KIND_NET) {
        if (obstacle.vx === 0 && obstacle.vy === 0) {
          obstacle.x -= scroll; // landed: it rides the world left like the rest
        } else {
          obstacle.x += obstacle.vx * dt;
          obstacle.y += obstacle.vy * dt;
          obstacle.vy += 900 * dt;
          if (obstacle.y >= GROUND_Y - obstacle.height) {
            obstacle.y = GROUND_Y - obstacle.height;
            obstacle.vy = 0;
            obstacle.vx = 0;
          }
        }
      } else if (obstacle.kind === KIND_KNIFE) {
        obstacle.x -= scroll;
        if (obstacle.warn > 0) {
          obstacle.warn -= dt;
          if (obstacle.warn <= 0) {
            // It starts falling now: never let it land on the turkey's head.
            // It falls ~0.6s while scrolling ~200px, so check the landing spot.
            const landingX = obstacle.x - 200;
            if (landingX < player.x + player.width + 30 && landingX + obstacle.width > player.x - 30) {
              obstacle.x += 150;
            }
          }
        } else if (!obstacle.landed) {
          obstacle.y += obstacle.vy * dt;
          obstacle.vy += 1400 * dt;
          if (obstacle.y >= GROUND_Y - obstacle.height) {
            obstacle.y = GROUND_Y - obstacle.height;
            obstacle.vy = 0;
            obstacle.landed = true;
            obstacle.stuck = 0.9; // stuck in the ground: jump it like a fence
          }
        } else {
          obstacle.stuck -= dt;
          if (obstacle.stuck <= 0) obstacle.active = false;
        }
      } else if (obstacle.kind === KIND_PUMPKIN) {
        obstacle.x -= scroll * 1.6; // rolls toward the turkey
        obstacle.roll += dt * 6;
      } else {
        obstacle.x -= scroll;
      }
      if (obstacle.x + obstacle.width < -40) {
        obstacle.active = false;
        continue;
      }
      if (state.hidden) continue;
      if (player.invincible > 0) continue;
      if (!overlap(player, obstacle)) continue;
      if (obstacle.kind === KIND_KNIFE && !obstacle.landed) continue; // still falling: it is high above the turkey
      if (obstacle.kind === KIND_MUD) {
        if (player.onGround) {
          obstacle.active = false;
          events |= hurtPlayer(KIND_MUD);
        }
        continue;
      }
      if (JUMP_OVER.includes(obstacle.kind)) {
        if (player.onGround) events |= hurtPlayer(obstacle.kind);
        continue;
      }
      if (ALWAYS_HURTS.includes(obstacle.kind)) {
        obstacle.active = false;
        events |= hurtPlayer(obstacle.kind);
        continue;
      }
      if (DUCK_UNDER.includes(obstacle.kind) && !player.sliding) {
        events |= hurtPlayer(obstacle.kind);
      }
    }
    for (const pickup of state.pickups) {
      if (!pickup.active) continue;
      pickup.x -= scroll;
      pickup.bob += dt * 5;
      if (pickup.x + pickup.width < -40) {
        pickup.active = false;
        continue;
      }
      if (!state.hidden && overlap(player, pickup)) events |= collect(pickup);
    }
    for (const stack of state.haystacks) {
      if (!stack.active) continue;
      stack.x -= scroll;
      if (stack.x + stack.width < -40) stack.active = false;
    }
    for (const decor of state.decor) {
      decor.x -= scroll * 0.55; // parallax: background moves slower
      if (decor.x < -260) {
        decor.x += 40 * 300;
        // Kitchen props only once the run reaches the kitchen.
        decor.kind = state.stage === 2
          ? pick(rng, ['pan', 'window', 'barn', 'bush'])
          : pick(rng, ['tree', 'fencepost', 'pumpkin', 'barn', 'bush']);
      }
    }
    if (state.messageTimer > 0) state.messageTimer -= dt;
    if (state.over && state.caught) return events | EVENT_CAUGHT;
    return events;
  }

  function reset() {
    const fresh = createWorld(state.seed).state;
    for (const key of Object.keys(state)) {
      if (key === 'seed') continue;
      state[key] = fresh[key];
    }
  }

  return { state, step, reset, stageOf, showMessage };
}
