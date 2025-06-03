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


