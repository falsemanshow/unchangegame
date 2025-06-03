// Handles blocking, block depletion, block recovery, and dizzy state
function updateBlocking(p, pid) {
  // Controls mapping
  const controls = pid === 0 ?
    {down: 's'} :
    {down: 'l'};

  if (p._wasBlocking === undefined) p._wasBlocking = false;
  if (p.onGround && !p.dizzy && keys[controls.down]) {
    if (!p._wasBlocking && p.block < BLOCK_MAX) {
      p.blocking = false;
    } else if (p.block > 0) {
      p.blocking = true;
      p.block -= BLOCK_DEPLETION;
      if (p.block < 0) p.block = 0;
    } else {
      p.blocking = false;
    }
  } else {
    p.blocking = false;
  }
  if (!p.blocking && p.block < BLOCK_MAX) {
    p.block += BLOCK_RECOVERY;
    if (p.block > BLOCK_MAX) p.block = BLOCK_MAX;
  }
  p._wasBlocking = p.blocking;

  // Dizzy state: reduce movement if dizzy
  if (p.dizzy > 0) {
    p.dizzy--;
    p.vx *= FRICTION;
    if (Math.abs(p.vx) < 0.3) p.vx = 0;
    return true; // signal that player is dizzy, skip rest of update
  }
  return false;
}

const WIDTH = 900, HEIGHT = 600;
const GRAVITY = 0.7;
const FRICTION = 0.7;
const GROUND = HEIGHT - 60;
const PLATFORM_HEIGHT = 20;
const PLAYER_SIZE = 50;
const PLAYER_SPEED = 5;
const DASH_SPEED = 13;
const DASH_WINDOW = 250;
const JUMP_VEL = 15;
const MAX_JUMPS = 2;
const PLAYER_HP = 120;
const PLATFORM_COLOR = "#ffd54f";
const PLATFORM_EDGE = "#ffb300";
const PLAYER_OUTLINE = "#fff";
const FLOOR_HEIGHT = HEIGHT-30;
const DASH_COOLDOWN = 36;
const DASH_FRAMES = 8;
const DASH_DAMAGE = 22;
const SLOW_FALL_MULTIPLIER = 0.16;
const BLOCK_MAX = 100;
const BLOCK_DEPLETION = 1.8;
const BLOCK_RECOVERY = 0.8;
const DIZZY_FRAMES = 38;
const DIZZY_KNOCKBACK_X = 16, DIZZY_KNOCKBACK_Y = -9;
const BLOCK_PUSHBACK_X = 9, BLOCK_PUSHBACK_Y = -4;

//camera.js

function getCamera() {
  const p1 = players[0], p2 = players[1];
  const x1 = p1.x + p1.w / 2, y1 = p1.y + p1.h / 2;
  const x2 = p2.x + p2.w / 2, y2 = p2.y + p2.h / 2;

  // Center between both players
  let cx = (x1 + x2) / 2;
  let cy = (y1 + y2) / 2;

  // Account for player width and height for proper framing
  const extra = 80; // Padding pixels around players for comfort
  const playersW = Math.abs(x2 - x1) + p1.w + p2.w + extra;
  const playersH = Math.abs(y2 - y1) + p1.h + p2.h + extra;

  // Calculate zoom so both players are fully visible (fit width & height)
  const zoomW = canvas.width / playersW;
  const zoomH = canvas.height / playersH;
  let zoom = Math.min(zoomW, zoomH);

  // Clamp zoom: not too far in or out
  const minZoom = Math.max(canvas.width / WIDTH, canvas.height / HEIGHT);
  const maxZoom = 1.8; // Allow a bit more zoom-in if you want
  zoom = Math.max(minZoom, Math.min(maxZoom, zoom));

  // Clamp camera center so the world doesn't show empty space
  const viewW = canvas.width / zoom, viewH = canvas.height / zoom;
  cx = Math.max(viewW / 2, Math.min(WIDTH - viewW / 2, cx));
  cy = Math.max(viewH / 2, Math.min(HEIGHT - viewH / 2, cy));

  return { cx, cy, zoom };
}

