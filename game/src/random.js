// Seeded random numbers (mulberry32) so a screenshot seed always stages
// the same farm, the same obstacles and the same frame.
export function makeRandom(seed) {
  let state = seed >>> 0;
  return function next() {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Integer in [min, max] from a seeded generator. */
export function intBetween(rng, min, max) {
  return min + Math.floor(rng() * (max - min + 1));
}

/** Pick one element from an array with a seeded generator. */
export function pick(rng, list) {
  return list[Math.floor(rng() * list.length)];
}
