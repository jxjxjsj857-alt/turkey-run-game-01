// All drawing: the turkey, the farmer, the farm, the barn, the kitchen,
// the HUD, the title screen and the end screens. Canvas 2D only, no images.
import { GROUND_Y, STAGES, VIEW } from './config.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';
export const SCREEN_ESCAPED = 'escaped';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawTurkey(ctx, x, y, w, h, cycle, sliding, stumble, hidden) {
  if (hidden) return; // tucked inside the haystack
  ctx.save();
  ctx.translate(x + w / 2, y + h);
  const bob = Math.sin(cycle) * (sliding ? 0 : 2);
  const blink = Math.abs(Math.sin(cycle * 0.5)) < 0.06;
  if (stumble > 0) ctx.rotate(Math.sin(cycle * 3) * 0.08);
  // Tail fan
  ctx.fillStyle = '#a3541e';
  for (let i = -2; i <= 2; i += 1) {
    ctx.save();
    ctx.rotate(i * 0.34);
    ctx.beginPath();
    ctx.ellipse(-14, -h + 12, 7, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = '#c97b2e';
  for (let i = -1; i <= 1; i += 1) {
    ctx.save();
    ctx.rotate(i * 0.3);
    ctx.beginPath();
    ctx.ellipse(-12, -h + 16, 5, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  // Body
  ctx.fillStyle = '#7a4a21';
  ellipse(ctx, 0, -h / 2 + bob, w * 0.42, h * 0.46);
  ctx.fillStyle = '#8f5a2a';
  ellipse(ctx, 2, -h / 2 + 4 + bob, w * 0.32, h * 0.34);
  // Wing
  ctx.fillStyle = '#5d3517';
  ctx.beginPath();
  ctx.ellipse(-4, -h / 2 + 2 + bob, 13, 9, -0.5, 0, Math.PI * 2);
  ctx.fill();
  // Head
  ctx.fillStyle = '#7a4a21';
  ellipse(ctx, w * 0.34, -h + 8 + bob, 11, 10);
  // Beak
  ctx.fillStyle = '#e8a13a';
  ctx.beginPath();
  ctx.moveTo(w * 0.34 + 8, -h + 6 + bob);
  ctx.lineTo(w * 0.34 + 20, -h + 10 + bob);
  ctx.lineTo(w * 0.34 + 8, -h + 13 + bob);
  ctx.closePath();
  ctx.fill();
  // Wattle
  ctx.fillStyle = '#d23b2e';
  ellipse(ctx, w * 0.34 + 10, -h + 16 + bob, 3.5, 6);
  // Eye
  ctx.fillStyle = blink ? '#7a4a21' : '#ffffff';
  ellipse(ctx, w * 0.34 + 4, -h + 4 + bob, 3.2, 3.2);
  if (!blink) {
    ctx.fillStyle = '#1a1a1a';
    ellipse(ctx, w * 0.34 + 5, -h + 4 + bob, 1.6, 1.6);
  }
  // Legs
  ctx.strokeStyle = '#e8a13a';
  ctx.lineWidth = 3;
  const step = Math.sin(cycle) * 6;
  ctx.beginPath();
  ctx.moveTo(-6, -6);
  ctx.lineTo(-6 + step, 0);
  ctx.moveTo(6, -6);
  ctx.lineTo(6 - step, 0);
  ctx.stroke();
  ctx.restore();
}

function drawFarmer(ctx, x, y, w, h, cycle, searching) {
  ctx.save();
  ctx.translate(x + w / 2, y + h);
  const bob = Math.sin(cycle) * 2;
  // Legs (overalls)
  ctx.strokeStyle = '#3a5a8c';
  ctx.lineWidth = 8;
  const step = Math.sin(cycle) * 8;
  ctx.beginPath();
  ctx.moveTo(-8, -34);
  ctx.lineTo(-8 + step, 0);
  ctx.moveTo(8, -34);
  ctx.lineTo(8 - step, 0);
  ctx.stroke();
  // Body: plaid shirt + overalls
  ctx.fillStyle = '#b03a2e';
  roundRect(ctx, -20, -72 + bob, 40, 42, 8);
  ctx.fill();
  ctx.fillStyle = '#3a5a8c';
  roundRect(ctx, -20, -48 + bob, 40, 20, 6);
  ctx.fill();
  // Arm with pitchfork, raised when searching
  ctx.strokeStyle = '#b03a2e';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(14, -64 + bob);
  ctx.lineTo(30, searching ? -88 + bob : -52 + bob);
  ctx.stroke();
  ctx.strokeStyle = '#8a6a3a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(30, searching ? -88 + bob : -52 + bob);
  ctx.lineTo(44, -100 + bob);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(44, -100 + bob);
  ctx.lineTo(38, -112 + bob);
  ctx.moveTo(44, -100 + bob);
  ctx.lineTo(50, -112 + bob);
  ctx.stroke();
  // Head + straw hat
  ctx.fillStyle = '#e8b98a';
  ellipse(ctx, 0, -80 + bob, 13, 12);
  ctx.fillStyle = '#d8b25a';
  ellipse(ctx, 0, -88 + bob, 22, 6);
  ctx.beginPath();
  ctx.ellipse(0, -92 + bob, 12, 7, 0, Math.PI, 0);
  ctx.fill();
  // Angry eye + moustache
  ctx.fillStyle = '#1a1a1a';
  ellipse(ctx, 7, -82 + bob, 2, 2.4);
  ctx.strokeStyle = '#5a3a1a';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-2, -74 + bob);
  ctx.quadraticCurveTo(6, -70 + bob, 12, -74 + bob);
  ctx.stroke();
  if (searching) {
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('?', 26, -108 + bob);
  }
  ctx.restore();
}

function drawBackground(ctx, stage, distance) {
  const palette = STAGES[stage];
  const gradient = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  gradient.addColorStop(0, palette.sky[0]);
  gradient.addColorStop(1, palette.sky[1]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, VIEW.width, GROUND_Y);
  // Sun or moon
  if (stage === 2) {
    ctx.fillStyle = '#f5e6c8';
    ellipse(ctx, 830, 70, 30, 30);
    ctx.fillStyle = '#d8c49a';
    ellipse(ctx, 820, 62, 7, 7);
    ellipse(ctx, 840, 78, 5, 5);
  } else {
    ctx.fillStyle = '#fff3c8';
    ellipse(ctx, 830, 70, 34, 34);
    ctx.fillStyle = '#ffe08a';
    ellipse(ctx, 830, 70, 26, 26);
  }
  // Clouds
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  const cloudX = 960 - ((distance * 12) % 1100);
  for (const cx of [cloudX, cloudX + 520]) {
    ellipse(ctx, cx, 84, 42, 14);
    ellipse(ctx, cx + 26, 78, 30, 12);
    ellipse(ctx, cx - 28, 80, 26, 11);
  }
  // Rolling hills
  ctx.fillStyle = stage === 2 ? '#4a2c3d' : '#c98a4b';
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  for (let x = 0; x <= VIEW.width; x += 160) {
    const peak = GROUND_Y - 42 - ((x * 37) % 26);
    ctx.quadraticCurveTo(x + 80, peak, x + 160, GROUND_Y);
  }
  ctx.closePath();
  ctx.fill();
  // Ground
  ctx.fillStyle = palette.ground;
  ctx.fillRect(0, GROUND_Y, VIEW.width, VIEW.height - GROUND_Y);
  ctx.fillStyle = palette.grass;
  ctx.fillRect(0, GROUND_Y, VIEW.width, 10);
  // Dirt speckles
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  for (let x = 0; x < VIEW.width; x += 53) {
    ellipse(ctx, x + ((distance * 37 + x) % 47), GROUND_Y + 34 + ((x * 13) % 40), 8, 3);
  }
}

function drawDecor(ctx, decor, stage) {
  for (const item of decor) {
    const x = item.x;
    if (x < -260 || x > VIEW.width + 40) continue;
    ctx.save();
    ctx.translate(x, GROUND_Y);
    ctx.scale(item.scale, item.scale);
    if (item.kind === 'tree') {
      ctx.fillStyle = '#6a4a26';
      ctx.fillRect(-6, -90, 12, 90);
      ctx.fillStyle = stage === 2 ? '#7a4a2a' : '#c96a1e';
      ellipse(ctx, 0, -110, 42, 36);
      ellipse(ctx, -28, -92, 26, 22);
      ellipse(ctx, 28, -92, 26, 22);
    } else if (item.kind === 'fencepost') {
      ctx.fillStyle = '#8a6a3a';
      ctx.fillRect(-4, -34, 8, 34);
      ctx.fillRect(-26, -30, 52, 6);
      ctx.fillRect(-26, -16, 52, 6);
    } else if (item.kind === 'pumpkin') {
      ctx.fillStyle = '#e07a1e';
      ellipse(ctx, 0, -14, 20, 15);
      ctx.fillStyle = '#c85e10';
      ellipse(ctx, 0, -14, 12, 15);
      ctx.fillStyle = '#e07a1e';
      ellipse(ctx, 0, -14, 5, 15);
      ctx.strokeStyle = '#4a7a2a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, -28);
      ctx.lineTo(4, -38);
      ctx.stroke();
    } else if (item.kind === 'barn') {
      ctx.fillStyle = '#a33327';
      ctx.fillRect(-70, -110, 140, 110);
      ctx.fillStyle = '#7a241b';
      ctx.beginPath();
      ctx.moveTo(-78, -110);
      ctx.lineTo(0, -150);
      ctx.lineTo(78, -110);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#f5e6c8';
      ctx.lineWidth = 4;
      ctx.strokeRect(-24, -64, 48, 64);
      ctx.beginPath();
      ctx.moveTo(-24, -64);
      ctx.lineTo(24, 0);
      ctx.moveTo(24, -64);
      ctx.lineTo(-24, 0);
      ctx.stroke();
    } else if (item.kind === 'bush') {
      ctx.fillStyle = stage === 2 ? '#3d5a34' : '#5d8a3a';
      ellipse(ctx, 0, -12, 30, 14);
      ellipse(ctx, -20, -8, 18, 10);
      ellipse(ctx, 20, -8, 18, 10);
    } else if (item.kind === 'pan') {
      ctx.strokeStyle = '#3a3a3a';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, -60, 22, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(20, -72);
      ctx.lineTo(40, -88);
      ctx.stroke();
    } else if (item.kind === 'window') {
      ctx.fillStyle = '#2c3e50';
      ctx.fillRect(-34, -130, 68, 90);
      ctx.fillStyle = '#ffd98a';
      ctx.fillRect(-28, -124, 56, 78);
      ctx.strokeStyle = '#2c3e50';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, -124);
      ctx.lineTo(0, -46);
      ctx.moveTo(-28, -85);
      ctx.lineTo(28, -85);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function drawObstacle(ctx, obstacle) {
  const { kind, x, y, width, height } = obstacle;
  ctx.save();
  if (kind === 'fence') {
    ctx.fillStyle = '#8a6a3a';
    ctx.fillRect(x, y, 6, height);
    ctx.fillRect(x + width - 6, y, 6, height);
    ctx.fillRect(x - 6, y + 8, width + 12, 7);
    ctx.fillRect(x - 6, y + 30, width + 12, 7);
  } else if (kind === 'mud') {
    ctx.fillStyle = '#6a4a2a';
    ellipse(ctx, x + width / 2, y + height / 2, width / 2, height / 2 + 4);
    ctx.fillStyle = '#8a6a3a';
    ellipse(ctx, x + width / 2 - 12, y + 4, 14, 4);
    ellipse(ctx, x + width / 2 + 18, y + 6, 10, 3);
  } else if (kind === 'haybale') {
    ctx.fillStyle = '#d8b25a';
    ctx.beginPath();
    ctx.arc(x + width / 2, y + height / 2, height / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#a8842e';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x + width / 2, y + height / 2, height / 2 - 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + width / 2, y + height / 2, height / 2 - 16, 0, Math.PI * 2);
    ctx.stroke();
  } else if (kind === 'pumpkin') {
    ctx.save();
    ctx.translate(x + width / 2, y + height / 2);
    ctx.rotate(obstacle.roll || 0);
    ctx.fillStyle = '#e07a1e';
    ellipse(ctx, 0, 0, width / 2, height / 2);
    ctx.fillStyle = '#c85e10';
    ellipse(ctx, 0, 0, width / 4, height / 2);
    ctx.fillStyle = '#e07a1e';
    ellipse(ctx, 0, 0, width / 8, height / 2);
    ctx.restore();
  } else if (kind === 'oven') {
    ctx.fillStyle = '#3a3a3a';
    roundRect(ctx, x, y, width, height, 6);
    ctx.fill();
    ctx.fillStyle = '#ff7a2e';
    roundRect(ctx, x + 10, y + 14, width - 20, 34, 4);
    ctx.fill();
    ctx.fillStyle = '#ffd98a';
    roundRect(ctx, x + 16, y + 20, width - 32, 22, 3);
    ctx.fill();
    ctx.fillStyle = '#c8c8c8';
    ctx.fillRect(x + 10, y + 58, width - 20, 5);
    ctx.fillStyle = '#ff3a1e';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('HOT!', x + width / 2, y + height - 8);
    ctx.textAlign = 'left';
  } else if (kind === 'knife') {
    if (obstacle.warn > 0) {
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ellipse(ctx, x + width / 2, GROUND_Y + 6, 26, 6);
      ctx.fillStyle = '#d23b2e';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('!', x + width / 2, GROUND_Y - 10);
      ctx.textAlign = 'left';
    }
    ctx.save();
    ctx.translate(x + width / 2, y + height / 2);
    ctx.rotate(0.5);
    ctx.fillStyle = '#d8dce2';
    ctx.beginPath();
    ctx.moveTo(-6, -26);
    ctx.lineTo(6, -26);
    ctx.lineTo(2, 18);
    ctx.lineTo(-2, 18);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(-5, 18, 10, 12);
    ctx.restore();
  } else if (kind === 'net') {
    ctx.strokeStyle = '#e8e0c8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x + width / 2, y + height / 2, width / 2, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = -2; i <= 2; i += 1) {
      ctx.beginPath();
      ctx.moveTo(x + width / 2 + i * 8, y);
      ctx.lineTo(x + width / 2 + i * 8, y + height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y + height / 2 + i * 6);
      ctx.lineTo(x + width, y + height / 2 + i * 6);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawPickup(ctx, pickup, time) {
  const bobY = Math.sin(pickup.bob + time * 2) * 3;
  ctx.save();
  ctx.translate(pickup.x + pickup.width / 2, pickup.y + pickup.height / 2 + bobY);
  if (pickup.kind === 'corn') {
    ctx.fillStyle = '#f5c542';
    ellipse(ctx, 0, 0, 9, 13);
    ctx.fillStyle = '#e8a13a';
    ellipse(ctx, 0, 0, 5, 13);
    ctx.fillStyle = '#5d8a3a';
    ctx.beginPath();
    ctx.moveTo(-6, -10);
    ctx.lineTo(-12, -20);
    ctx.lineTo(-2, -14);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(6, -10);
    ctx.lineTo(12, -20);
    ctx.lineTo(2, -14);
    ctx.closePath();
    ctx.fill();
  } else if (pickup.kind === 'feather') {
    ctx.fillStyle = '#f5f0e6';
    ctx.beginPath();
    ctx.ellipse(0, 0, 6, 14, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c97b2e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-4, 10);
    ctx.lineTo(4, -12);
    ctx.stroke();
  } else {
    // Golden wishbone
    ctx.strokeStyle = '#ffd94a';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 12);
    ctx.quadraticCurveTo(-12, 0, -12, -12);
    ctx.moveTo(0, 12);
    ctx.quadraticCurveTo(12, 0, 12, -12);
    ctx.stroke();
    ctx.fillStyle = '#fff3a8';
    ellipse(ctx, -12, -12, 3, 3);
    ellipse(ctx, 12, -12, 3, 3);
  }
  ctx.restore();
}

function drawHaystack(ctx, stack, hidden) {
  ctx.save();
  ctx.fillStyle = '#d8b25a';
  ctx.beginPath();
  ctx.moveTo(stack.x, stack.y + stack.height);
  ctx.quadraticCurveTo(stack.x + stack.width / 2, stack.y - 14, stack.x + stack.width, stack.y + stack.height);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#a8842e';
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i += 1) {
    ctx.beginPath();
    ctx.moveTo(stack.x + 12 + i * 14, stack.y + stack.height - 6);
    ctx.quadraticCurveTo(stack.x + 14 + i * 14, stack.y + 30, stack.x + 10 + i * 14, stack.y + 8);
    ctx.stroke();
  }
  if (hidden) {
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('shhh…', stack.x + stack.width / 2, stack.y - 8);
    ctx.textAlign = 'left';
  } else {
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('HIDE: hold ↓', stack.x + stack.width / 2, stack.y - 8);
    ctx.textAlign = 'left';
  }
  ctx.restore();
}

function drawHud(ctx, state, best) {
  const stage = STAGES[state.stage];
  ctx.save();
  // Top bar
  ctx.fillStyle = 'rgba(20,12,6,0.55)';
  roundRect(ctx, 12, 10, VIEW.width - 24, 54, 10);
  ctx.fill();
  ctx.fillStyle = '#fff3d6';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`SCORE ${Math.floor(state.score)}`, 26, 32);
  ctx.font = '16px sans-serif';
  ctx.fillText(`CORN ${state.corn}   BEST ${Math.max(best, Math.floor(state.score))}`, 26, 54);
  // Distance + stage progress
  const progress = Math.min(1, state.distance / 1140);
  ctx.fillStyle = '#fff3d6';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${stage.name}  •  ${Math.floor(state.distance)}m / 1140m`, VIEW.width / 2, 30);
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  roundRect(ctx, VIEW.width / 2 - 130, 38, 260, 10, 5);
  ctx.fill();
  ctx.fillStyle = '#ffd94a';
  roundRect(ctx, VIEW.width / 2 - 130, 38, 260 * progress, 10, 5);
  ctx.fill();
  // Lives (drawn hearts: filled = left, outline = lost)
  for (let i = 0; i < 3; i += 1) {
    const hx = VIEW.width - 34 - i * 30;
    const hy = 26;
    ctx.beginPath();
    ctx.moveTo(hx, hy + 6);
    ctx.bezierCurveTo(hx - 10, hy - 4, hx - 5, hy - 12, hx, hy - 5);
    ctx.bezierCurveTo(hx + 5, hy - 12, hx + 10, hy - 4, hx, hy + 6);
    ctx.closePath();
    if (i < state.lives) {
      ctx.fillStyle = '#ff4a3a';
      ctx.fill();
    } else {
      ctx.strokeStyle = '#ffb0a0';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
  ctx.font = '13px sans-serif';
  ctx.fillStyle = state.muted ? '#ffb0a0' : '#cfe8b0';
  ctx.textAlign = 'right';
  ctx.fillText(state.muted ? 'M: muted' : 'M: sound on', VIEW.width - 26, 54);
  ctx.textAlign = 'left';
  ctx.textAlign = 'left';
  // Farmer proximity meter (bottom left)
  ctx.fillStyle = 'rgba(20,12,6,0.55)';
  roundRect(ctx, 12, VIEW.height - 52, 250, 40, 10);
  ctx.fill();
  ctx.fillStyle = '#ffb0a0';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('FARMER', 24, VIEW.height - 30);
  const danger = 1 - state.gap / 520;
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  roundRect(ctx, 96, VIEW.height - 40, 150, 12, 6);
  ctx.fill();
  ctx.fillStyle = danger > 0.66 ? '#ff3a1e' : danger > 0.33 ? '#ff9e2e' : '#7fd65a';
  roundRect(ctx, 96, VIEW.height - 40, 150 * danger, 12, 6);
  ctx.fill();
  if (danger > 0.8) {
    ctx.fillStyle = '#ff3a1e';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('HE IS RIGHT BEHIND YOU!', 276, VIEW.height - 28);
  }
  // Centre message
  if (state.messageTimer > 0 && state.message) {
    ctx.font = 'bold 17px sans-serif';
    ctx.fillStyle = 'rgba(20,12,6,0.6)';
    const w = ctx.measureText(state.message).width + 56;
    roundRect(ctx, VIEW.width / 2 - w / 2, 84, w, 34, 10);
    ctx.fill();
    ctx.fillStyle = '#ffe9a8';
    ctx.textAlign = 'center';
    ctx.fillText(state.message, VIEW.width / 2, 107);
    ctx.textAlign = 'left';
  }
  ctx.restore();
}

function drawTitle(ctx, best, time) {
  ctx.save();
  ctx.fillStyle = 'rgba(30,16,6,0.45)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  // Title card
  ctx.fillStyle = 'rgba(255,244,214,0.96)';
  roundRect(ctx, 130, 62, 700, 300, 18);
  ctx.fill();
  ctx.strokeStyle = '#b3541e';
  ctx.lineWidth = 4;
  roundRect(ctx, 130, 62, 700, 300, 18);
  ctx.stroke();
  ctx.fillStyle = '#7a2e0e';
  ctx.font = 'bold 52px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('GOBBLE DASH', VIEW.width / 2, 128);
  ctx.fillStyle = '#b3541e';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText("— Turkey's Great Escape —", VIEW.width / 2, 164);
  ctx.fillStyle = '#4a2c12';
  ctx.font = '17px sans-serif';
  ctx.fillText('Thanksgiving morning. The farmer is coming with his carving knife.', VIEW.width / 2, 202);
  ctx.fillText('Run the farmyard, the barn and the kitchen — and out the back door!', VIEW.width / 2, 228);
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('SPACE / ↑ jump      ↓ slide & hide in haystacks      ESC pause      M mute', VIEW.width / 2, 266);
  ctx.fillText('Grab corn to slow the farmer. Dodge fences, mud, knives and the oven.', VIEW.width / 2, 292);
  const pulse = 0.7 + Math.sin(time * 4) * 0.3;
  ctx.fillStyle = `rgba(122,46,14,${pulse})`;
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('▶  PRESS SPACE OR CLICK TO START', VIEW.width / 2, 336);
  if (best > 0) {
    ctx.fillStyle = '#7a2e0e';
    ctx.font = '15px sans-serif';
    ctx.fillText(`Best escape so far: ${best} points`, VIEW.width / 2, 384 - 30);
  }
  ctx.restore();
  return { x: 130, y: 62, width: 700, height: 300 };
}

function drawEnd(ctx, state, best, escaped) {
  ctx.save();
  ctx.fillStyle = escaped ? 'rgba(20,60,20,0.55)' : 'rgba(60,10,6,0.55)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.fillStyle = 'rgba(255,244,214,0.97)';
  roundRect(ctx, 180, 110, 600, 290, 18);
  ctx.fill();
  ctx.strokeStyle = escaped ? '#2e7a3a' : '#b3541e';
  ctx.lineWidth = 4;
  roundRect(ctx, 180, 110, 600, 290, 18);
  ctx.stroke();
  ctx.textAlign = 'center';
  ctx.fillStyle = escaped ? '#2e7a3a' : '#7a2e0e';
  ctx.font = 'bold 44px sans-serif';
  ctx.fillText(escaped ? 'YOU ESCAPED!' : 'CAUGHT!', VIEW.width / 2, 176);
  ctx.fillStyle = '#4a2c12';
  ctx.font = '18px sans-serif';
  if (escaped) {
    ctx.fillText('Out the back door and into the woods —', VIEW.width / 2, 214);
    ctx.fillText('no Thanksgiving dinner for you this year!', VIEW.width / 2, 240);
  } else if (state.cause === 'out-of-lives') {
    ctx.fillText('Three stumbles too many — the farmer', VIEW.width / 2, 214);
    ctx.fillText('catches up with his carving knife…', VIEW.width / 2, 240);
  } else {
    ctx.fillText('The farmer caught up with you!', VIEW.width / 2, 214);
    ctx.fillText('His carving knife was faster than your legs…', VIEW.width / 2, 240);
  }
  ctx.font = 'bold 20px sans-serif';
  ctx.fillStyle = '#7a2e0e';
  ctx.fillText(`Score ${Math.floor(state.score)}   •   Distance ${Math.floor(state.distance)}m   •   Corn ${state.corn}`, VIEW.width / 2, 286);
  if (Math.floor(state.score) >= best && Math.floor(state.score) > 0) {
    ctx.fillStyle = '#b3541e';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('★ NEW BEST! ★', VIEW.width / 2, 318);
  }
  ctx.fillStyle = '#4a2c12';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('Press R or click to run again', VIEW.width / 2, 356);
  ctx.textAlign = 'left';
  ctx.restore();
  return { x: 180, y: 110, width: 600, height: 290 };
}

function drawPaused(ctx) {
  ctx.save();
  ctx.fillStyle = 'rgba(20,12,6,0.6)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.fillStyle = '#fff3d6';
  ctx.font = 'bold 44px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PAUSED', VIEW.width / 2, VIEW.height / 2 - 10);
  ctx.font = '18px sans-serif';
  ctx.fillText('ESC to resume  •  R to restart', VIEW.width / 2, VIEW.height / 2 + 30);
  ctx.textAlign = 'left';
  ctx.restore();
}

export function drawWorld(ctx, world, screen, best, time) {
  const state = world.state;
  drawBackground(ctx, state.stage, state.distance);
  drawDecor(ctx, state.decor, state.stage);
  for (const stack of state.haystacks) {
    if (stack.active) drawHaystack(ctx, stack, state.hidden);
  }
  for (const pickup of state.pickups) {
    if (pickup.active) drawPickup(ctx, pickup, time);
  }
  for (const obstacle of state.obstacles) {
    if (obstacle.active) drawObstacle(ctx, obstacle);
  }
  // Farmer (always behind the turkey while playing)
  if (screen === SCREEN_PLAY || screen === SCREEN_PAUSED) {
    const farmer = state.farmer;
    const searching = farmer.state === 'search';
    drawFarmer(ctx, farmer.x, farmer.y, farmer.width, farmer.height, farmer.runCycle, searching);
  }
  drawTurkey(
    ctx,
    state.player.x,
    state.player.y,
    state.player.width,
    state.player.height,
    state.player.runCycle,
    state.player.sliding,
    state.player.stumble,
    state.hidden,
  );
  // Stumble flash
  if (state.player.invincible > 0 && Math.floor(time * 10) % 2 === 0) {
    ctx.fillStyle = 'rgba(255,60,30,0.18)';
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  }
  drawHud(ctx, state, best);
  if (screen === SCREEN_TITLE) return drawTitle(ctx, best, time);
  if (screen === SCREEN_PAUSED) drawPaused(ctx);
  if (screen === SCREEN_OVER) return drawEnd(ctx, state, best, false);
  if (screen === SCREEN_ESCAPED) return drawEnd(ctx, state, best, true);
  return null;
}