const keys = {};
const dashTapState = [
  {lastTapDir: null, lastTapTime: 0, lastReleaseTime: {left:0, right:0}},
  {lastTapDir: null, lastTapTime: 0, lastReleaseTime: {left:0, right:0}}
];

document.addEventListener("keydown", e => { keys[e.key.toLowerCase()] = true; });
document.addEventListener("keyup", e => { keys[e.key.toLowerCase()] = false; });

document.addEventListener("keydown", function(e) {
  const k = e.key.toLowerCase();
  for (let pid = 0; pid < 2; pid++) {
    const controls = pid === 0 ?
      {left:'a', right:'d'} :
      {left:'k', right:';'};
    const p = players[pid];
    if(!p.alive) continue;
    if (k === controls.left && !keys[controls.right] && p.dashCooldown === 0) {
      let now = performance.now();
      if (
        dashTapState[pid].lastTapDir === 'left' &&
        now - dashTapState[pid].lastTapTime < DASH_WINDOW &&
        now - dashTapState[pid].lastReleaseTime.left < DASH_WINDOW
      ) {
        p.dash = DASH_FRAMES;
        p.vx = -DASH_SPEED;
        p.dashCooldown = DASH_COOLDOWN;
        dashTapState[pid].lastTapDir = null;
        spawnDashEffects(p);
      } else {
        dashTapState[pid].lastTapDir = 'left';
        dashTapState[pid].lastTapTime = now;
      }
    }
    if (k === controls.right && !keys[controls.left] && p.dashCooldown === 0) {
      let now = performance.now();
      if (
        dashTapState[pid].lastTapDir === 'right' &&
        now - dashTapState[pid].lastTapTime < DASH_WINDOW &&
        now - dashTapState[pid].lastReleaseTime.right < DASH_WINDOW
      ) {
        p.dash = DASH_FRAMES;
        p.vx = DASH_SPEED;
        p.dashCooldown = DASH_COOLDOWN;
        dashTapState[pid].lastTapDir = null;
        spawnDashEffects(p);
      } else {
        dashTapState[pid].lastTapDir = 'right';
        dashTapState[pid].lastTapTime = now;
      }
    }
  }
});
document.addEventListener("keyup", function(e) {
  const k = e.key.toLowerCase();
  for (let pid = 0; pid < 2; pid++) {
    const controls = pid === 0 ?
      {left:'a', right:'d'} :
      {left:'k', right:';'};
    let now = performance.now();
    if (k === controls.left) dashTapState[pid].lastReleaseTime.left = now;
    if (k === controls.right) dashTapState[pid].lastReleaseTime.right = now;
  }
});

function handleDashAttack() {
  for (let i = 0; i < 2; ++i) {
    let p = players[i], opp = players[1 - i];
    if (!p.alive || !opp.alive) continue;
    if (p.dash > 0 && !p.hasDashHit) {
      if (p.x < opp.x + opp.w && p.x + p.w > opp.x &&
          p.y < opp.y + opp.h && p.y + p.h > opp.y) {
        let isBlocking = false;
        if (opp.blocking && opp.block > 0 && !opp.dizzy) {
          if (opp.facing === -Math.sign(p.vx || p.facing)) {
            isBlocking = true;
          }
        }
        if (isBlocking) {
          p.dizzy = DIZZY_FRAMES;
          p.vx = opp.facing * BLOCK_PUSHBACK_X;
          p.vy = BLOCK_PUSHBACK_Y;
          p.hasDashHit = true;
          continue;
        }
        if (opp.justHit === 0 && (!opp.blocking || !isBlocking || opp.block <= 0)) {
          opp.hp -= DASH_DAMAGE;
          opp.justHit = 16;
          if (opp.dizzy > 0) {
            let dir = (p.x + p.w/2 < opp.x + opp.w/2) ? 1 : -1;
            opp.vx = dir * DIZZY_KNOCKBACK_X;
            opp.vy = DIZZY_KNOCKBACK_Y;
          } else {
            opp.vx = (p.facing || 1) * 8;
            opp.vy = -8;
          }
          if (opp.hp <= 0) { opp.hp = 0; opp.alive = false; winner = p.id; }
          p.hasDashHit = true;
        }
      }
    }
    if (p.dash === 0) p.hasDashHit = false;
  }
}

