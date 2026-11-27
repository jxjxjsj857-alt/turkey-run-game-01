// All sound is synthesised with WebAudio: no audio files, no network.
// Gobbles, footsteps, pickup blips, a farmer's yell and a little autumn
// tune, built from oscillators and filtered noise.
export function createAudio() {
  let context = null;
  let muted = false;
  let musicTimer = null;
  let step = 0;

  // A short Thanksgiving-ish loop: C major pentatonic walk, one note a beat.
  const MELODY = [523, 587, 659, 784, 659, 587, 523, 440, 494, 523, 587, 659, 784, 880, 784, 659];
  const BEAT = 0.24;

  function ensure() {
    if (!context) {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) return null;
      context = new Ctor();
    }
    if (context.state === 'suspended') void context.resume();
    return context;
  }

  function tone(freq, seconds, type, gainValue, when = 0, slideTo = null) {
    const ctx = ensure();
    if (!ctx || muted) return;
    const start = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    if (slideTo !== null) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), start + seconds);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + seconds);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + seconds + 0.05);
  }

  function noise(seconds, gainValue, lowpass, when = 0) {
    const ctx = ensure();
    if (!ctx || muted) return;
    const start = ctx.currentTime + when;
    const length = Math.max(1, Math.floor(ctx.sampleRate * seconds));
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = lowpass;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(gainValue, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + seconds);
    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start(start);
  }

  return {
    get muted() {
      return muted;
    },
    toggleMute() {
      muted = !muted;
      if (muted) this.stopMusic();
      return muted;
    },
    unlock() {
      ensure();
    },
    gobble() {
      // Three quick pitch-dropping clucks.
      tone(420, 0.09, 'square', 0.10, 0, 240);
      tone(360, 0.09, 'square', 0.10, 0.10, 200);
      tone(300, 0.14, 'square', 0.12, 0.20, 150);
    },
    jump() {
      noise(0.14, 0.10, 1400);
      tone(300, 0.14, 'sine', 0.08, 0, 620);
    },
    land() {
      noise(0.07, 0.08, 500);
    },
    pickup() {
      tone(880, 0.09, 'sine', 0.12);
      tone(1318, 0.12, 'sine', 0.10, 0.07);
    },
    feather() {
      tone(660, 0.10, 'triangle', 0.12, 0, 990);
      tone(990, 0.10, 'triangle', 0.12, 0.08, 1320);
      tone(1320, 0.16, 'triangle', 0.10, 0.16, 1760);
    },
    hit() {
      noise(0.22, 0.22, 700);
      tone(160, 0.25, 'sawtooth', 0.16, 0, 60);
    },
    yell() {
      tone(220, 0.30, 'sawtooth', 0.10, 0, 420);
      tone(330, 0.22, 'sawtooth', 0.08, 0.12, 180);
    },
    hide() {
      noise(0.25, 0.07, 900);
    },
    found() {
      tone(180, 0.18, 'square', 0.12, 0, 90);
      tone(520, 0.30, 'sawtooth', 0.12, 0.14, 780);
    },
    win() {
      [523, 659, 784, 1046].forEach((freq, i) => tone(freq, 0.28, 'triangle', 0.14, i * 0.13));
      tone(1318, 0.5, 'triangle', 0.12, 0.55);
    },
    lose() {
      [392, 330, 262, 196].forEach((freq, i) => tone(freq, 0.32, 'triangle', 0.13, i * 0.17));
    },
    click() {
      tone(700, 0.05, 'sine', 0.08);
    },
    startMusic() {
      if (musicTimer !== null || muted) return;
      step = 0;
      musicTimer = window.setInterval(() => {
        if (muted) return;
        const note = MELODY[step % MELODY.length];
        tone(note, BEAT * 0.9, 'triangle', 0.045);
        if (step % 4 === 0) tone(note / 2, BEAT * 1.8, 'sine', 0.05);
        step += 1;
      }, BEAT * 1000);
    },
    stopMusic() {
      if (musicTimer !== null) {
        window.clearInterval(musicTimer);
        musicTimer = null;
      }
    },
  };
}
