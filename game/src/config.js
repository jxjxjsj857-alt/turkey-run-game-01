// Gobble Dash — Turkey's Great Escape: tuning numbers in one place.
// A turkey flees the farm on Thanksgiving morning, outrunning the farmer
// through the farmyard, the barn and the kitchen, and out the back door.
export const VIEW = { width: 960, height: 540 };

export const GROUND_Y = 452; // y of the ground line
export const GRAVITY = 2600;
export const RUN_SPEED = 330; // px/s of world scroll at full speed
export const STAGE_LENGTH = 380; // metres per stage
export const ESCAPE_DISTANCE = 1140; // metres to the back door

export const STAGES = [
  { name: 'THE FARMYARD', sky: ['#ffd9a0', '#ff9e5e'], ground: '#b97a3f', grass: '#7fae4e' },
  { name: 'THE BARN', sky: ['#e8a06a', '#8a4b2d'], ground: '#8a5a30', grass: '#6d8f3e' },
  { name: 'THE KITCHEN', sky: ['#3a2b4d', '#7a3b2e'], ground: '#5d3a28', grass: '#4a3b52' },
];

export const TURKEY = {
  x: 170,
  width: 58,
  height: 52,
  jumpVelocity: -880,
  slideHeight: 30,
  stumbleSeconds: 0.9,
  invincibleSeconds: 1.4,
};

export const FARMER = {
  width: 62,
  height: 92,
  // Gap (px) between farmer and turkey: starts far, closes on every mistake.
  startGap: 430,
  maxGap: 520,
  catchGap: 0,
  // Gap lost on a hit, gained per second of clean running, per corn.
  hitLoss: 120,
  cleanGainPerSecond: 9,
  cornGain: 14,
  featherGain: 40,
  searchSeconds: 2.2, // how long he searches a haystack the turkey hides in
  netThrowAfter: 520, // distance (m) after which he starts throwing nets
};

export const SPAWN = {
  // Seconds between obstacle groups; shrinks as distance grows.
  gapStart: 1.55,
  gapEnd: 0.95,
  pickupEvery: 2.4,
};

export const SCORE = { corn: 10, feather: 25, wishbone: 50, metre: 1 };
export const LIVES_START = 3;
export const BEST_KEY = 'gobble-dash-best';
