// Keyboard and mouse input. The game reads a snapshot each frame:
// jump (held / just pressed), slide (held), any key, and mouse clicks
// with their canvas coordinates for menu buttons.
export function createInput(canvas) {
  const keys = new Set();
  const pressed = new Set();
  let clicks = [];

  function codeOf(event) {
    return event.code;
  }

  function onKeyDown(event) {
    if (['Space', 'ArrowUp', 'ArrowDown', 'KeyW', 'KeyS'].includes(event.code)) {
      event.preventDefault();
    }
    if (!event.repeat) pressed.add(event.code);
    keys.add(event.code);
  }

  function onKeyUp(event) {
    keys.delete(event.code);
  }

  function onMouseDown(event) {
    const rect = canvas.getBoundingClientRect();
    clicks.push({
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height),
    });
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  canvas.addEventListener('mousedown', onMouseDown);

  return {
    get jumpHeld() {
      return keys.has('Space') || keys.has('ArrowUp') || keys.has('KeyW');
    },
    get slideHeld() {
      return keys.has('ArrowDown') || keys.has('KeyS');
    },
    get pausePressed() {
      return pressed.has('Escape') || pressed.has('KeyP');
    },
    get mutePressed() {
      return pressed.has('KeyM');
    },
    get restartPressed() {
      return pressed.has('KeyR') || pressed.has('Enter');
    },
    get anyPressed() {
      return pressed.size > 0;
    },
    get jumpPressed() {
      return pressed.has('Space') || pressed.has('ArrowUp') || pressed.has('KeyW');
    },
    /** Clicks since the last frame; each consumed once. */
    takeClicks() {
      const taken = clicks;
      clicks = [];
      return taken;
    },
    /** Clear the just-pressed set at the end of a frame. */
    endFrame() {
      pressed.clear();
    },
    codeOf,
  };
}