function updateUI() {
  // Update HP bars and names
  let p1hp = Math.max(0,players[0].hp)/PLAYER_HP*100;
  let p2hp = Math.max(0,players[1].hp)/PLAYER_HP*100;
  document.querySelector("#p1hp .hp-inner").style.width = p1hp+"%";
  document.querySelector("#p2hp .hp-inner").style.width = p2hp+"%";
  document.getElementById("p1nameui").textContent = players[0].name;
  document.getElementById("p2nameui").textContent = players[1].name;
  document.getElementById("p1nameui").style.color = players[0].color;
  document.getElementById("p2nameui").style.color = players[1].color;
  // Winner text
  if(winner !== null) {
    document.getElementById("winner").textContent = `Winner: ${players[winner].name || `Player ${winner+1}`}`;
  } else {
    document.getElementById("winner").textContent = "";
  }
  // Dash cooldown bars
  for (let i = 0; i < 2; ++i) {
    let bar = document.getElementById(i === 0 ? "p1dashbar" : "p2dashbar");
    let ratio = 1 - (players[i].dashCooldown / DASH_COOLDOWN);
    if (players[i].dashCooldown > 0) {
      bar.style.width = (ratio * 100) + "%";
      bar.style.background = "linear-gradient(90deg, #bbb 30%, #888 100%)";
    } else {
      bar.style.width = "100%";
      bar.style.background = "linear-gradient(90deg, #ffeb3b 30%, #ffa726 100%)";
    }
  }
}

const particles = [];

function spawnDashEffects(player) {
  particles.push({
    type: "smoke",
    x: player.x + player.w/2,
    y: player.y + player.h,
    life: 20
  });
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].life--;
    if (particles[i].life <= 0) particles.splice(i, 1);
  }
}

function drawParticles(ctx) {
  for (const e of particles) {
    if (e.type === "smoke") {
      ctx.save();
      ctx.globalAlpha = e.life/20 * 0.5;
      ctx.fillStyle = "#bbb";
      ctx.beginPath();
      ctx.arc(e.x, e.y, 14, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();
    }
  }
}

const platforms = [
  {x: WIDTH/2 - 70, y: GROUND-90, w: 140},
  {x: WIDTH/4 - 60, y: GROUND-180, w: 120},
  {x: 3*WIDTH/4 - 60, y: GROUND-180, w: 120},
  {x: 60, y: GROUND-60, w: 120},
  {x: WIDTH-180, y: GROUND-60, w: 120}
];

// --- Player Update Function: Handles all per-frame player logic ---
function updatePlayer(p, pid) {
  if (!p.alive) return;

  // --- Controls Mapping ---
  const controls = pid === 0 ?
    {left: 'a', right: 'd', up: 'w', down: 's'} :
    {left: 'k', right: ';', up: 'o', down: 'l'};

  // --- Block Mechanic (moved to blocking.js) ---
  if (updateBlocking(p, pid)) return;

  // --- Dizzy Mechanic ---
  // Handles dizzy state and movement reduction
  if (p.dizzy > 0) {
    p.dizzy--;
    p.vx *= FRICTION;
    if (Math.abs(p.vx) < 0.3) p.vx = 0;
    return;
  }

  // --- Dash Mechanic ---
  // Handles dash movement and dash cooldown
  if (p.dash > 0) {
    p.dash--;
  } else {
    // --- Horizontal Movement ---
    if (keys[controls.left] && !keys[controls.right] && !p.blocking) {
      p.vx = -PLAYER_SPEED; p.facing = -1;
    }
    if (keys[controls.right] && !keys[controls.left] && !p.blocking) {
      p.vx = PLAYER_SPEED; p.facing = 1;
    }
    if ((!keys[controls.left] && !keys[controls.right]) || p.blocking) {
      p.vx *= FRICTION;
      if (Math.abs(p.vx) < 0.3) p.vx = 0;
    }
  }

  // --- Jumping Mechanic ---
  // Handles jumping, double jump, and slow-fall
  let slowFallActive = false;
  if (!p.onGround && keys[controls.up]) {
    slowFallActive = true;
  }
  if (keys[controls.up]) {
    if ((p.onGround || p.jumps < MAX_JUMPS) && !p.jumpHeld && !p.blocking) {
      p.vy = -JUMP_VEL; p.jumps++; p.jumpHeld = true;
    }
  } else {
    p.jumpHeld = false;
  }

  // --- Dash Cooldown Timer ---
  if (p.dashCooldown > 0) p.dashCooldown--;

  // --- Gravity and Slow-Fall ---
  if (slowFallActive && p.vy > 0) {
    p.vy += GRAVITY * SLOW_FALL_MULTIPLIER;
  } else {
    p.vy += GRAVITY;
  }

  // --- Apply Movement ---
  p.x += p.vx;
  p.y += p.vy;

  // --- Clamp to Stage Boundaries ---
  p.x = Math.max(0, Math.min(WIDTH - p.w, p.x));
  p.onGround = false;

  // --- Floor and Platform Collision ---
  if (p.y + p.h >= FLOOR_HEIGHT) {
    p.y = FLOOR_HEIGHT - p.h;
    p.vy = 0;
    p.onGround = true;
    p.jumps = 0;
  } else {
    // --- Platform Collision ---
    for (let plat of platforms) {
      if (
        p.vy >= 0 &&
        p.x + p.w > plat.x && p.x < plat.x + plat.w &&
        p.y + p.h > plat.y && p.y + p.h - p.vy <= plat.y + 3
      ) {
        p.y = plat.y - p.h;
        p.vy = 0;
        p.onGround = true;
        p.jumps = 0;
      }
    }
  }
  if (p.y < 0) { p.y = 0; p.vy = 0; }
}

function getAnimForPlayer(p) {
  let charAnim = characterSprites[p.charId];
  if (!charAnim) return null;
  return charAnim[p.animState];
}

function updatePlayerAnimState(p, pid) {
  const prevState = p.animState;
  const other = players[1 - pid];
  if (p.alive && other && !other.alive && getAnimForPlayer({...p, animState:"victory"})) {
    p.animState = "victory"; return;
  }
  if (!p.alive) { p.animState = "defeat"; return; }
  if (p.dizzy > 0) { p.animState = "dizzy"; return; }
  if (p.justHit > 0) { p.animState = "hit"; return; }
  if (p.blocking) { p.animState = "block"; return; }
  if (p.dash > 0) { p.animState = "dash"; return; }
  if (!p.onGround && p.vy < 0) { p.animState = "jump"; return; }
  if (!p.onGround && p.vy > 0) { p.animState = "fall"; return; }
  if (Math.abs(p.vx) > 1) { p.animState = "walk"; return; }
  p.animState = "idle";
  if (p.animState !== prevState) {
    p.animFrame = 0;
    p.animTimer = 0;
  }
}

function updateAnimation(p) {
  const anim = getAnimForPlayer(p);
  if (!anim) { p.animFrame = 0; p.animTimer = 0; return; }
  p.animTimer++;
  if (p.animTimer >= anim.speed) {
    p.animTimer = 0;
    p.animFrame = (p.animFrame + 1) % anim.frames;
  }
}

const blockBarBorderImg = new Image();
blockBarBorderImg.src = "gold-block-border.png";

// --- Load Underground Background Image ---
const bgImg = new Image();
bgImg.src = "underground.jpg";

// --- Character Sprites ---
const characterSprites = {
  gold: {
    idle:      { src: "gold-idle.png", frames: 5, w: 50, h: 50, speed: 13 },
    walk:      { src: "gold-walk.png", frames: 10, w: 50, h: 50, speed: 4 },
    jump:      { src: "gold-jump.png", frames: 3, w: 50, h: 50, speed: 6 },
    fall:      { src: "gold-fall.png", frames: 1, w: 50, h: 50, speed: 7 },
    attack:    { src: "gold-attack.png", frames: 3, w: 38, h: 38, speed: 2 },
    attack_air:{ src: "gold-attack-air.png", frames: 2, w: 38, h: 38, speed: 2 },
    block:     { src: "gold-block.png", frames: 2, w: 38, h: 38, speed: 6 },
    hit:       { src: "gold-hit.png", frames: 2, w: 38, h: 38, speed: 8 },
    dizzy:     { src: "gold-dizzy.png", frames: 3, w: 38, h: 38, speed: 8 },
    dash:      { src: "gold-dash.png", frames: 2, w: 50, h: 50, speed: 3 },
    defeat:    { src: "gold-defeat.png", frames: 1, w: 38, h: 38, speed: 10 },
    victory:   { src: "gold-victory.png", frames: 6, w: 38, h: 38, speed: 6 }
  },
  chicken: {
    idle:      { src: "chicken-idle.png", frames: 5, w: 50, h: 50, speed: 13 },
    walk:      { src: "chicken-walk.png", frames: 7, w: 50, h: 50, speed: 4 },
    jump:      { src: "chicken-jump.png", frames: 4, w: 50, h: 50, speed: 6 },
    fall:      { src: "chicken-fall.png", frames: 3, w: 50, h: 50, speed: 15 },
    attack:    { src: "chicken-attack.png", frames: 3, w: 38, h: 38, speed: 2 },
    attack_air:{ src: "chicken-attack-air.png", frames: 2, w: 38, h: 38, speed: 2 },
    block:     { src: "chicken-block.png", frames: 2, w: 50, h: 50, speed: 11 },
    hit:       { src: "chicken-hit.png", frames: 3, w: 50, h: 50, speed: 8 },
    dizzy:     { src: "chicken-dizzy.png", frames: 3, w: 38, h: 38, speed: 8 },
    dash:      { src: "chicken-dash.png", frames: 3, w: 50, h: 50, speed: 4 },
    defeat:    { src: "chicken-defeat.png", frames: 1, w: 38, h: 38, speed: 10 },
    victory:   { src: "chicken-victory.png", frames: 6, w: 38, h: 38, speed: 6 }
  }
};

const spritesheetCache = {};
for (const charId in characterSprites) {
  for (const state in characterSprites[charId]) {
    const anim = characterSprites[charId][state];
    if (!spritesheetCache[anim.src]) {
      const img = new Image();
      img.src = anim.src;
      spritesheetCache[anim.src] = img;
    }
  }
}

// --- Player State Initialization (P1: gold, P2: chicken) ---
const players = [
  {
    x: WIDTH/3, y: GROUND-PLAYER_SIZE, vx: 0, vy: 0, w: PLAYER_SIZE, h: PLAYER_SIZE,
    color: "#42a5f5", facing: 1, hp: PLAYER_HP, jumps: 0, dash: 0,
    dashCooldown: 0, canAttack: true, attackTimer: 0, attackBox: null, onGround: false,
    downDropTimer: 0, jumpHeld: false, alive: true, id: 0, name: "P1",
    charId: "gold", animState: "idle", animFrame: 0, animTimer: 0, justHit: 0,
    block: BLOCK_MAX, blocking: false, dizzy: 0, blockGlowTimer: 0, blockWasFull: false
  },
  {
    x: 2*WIDTH/3, y: GROUND-PLAYER_SIZE, vx: 0, vy: 0, w: PLAYER_SIZE, h: PLAYER_SIZE,
    color: "#ef5350", facing: -1, hp: PLAYER_HP, jumps: 0, dash: 0,
    dashCooldown: 0, canAttack: true, attackTimer: 0, attackBox: null, onGround: false,
    downDropTimer: 0, jumpHeld: false, alive: true, id: 1, name: "P2",
    charId: "chicken", animState: "idle", animFrame: 0, animTimer: 0, justHit: 0,
    block: BLOCK_MAX, blocking: false, dizzy: 0, blockGlowTimer: 0, blockWasFull: false
  }
];
let winner = null;

// --- Main Draw Function ---
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function draw() {
  const camera = getCamera();
  ctx.save();
  ctx.clearRect(0,0,WIDTH,HEIGHT);
  ctx.translate(WIDTH/2, HEIGHT/2);
  ctx.scale(camera.zoom, camera.zoom);
  ctx.translate(-camera.cx, -camera.cy);

  // Draw background
  if (bgImg.complete && bgImg.naturalWidth > 0) {
    ctx.drawImage(bgImg, 0, 0, WIDTH, HEIGHT);
  } else {
    ctx.fillStyle = "#181c24";
    ctx.fillRect(0,0,WIDTH,HEIGHT);
  }

  // Draw platforms
  for(let p of platforms) {
    ctx.fillStyle = PLATFORM_COLOR;
    ctx.fillRect(p.x, p.y, p.w, PLATFORM_HEIGHT);
    ctx.strokeStyle = PLATFORM_EDGE;
    ctx.lineWidth = 3;
    ctx.strokeRect(p.x, p.y, p.w, PLATFORM_HEIGHT);
  }
  ctx.fillStyle = "#6d4c41";
  ctx.fillRect(0, FLOOR_HEIGHT, WIDTH, HEIGHT-FLOOR_HEIGHT);

  // Draw particles under players
  drawParticles(ctx);

  // Draw players
  for(let i=0; i<players.length; i++) {
    let p = players[i];
    if(!p.alive && getAnimForPlayer(p) && p.animState !== "defeat") continue;

    // Draw arrow above player
    ctx.save();
    ctx.beginPath();
    let arrowCenterX = p.x + p.w/2;
    let arrowTipY = p.y - 12;
    let arrowHeight = 12, arrowWidth = 20;
    ctx.moveTo(arrowCenterX, arrowTipY);
    ctx.lineTo(arrowCenterX - arrowWidth/2, arrowTipY - arrowHeight);
    ctx.lineTo(arrowCenterX + arrowWidth/2, arrowTipY - arrowHeight);
    ctx.closePath();
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = i === 0 ? "#42a5f5" : "#ef5350";
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2.5;
    ctx.fill();
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.restore();

    // Draw shadow
    ctx.globalAlpha = 0.18;
    ctx.beginPath();
    ctx.ellipse(p.x+p.w/2, p.y+p.h-4, p.w/2.5, 7, 0, 0, 2*Math.PI);
    ctx.fillStyle = "#000";
    ctx.fill();
    ctx.globalAlpha = 1;

    // Draw block effect if blocking
    if (p.blocking && p.block > 0) {
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = "#b0bec5";
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.roundRect(p.x-4, p.y-4, p.w+8, p.h+8, 18);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.restore();
    }
    // Draw dizzy effect
    if (p.dizzy > 0) {
      ctx.save();
      ctx.globalAlpha = 0.5 + 0.3*Math.sin(performance.now()/120);
      ctx.strokeStyle = "#ffd740";
      ctx.lineWidth = 4+2*Math.sin(performance.now()/60);
      ctx.beginPath();
      ctx.arc(p.x+p.w/2, p.y-14, 19+3*Math.sin(performance.now()/120), 0, 2*Math.PI);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    // Draw player sprite or fallback box
    let anim = getAnimForPlayer(p);
    let spritesheet = anim && spritesheetCache[anim.src];
    if (anim && spritesheet && spritesheet.complete && spritesheet.naturalWidth > 0) {
      ctx.save();
      if (p.facing === 1) {
        ctx.translate(p.x + p.w/2, p.y + p.h/2);
        ctx.scale(-1, 1);
        ctx.translate(-anim.w/2, -anim.h/2);
        ctx.drawImage(
          spritesheet,
          anim.w * p.animFrame, 0, anim.w, anim.h,
          0, 0, anim.w, anim.h
        );
      } else {
        ctx.drawImage(
          spritesheet,
          anim.w * p.animFrame, 0, anim.w, anim.h,
          p.x, p.y, anim.w, anim.h
        );
      }
      ctx.restore();
    } else {
      ctx.fillStyle = p.color;
      ctx.strokeStyle = PLAYER_OUTLINE;
      ctx.lineWidth = 3;
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.strokeRect(p.x, p.y, p.w, p.h);
    }

    // Draw hit effect
    if (p.justHit > 0) {
      ctx.save();
      ctx.globalAlpha = 0.2 + 0.2 * Math.sin(performance.now()/30);
      ctx.fillStyle = "#fff";
      ctx.fillRect(p.x-3, p.y-3, p.w+6, p.h+6);
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    // Draw player name
    if (p.name) {
      ctx.save();
      ctx.font = "bold 22px Arial";
      ctx.textAlign = "center";
      ctx.strokeStyle = "#23243a";
      ctx.lineWidth = 4;
      ctx.strokeText(p.name, p.x + p.w/2, p.y - 28);
      ctx.fillStyle = p.color;
      ctx.fillText(p.name, p.x + p.w/2, p.y - 28);
      ctx.restore();
    }

    // --- Draw Block Bar Below Player (Simple Grey, Glow When Full) ---
    const barWidth = p.w;
    const barHeight = 10;
    const barX = p.x;
    const barY = p.y + p.h + 8;
    const blockRatio = Math.max(0, p.block) / BLOCK_MAX;

    // Draw background
    ctx.save();
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = "#222"; // dark grey background
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // Draw simple grey fill
    ctx.globalAlpha = 0.95;
    ctx.fillStyle = "#bbb";
    ctx.fillRect(barX, barY, barWidth * blockRatio, barHeight);

   // Draw custom border image if loaded
if (blockBarBorderImg.complete && blockBarBorderImg.naturalWidth > 0) {
  ctx.globalAlpha = 1;
  ctx.drawImage(blockBarBorderImg, barX-2, barY-2, barWidth+4, barHeight+4);
} else {
  // fallback: simple outline
  ctx.globalAlpha = 1;
  ctx.strokeStyle = "#bbb";
  ctx.lineWidth = 2.5;
  ctx.strokeRect(barX, barY, barWidth, barHeight);
}

    // Glow animation ONLY if block is full and glow timer is active
    if (p.block >= BLOCK_MAX && p.blockGlowTimer > 0) {
      ctx.save();
      ctx.globalAlpha = 0.45 + 0.25 * Math.sin(performance.now()/180);
      ctx.shadowColor = "#fff";
      ctx.shadowBlur = 16 + 8 * Math.abs(Math.sin(performance.now()/180));
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 4;
      ctx.strokeRect(barX-2, barY-2, barWidth+4, barHeight+4);
      ctx.restore();
    }

    // Draw "Block" label
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "#bbb";
    ctx.globalAlpha = 0.84;
    ctx.fillText("Block", barX + barWidth/2, barY + barHeight + 12);
    ctx.globalAlpha = 1;
    ctx.restore();
  }
  ctx.restore();

  // Draw winner text
  if(winner !== null) {
    ctx.font = "44px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffeb3b";
    ctx.fillText(`${players[winner].name || `Player ${winner+1}`} Wins!`, WIDTH/2, HEIGHT/2);
  }
}

// --- Main Game Loop ---
function gameLoop() {
  for (let i = 0; i < players.length; ++i) {
    const p = players[i];
    if (p.justHit > 0) p.justHit--;
    updatePlayer(p, i);
    updatePlayerAnimState(p, i);
    updateAnimation(p);

    // Update block glow timer
    if (p.block >= BLOCK_MAX - 0.1 && !p.blockWasFull) {
      p.blockGlowTimer = 30; // glow for 30 frames (~0.5s at 60fps)
    }
    p.blockWasFull = p.block >= BLOCK_MAX - 0.1;
    if (p.blockGlowTimer > 0) p.blockGlowTimer--;
  }
  handleDashAttack();
  updateUI();
  updateParticles();
  draw();
  requestAnimationFrame(gameLoop);
}
gameLoop();