// Block function 
function updateBlocking(p, pid) {
  const controls = pid === 0 ? {down: 's'} : {down: 'l'};
  if (p._wasBlocking === undefined) p._wasBlocking = false;
  
  if (p.onGround && !p.dizzy && !p.inHitstun && keys[controls.down]) {
    if (!p._wasBlocking && p.block < p.maxBlock) {
      p.blocking = false;
      p.blockAnimationFinished = false;
    } else if (p.block > 0) {
      if (!p.blocking) {
        p.blocking = true;
        p.blockStartTime = performance.now();
        p.blockAnimationFinished = false;
      }
      p.block -= BLOCK_DEPLETION;
      if (p.block < 0) p.block = 0;
    } else {
      p.blocking = false;
      p.blockAnimationFinished = false;
    }
  } else {
    p.blocking = false;
    p.blockAnimationFinished = false;
  }
  
if (!p.blocking && p.block < p.maxBlock) {
    p.block += BLOCK_RECOVERY;
   if (p.block > p.maxBlock) p.block = p.maxBlock;
  }
  p._wasBlocking = p.blocking;

  if (p.dizzy > 0) {
    p.dizzy--;
    p.vx *= FRICTION;
    if (Math.abs(p.vx) < 0.3) p.vx = 0;
    return true;
  }
  return false;
}

const VERGIL_JUDGMENT_CUT_PHASES = {
    PREPARING: 'preparing',
    SLASHING: 'slashing',
    LINES: 'lines',
    SLIDE: 'slide',
    FALL: 'fall',
    SHEATHING: 'sheathing'
};

const JUDGMENT_CUT_CHARGE = {
    MIN_CHARGE_TIME: 1000,
    MAX_CHARGE_TIME: 3000,
};


const WIDTH = 900, HEIGHT = 600;
const GRAVITY = 0.6, FRICTION = 0.7, GROUND = HEIGHT - 60;
const PLATFORM_HEIGHT = 20, PLAYER_SIZE = 50, PLAYER_SPEED = 5;
const DASH_SPEED = 13, DASH_WINDOW = 250, JUMP_VEL = 15, MAX_JUMPS = 2;
const PLAYER_HP = 120, PLATFORM_COLOR = "#ffd54f", PLATFORM_EDGE = "#ffb300";
const PLAYER_OUTLINE = "#fff", FLOOR_HEIGHT = HEIGHT-30;
const DASH_COOLDOWN = 36, DASH_FRAMES = 8, DASH_DAMAGE = 10;
const JUDGMENT_CUT_TRIGGER_RANGE = 150; 
const VERGIL_WEAPONS = {
    YAMATO: 'yamato',
    BEOWULF: 'beowulf',
    MIRAGE_BLADE: 'mirage_blade'
};
const MIRAGE_BLADE_CONFIG = {//mirage slash
    WIDTH: 100,      
    HEIGHT: 85,      
    DURATION: 180,    
    ALPHA_START: 0.9,  
    ALPHA_END: 0.1,    
    SCALE_START: 1.0,
    SCALE_END: 1.0     
};
const DANTY_WEAPONS = {
    DEVIL_SWORD: 'devil_sword',
    BALROG: 'balrog',
    SPECTRAL_SWORD: 'spectral_sword'
};
const DEVIL_SWORD_GAUGE = {
  MAX: 100,
  BLOCK_GAIN: 20,
  HIT_GAIN: 10,
  ACTIVATION_HOLD_TIME: 1000,
  UPGRADE_DURATION: 600,
  PASSIVE_REGEN: 0.05
};
const SIN_DEVIL_TRIGGER = {
  GAUGE_MAX: 100,
  CHARGE_RATE: 0.8,
  ACTIVATION_HOLD_TIME: 2000,
  SWORD_FALL_DURATION: 90,
  EXPLOSION_DURATION: 30,
  PIERCE_OFFSET_Y: -200,
  SWORD_FALL_SPEED: 4,
  SDT_DURATION: 900,
  // SDT Power Boosts
  DAMAGE_MULTIPLIER: 2.0, // Double damage
  SPEED_MULTIPLIER: 1.5,  // 50% faster movement
  DASH_SPEED_MULTIPLIER: 1.8, // 80% faster dash
  FLOAT_HEIGHT: 10, // How much above ground SDT floats
  GRAVITY_REDUCTION: 0.8, // Only slight gravity reduction (was 0.3 - too low!)
  JUMP_MULTIPLIER: 1.0 // Normal jump height in SDT
};
const SPECTRAL_SWORD = {
  SPAWN_DISTANCE: 100, // How far from Danty it spawns
  MOVE_SPEED: 7, // How fast it moves
  DASH_SPEED: 15, // How fast it dashes
  DASH_FRAMES: 8, // How long dash lasts
  DASH_COOLDOWN: 36, // Dash cooldown frames
  DASH_DAMAGE: 15, // Damage when dashing
  FLOAT_SPEED: 2, // How fast it naturally floats up/down
  SIZE: 40, // Width and height
  GAUGE_DRAIN: 0.3, // How much Devil Trigger gauge it drains per frame
  MIN_GAUGE_TO_SPAWN: 20, // Minimum gauge needed to spawn
  CONTROL_TRANSFER_FRAMES: 30 // Frames to transfer control
};
const DEVIL_SWORD_PROGRESSION = {
  HIT_COMBO_RESET_TIME: 3000,
  // Normal Devil Sword sprites
  PHASE_1_SPRITE: "danty-devilsword-strike1.png",
  PHASE_2_SPRITE: "danty-devilsword-strike2.png", 
  PHASE_3_SPRITE: "danty-devilsword-strike3.png",
  // Sin Devil Sword sprites 
  ENHANCED_PHASE_1_SPRITE: "danty-devilsword-enhanced-strike1.png",
  ENHANCED_PHASE_2_SPRITE: "danty-devilsword-enhanced-strike2.png",
  ENHANCED_PHASE_3_SPRITE: "danty-devilsword-enhanced-strike3.png",
  SPRITE_WIDTH: 120,
  SPRITE_HEIGHT: 80,
  ENHANCED_SPRITE_WIDTH: 140, // Bigger for enhanced mode
  ENHANCED_SPRITE_HEIGHT: 90,
  SPRITE_DURATION: 20,
  ENHANCED_SPRITE_DURATION: 25, // Longer for enhanced mode
  SPRITE_OFFSET_X: 60,
  SPRITE_OFFSET_Y: -10
};
const SLOW_FALL_MULTIPLIER = 0.16, BLOCK_MAX = 100;
const BLOCK_DEPLETION = 1.8, BLOCK_RECOVERY = 0.8, DIZZY_FRAMES = 300;
const UNIVERSAL_DASH_KNOCKBACK_X = 50;
const UNIVERSAL_DASH_KNOCKBACK_Y = -6;
const BOUNCE_FRICTION = 0.85;
const HITSTUN_FRAMES = 20, HEAVY_HITSTUN_FRAMES = 200;
const DIZZY_KNOCKBACK_X = 16, DIZZY_KNOCKBACK_Y = -9;
const BLOCK_PUSHBACK_X = 9, BLOCK_PUSHBACK_Y = -4;
const BEOWULF_DIVE_RECOVERY_TIME = 90; // 1.5 seconds at 60fps

const JUDGEMENT_CUT_CONSTANTS = {
    SLIDE_DURATION: 4800,
    SLIDE_SPEED: 0.0001,
    FALL_INITIAL_VY: -8,
    FALL_VX_RANGE: 4,
    LINE_DISPLAY_DURATION: 600,
    FIRST_THREE_INTERVAL: 30, // Faster line appearance! ⚡
    REMAINING_LINES_DELAY: 100  // Shorter delay! ⚡
};

let gameState = { paused: false, pauseReason: null, pauseStartTime: 0 };

let cameraZoomEffect = {
    active: false, startZoom: 1, targetZoom: 1.6, currentZoom: 1,
    phase: 'idle', startTime: 0,
    duration: { zoomIn: 3000, hold: 3630, zoomOut: 450 }
};

const impactEffects = [];

const characterImpactEffects = {
  vergil: {
    dash: { sprite: "vergil-slash-impact.png", frames: 1, w: 100, h: 100, speed: 3, duration: 18, offset: { x: -15, y: -40 } },
    'beowulf-dash': { sprite: "vergil-beowulf-punch-impact.png", frames: 3, w: 80, h: 80, speed: 2, duration: 15, offset: { x: -10, y: -20 } }
  },
  gold: {
    dash: { sprite: "gold-punch-impact.png", frames: 4, w: 60, h: 60, speed: 2, duration: 12, offset: { x: -10, y: -10 } }
  },
  chicken: {
    dash: { sprite: "chicken-peck-impact.png", frames: 5, w: 50, h: 50, speed: 2, duration: 15, offset: { x: -5, y: -10 } }
  },
danty: {
  dash: { sprite: "danty-slash-impact.png", frames: 1, w: 100, h: 100, speed: 3, duration: 18, offset: { x: -15, y: -40 } },
  'balrog-dash': { sprite: "danty-balrog-punch-impact.png", frames: 3, w: 80, h: 80, speed: 2, duration: 15, offset: { x: -10, y: -20 } },
  // Normal Devil Sword sprites
  'devilsword-strike1': { sprite: "danty-devilsword-strike1.png", frames: 1, w: 90, h: 90, speed: 3, duration: 500, offset: { x: 50, y: 10 } },//right offset
  'devilsword-strike2': { sprite: "danty-devilsword-strike2.png", frames: 1, w: 120, h: 80, speed: 3, duration: 20, offset: { x: 60, y: -10 } },
  'devilsword-strike3': { sprite: "danty-devilsword-strike3.png", frames: 1, w: 120, h: 80, speed: 3, duration: 20, offset: { x: 60, y: -10 } },
  // Sin devil sword sprties
  'devilsword-enhanced-strike1': { sprite: "danty-devilsword-enhanced-strike1.png", frames: 1, w: 140, h: 90, speed: 3, duration: 25, offset: { x: 70, y: -15 } },
  'devilsword-enhanced-strike2': { sprite: "danty-devilsword-enhanced-strike2.png", frames: 1, w: 140, h: 90, speed: 3, duration: 25, offset: { x: 70, y: -15 } },
  'devilsword-enhanced-strike3': { sprite: "danty-devilsword-enhanced-strike3.png", frames: 1, w: 140, h: 90, speed: 3, duration: 25, offset: { x: 70, y: -15 } },
    // SDT IMPACT EFFECTS 💀🔥
  'sdt-dash': { sprite: "danty-sdt-dash-impact.png", frames: 1, w: 120, h: 100, speed: 2, duration: 30, offset: { x: -20, y: -50 } },
  'sdt-uppercut': { sprite: "danty-sdt-uppercut-impact.png", frames: 2, w: 100, h: 120, speed: 2, duration: 25, offset: { x: -15, y: -60 } },
  'sdt-divekick': { sprite: "danty-sdt-divekick-impact.png", frames: 3, w: 130, h: 90, speed: 2, duration: 35, offset: { x: -25, y: -30 } },
    // Spectral Sword impact effects
  'spectral-sword-dash': { sprite: "danty-spectral-sword-impact.png", frames: 2, w: 80, h: 80, speed: 3, duration: 20, offset: { x: -15, y: -15 } }
},
};

const impactSpritesheetCache = {};
for (const charId in characterImpactEffects) {
  for (const attackType in characterImpactEffects[charId]) {
    const effect = characterImpactEffects[charId][attackType];
    if (!impactSpritesheetCache[effect.sprite]) {
      const img = new Image();
      img.src = effect.sprite;
      impactSpritesheetCache[effect.sprite] = img;
    }
  }
}

function createImpactEffect(attacker, target, attackType = 'dash') {
  const effectData = characterImpactEffects[attacker.charId]?.[attackType];
  if (!effectData) return;
  
  let impactX, impactY;
  
  // Special positioning for Devil Sword strikes
  if (attackType === 'devilsword-strike1' || attackType === 'devilsword-strike2') {
    // Position Devil Sword sprite in front of Danty based on his facing direction
    if (attacker.facing === 1) {
      // Facing right
      impactX = attacker.x + attacker.w + effectData.offset.x;
    } else {
      // Facing left
      impactX = attacker.x - effectData.w - effectData.offset.x;
    }
    impactY = attacker.y + attacker.h/2 - effectData.h/2 + effectData.offset.y;
  } else {
    // Normal impact positioning
    impactX = attacker.x < target.x 
      ? target.x + effectData.offset.x
      : target.x + target.w - effectData.w + effectData.offset.x;
    impactY = target.y + target.h/2 - effectData.h/2 + effectData.offset.y;
  }
  
  impactEffects.push({
    sprite: effectData.sprite,
    frames: effectData.frames,
    w: effectData.w,
    h: effectData.h,
    speed: effectData.speed,
    x: impactX,
    y: impactY,
    currentFrame: 0,
    frameTimer: 0,
    life: effectData.duration,
    attackerColor: attacker.color,
    scale: 1.0,
    alpha: 1.0,
    facingDirection: attacker.facing || 1
  });
}

function createSpectralSword(owner) {
  // Check if owner has enough gauge
  if (owner.devilSwordGauge < SPECTRAL_SWORD.MIN_GAUGE_TO_SPAWN) {
    console.log(`${owner.name} needs at least ${SPECTRAL_SWORD.MIN_GAUGE_TO_SPAWN}% Devil Trigger gauge to summon Spectral Sword! 🚫⚔️`);
    return null;
  }
  
  // Calculate spawn position (in front of owner)
  const spawnX = owner.facing === 1 ? 
    owner.x + owner.w + SPECTRAL_SWORD.SPAWN_DISTANCE : 
    owner.x - SPECTRAL_SWORD.SPAWN_DISTANCE - SPECTRAL_SWORD.SIZE;
  const spawnY = owner.y + (owner.h / 2) - (SPECTRAL_SWORD.SIZE / 2);
  
  const spectralSword = {
    x: spawnX,
    y: spawnY,
    w: SPECTRAL_SWORD.SIZE,
    h: SPECTRAL_SWORD.SIZE,
    vx: 0,
    vy: 0,
    facing: owner.facing,
    owner: owner,
    alive: true,
    
    // Movement properties
    dash: 0,
    dashCooldown: 0,
    hasDashHit: false,
    
    // Animation properties
    animState: "idle",
    animFrame: 0,
    animTimer: 0,
    
    // Floating effect
    floatTimer: 0,
    baseY: spawnY,
    
    // Gauge drain
    gaugeDrainTimer: 0
  };
  
  console.log(`${owner.name} summons SPECTRAL SWORD! Control transferred! ⚔️👻🔥`);
  return spectralSword;
}

function destroySpectralSword(owner) {
  if (owner.spectralSword) {
    owner.spectralSword = null;
    owner.spectralSwordControlling = false;
    owner.spectralSwordTransferring = false;
    owner.spectralSwordTransferTimer = 0;
    console.log(`${owner.name}'s Spectral Sword vanished! Camera returns to ${owner.name}! 👻💨📹`);
  }
}

function playParrySound() {
  try {
    // Reset the audio to play from beginning if already playing
    parrySound.currentTime = 0;
    parrySound.play().catch(error => {
      // Handle autoplay policy - modern browsers require user interaction first
      console.log("Audio autoplay blocked - user interaction required first");
    });
  } catch (error) {
    console.log("Parry sound failed to play:", error);
  }
}

function playJudgmentCutSound() {
  try {
    // Reset the audio to play from beginning if already playing
    judgmentCutSound.currentTime = 0;
    judgmentCutSound.play().catch(error => {
      // Handle autoplay policy - modern browsers require user interaction first
      console.log("I AM THE STORM THAT IS APPROACHING audio blocked - user interaction required first");
    });
    
    // Add event listener for when the sound ends (optional backup)
    judgmentCutSound.onended = function() {
      // Resume background music when Vergil's epic sound ends
      if (defaultFightMusic && defaultFightMusic.paused) {
        defaultFightMusic.play().catch(error => {
          console.log("Music resume after sound ended failed");
        });
        console.log("🎵 Background music resumed after Vergil's epic sound ended! 🎭⚔️");
      }
    };
    
    console.log("🌩️ I AM THE STORM THAT IS APPROACHING! ⚡⚔️🎵 (Background music SILENCED!)");
  } catch (error) {
    console.log("Judgment Cut sound failed to play:", error);
  }
}

let audioInitialized = false;

function initializeAudio() {
  if (!audioInitialized) {
    // Preload audio
    parrySound.load();
    
    // Preload default music
    defaultFightMusic.load();
    
    // Preload VERGIL'S LEGENDARY SOUND! ⚡⚔️
    judgmentCutSound.load();
    
    audioInitialized = true;
    musicInitialized = true;
    console.log("🔊 AUDIO SYSTEM initialized! I AM THE STORM THAT IS APPROACHING! 🎵🔥⚡");
    
    // Start default battle music
    startDefaultMusic();
  }
}

function startDefaultMusic() {
  defaultFightMusic.volume = 0.5;
  defaultFightMusic.currentTime = 0;
  defaultFightMusic.play().catch(error => {
    console.log("Music autoplay blocked - user interaction required first");
  });
  
  console.log("🎵 Default battle music started! Let's fight! ⚔️🔥");
}

// Simple function - no dynamic music changes, just keep it playing
function updateDynamicMusic() {
  // Make sure default music is still playing
  if (musicInitialized && defaultFightMusic.paused) {
    defaultFightMusic.play().catch(error => {
      console.log("Music playback failed");
    });
  }
  
  // That's it! Just keep the epic battle music going! 🎵⚔️
}
function updateImpactEffects() {
  for (let i = impactEffects.length - 1; i >= 0; i--) {
    const effect = impactEffects[i];
    
    effect.frameTimer++;
    if (effect.frameTimer >= effect.speed) {
      effect.frameTimer = 0;
      effect.currentFrame++;
      if (effect.currentFrame >= effect.frames) {
        effect.currentFrame = effect.frames - 1;
      }
    }
    
    effect.life--;
    
    if (effect.life > effect.frames * effect.speed) {
      effect.scale = Math.min(1.2, effect.scale + 0.1);
    } else {
      effect.alpha = effect.life / (effect.frames * effect.speed);
      effect.scale = Math.max(0.8, effect.scale - 0.02);
    }
    
    if (effect.life <= 0) {
      impactEffects.splice(i, 1);
    }
  }
}

function drawImpactEffects(ctx) {
  for (const effect of impactEffects) {
    const spritesheet = impactSpritesheetCache[effect.sprite];
    
    ctx.save();
    ctx.globalAlpha = effect.alpha;
    
    if (spritesheet && spritesheet.complete && spritesheet.naturalWidth > 0) {
      ctx.translate(effect.x + effect.w/2, effect.y + effect.h/2);
      ctx.scale(effect.scale * effect.facingDirection, effect.scale);
      ctx.translate(-effect.w/2, -effect.h/2);
      ctx.drawImage(spritesheet, effect.w * effect.currentFrame, 0, effect.w, effect.h, 0, 0, effect.w, effect.h);
    } else {
      // Fallback effect
      ctx.globalAlpha = effect.alpha * 0.7;
      ctx.fillStyle = effect.attackerColor;
      ctx.beginPath();
      ctx.arc(effect.x + effect.w/2, effect.y + effect.h/2, 20 * effect.scale, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 3;
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI/2);
        const length = 15 * effect.scale;
        const startX = effect.x + effect.w/2;
        const startY = effect.y + effect.h/2;
        
        const directionOffset = effect.facingDirection * 10;
        const endX = startX + Math.cos(angle) * length + directionOffset;
        const endY = startY + Math.sin(angle) * length;
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }
    }
    
    ctx.restore();
  }
}

function executeUppercut(player, chargeTime, weaponType = 'beowulf') {
  const chargingProp = weaponType === 'beowulf' ? 'beowulfCharging' : 'balrogCharging';
  const chargeTypeProp = weaponType === 'beowulf' ? 'beowulfChargeType' : 'balrogChargeType';
  
  player[chargingProp] = false;
  player[chargeTypeProp] = null;
  
  const maxChargeTime = 800;
  const chargeRatio = Math.min(chargeTime / maxChargeTime, 1.0);
  
  const minHeight = 10;
  const maxHeight = 18;
  const uppercutHeight = minHeight + (chargeRatio * (maxHeight - minHeight));
  
  player.vy = -uppercutHeight;
  player.vx = 0;
  player.dash = DASH_FRAMES;
  player.dashCooldown = DASH_COOLDOWN;
  
  player.isUppercutting = true;
  player.uppercutPower = chargeRatio;
  player.animState = `${weaponType}-uppercut`;
  player.animFrame = 0;
  player.animTimer = 0;
  
  const weaponName = weaponType === 'beowulf' ? 'Beowulf' : weaponType === 'sdt' ? 'SDT Balrog' : 'Balrog';
  const emoji = weaponType === 'sdt' ? '💀👊⬆️🔥' : '👊⬆️💥';
  console.log(`${player.name} unleashes ${weaponName} Rising Uppercut! Power: ${(chargeRatio * 100).toFixed(0)}% ${emoji}`);
}

function executeBeowulfUppercut(player, chargeTime) {
  executeUppercut(player, chargeTime, 'beowulf');
}

function executeBalrogUppercut(player, chargeTime) {
  const weaponType = (player.charId === 'danty' && player.sdtActive) ? 'sdt' : 'balrog';
  executeUppercut(player, chargeTime, weaponType);
}

function handleDiveKick(player, weaponType = 'beowulf') {
  // Define the property names based on weaponType
  const diveKickProp = weaponType === 'beowulf' ? 'beowulfDiveKick' : 'balrogDiveKick';
  const recoveryProp = weaponType === 'beowulf' ? 'beowulfRecovering' : 'balrogRecovering';
  const recoveryTimerProp = weaponType === 'beowulf' ? 'beowulfRecoveryTimer' : 'balrogRecoveryTimer';
  const impactRadiusProp = weaponType === 'beowulf' ? 'beowulfImpactRadius' : 'balrogImpactRadius';
  
  if (player.onGround && player[diveKickProp]) {  // Use dynamically selected property
    player[diveKickProp] = false;                 // Use dynamically selected property
    player.isDiveKicking = false;
    
       // Add recovery state - player is vulnerable for a moment
    player[recoveryProp] = true;                  // Use dynamically selected property
    player[recoveryTimerProp] = BEOWULF_DIVE_RECOVERY_TIME; // Use dynamically selected property
    
    // Choose correct recovery animation
    if (weaponType === 'sdt') {
      player.animState = "sdt-idle"; // SDT doesn't have recovery animation, just go to idle
    } else {
      player.animState = weaponType + "-recovery";
    }
    player.animFrame = 0;
    player.animTimer = 0;
    
    // Prevent movement during recovery
    player.vx = 0;
    player.vy = 0;
    
    const kickName = weaponType === 'sdt' ? 'SDT dive kick' : weaponType + ' dive kick';
    const emoji = weaponType === 'sdt' ? '💀🦆' : '🦆';
    console.log(`${player.name} is recovering from ${kickName} - vulnerable for 1.5 seconds! ${emoji}`);
    
    // Create explosion effect at impact point
    const impactX = player.x + player.w/2;
    const impactY = player.y + player.h;
    
    // Damage and knockup enemies in radius
    for (let i = 0; i < players.length; i++) {
      const opponent = players[i];
      if (opponent !== player && opponent.alive) {
        const dx = (opponent.x + opponent.w/2) - impactX;
        const dy = (opponent.y + opponent.h/2) - impactY;
        const distance = Math.sqrt(dx*dx + dy*dy);
        
        if (distance <= player[impactRadiusProp]) {  // Use dynamically selected property
          if (opponent.justHit === 0) {
            let isBlocking = false;
            if (opponent.blocking && opponent.block > 0 && !opponent.inHitstun) {
              isBlocking = true;
            }

            if (isBlocking) {
              // Impact logic for blocking...
              createImpactEffect(player, opponent, 'block');
              console.log(`${opponent.name} blocked ${player.name}'s ${weaponType} dive kick explosion! 🛡️💥`);
            } else {
              // Impact logic for hit...
              createImpactEffect(player, opponent, weaponType + '-dash');
              console.log(`${player.name}'s ${weaponType} Diagonal Dive Kick explosion hits ${opponent.name}! 💥⬆️`);
              
              // If we hit someone, reduce recovery time as reward
              player[recoveryTimerProp] = Math.floor(BEOWULF_DIVE_RECOVERY_TIME * 0.6);
              console.log(`${player.name} hit the target! Recovery time reduced! 🎯`);
            }
          }
        }
      }
    }
    
    // Create explosion particles
    for (let i = 0; i < 12; i++) {
      particles.push({
        type: "explosion",
        x: impactX + (Math.random() - 0.5) * player[impactRadiusProp], // Use dynamic property
        y: impactY + (Math.random() - 0.5) * 30,
        life: 25,
        vx: (Math.random() - 0.5) * 8,
        vy: Math.random() * -5 - 2
      });
    }
  }
}

function handleBeowulfDiveKick(player) {
  handleDiveKick(player, 'beowulf');
}

function handleBalrogDiveKick(player) {
  const kickType = (player.charId === 'danty' && player.sdtActive) ? 'sdt' : 'balrog';
  handleDiveKick(player, kickType);
}

function handleBeowulfUppercutHit(attacker, opponent) {
  if (attacker.isUppercutting && opponent.justHit === 0) {
    // CHECK FOR BLOCKING FIRST
    let isBlocking = false;
if (opponent.blocking && opponent.block > 0 && !opponent.inHitstun) {
  if (opponent.charId === 'danty' || opponent.facing === -Math.sign(attacker.vx || attacker.facing)) {
    isBlocking = true;
  }
}
    
    if (isBlocking) {
      // Uppercut blocked - attacker gets stunned
      attacker.hitstun = HEAVY_HITSTUN_FRAMES; // Changed from HITSTUN_FRAMES
      attacker.inHitstun = true;
      attacker.vx = opponent.facing * BLOCK_PUSHBACK_X;
      attacker.vy = BLOCK_PUSHBACK_Y;
      attacker.isUppercutting = false;
      attacker.uppercutPower = 0;
      createImpactEffect(attacker, opponent, 'block');
      console.log(`${opponent.name} blocked ${attacker.name}'s Rising Uppercut! 🛡️👊`);
      return true;
    }
    
let baseDamage = 12 + (attacker.uppercutPower * 8);
let damage = baseDamage;
if (attacker.charId === 'danty' && attacker.devilSwordUpgraded) {
  damage = Math.floor(baseDamage * 1.5);
  console.log(`${attacker.name}'s upgraded Balrog deals extra damage! ${damage} instead of ${baseDamage} 😈👊`);
}
    opponent.hp -= damage;
    opponent.justHit = 20;
    
    // Set special uppercut hitstun that lasts until landing
    opponent.hitstun = 999999; // Very high number so it doesn't run out
    opponent.inHitstun = true;
    opponent.airHitstun = true; // This marks it as uppercut hitstun that only ends on landing
    
    console.log(`${opponent.name} was launched by uppercut and will remain stunned until landing!`);
    
    // Give opponent the SAME upward velocity as attacker
    opponent.vy = attacker.vy; // Exact same upward speed
    opponent.vx = attacker.facing * (6 + attacker.uppercutPower * 4); // Slight horizontal push
    
    createImpactEffect(attacker, opponent, 'beowulf-dash');
    
    if (opponent.hp <= 0) {
      opponent.hp = 0;
      opponent.alive = false;
      winner = attacker.id;
    }
    
    // End uppercut state
    attacker.isUppercutting = false;
    attacker.uppercutPower = 0;
    
    console.log(`${attacker.name}'s Rising Uppercut launches ${opponent.name} skyward! 👊⬆️💫`);
    return true;
  }
  return false;
}

function handleBalrogUppercutHit(attacker, opponent) {
  if (attacker.isUppercutting && opponent.justHit === 0) {
    // CHECK FOR BLOCKING FIRST
    let isBlocking = false;
    if (opponent.blocking && opponent.block > 0 && !opponent.inHitstun) {
      if (opponent.charId === 'danty' || opponent.facing === -Math.sign(attacker.vx || attacker.facing)) {
        isBlocking = true;
      }
    }
    
    if (isBlocking) {
      // Uppercut blocked - attacker gets stunned
      attacker.hitstun = HEAVY_HITSTUN_FRAMES;
      attacker.inHitstun = true;
      attacker.vx = opponent.facing * BLOCK_PUSHBACK_X;
      attacker.vy = BLOCK_PUSHBACK_Y;
           attacker.isUppercutting = false;
      attacker.uppercutPower = 0;
      createImpactEffect(attacker, opponent, 'block');
      
      // PARRY SOUND FOR UPPERCUT BLOCK 🛡️👊🔊
      playParrySound();
      
      const upperType = attacker.sdtActive ? 'SDT Balrog' : 'Balrog';
      console.log(`${opponent.name} blocked ${attacker.name}'s ${upperType} Rising Uppercut! 🛡️👊${attacker.sdtActive ? '💀' : ''}`);
      return true;
    }
    
        // Interrupt any charging
    interruptJudgmentCut(opponent);
    interruptDantyCharging(opponent);
    
    // Calculate damage (SDT does double damage)
    let baseDamage = 12 + (attacker.uppercutPower * 8);
    let damage = baseDamage;
    if (attacker.charId === 'danty' && attacker.sdtActive) {
      damage = Math.floor(baseDamage * SIN_DEVIL_TRIGGER.DAMAGE_MULTIPLIER);
      console.log(`${attacker.name}'s SDT Balrog uppercut deals DOUBLE DAMAGE! ${damage} instead of ${baseDamage} 💀👊💥`);
    } else if (attacker.charId === 'danty' && attacker.devilSwordUpgraded) {
      damage = Math.floor(baseDamage * 1.5);
      console.log(`${attacker.name}'s upgraded Balrog deals extra damage! ${damage} instead of ${baseDamage} 😈👊`);
    }
    
    opponent.hp -= damage;
    opponent.justHit = 20;
    
    // Set special uppercut hitstun that lasts until landing
    opponent.hitstun = 999999;
    opponent.inHitstun = true;
    opponent.airHitstun = true;
    
    console.log(`${opponent.name} was launched by ${attacker.sdtActive ? 'SDT ' : ''}Balrog uppercut and will remain stunned until landing!`);
    
    // Give opponent the SAME upward velocity as attacker
    opponent.vy = attacker.vy;
    opponent.vx = attacker.facing * (6 + attacker.uppercutPower * 4);
    
    // Choose correct impact effect
    const effectType = attacker.sdtActive ? 'sdt-uppercut' : 'balrog-dash';
    createImpactEffect(attacker, opponent, effectType);
    
    if (opponent.hp <= 0) {
      opponent.hp = 0;
      opponent.alive = false;
      winner = attacker.id;
    }
    
    // End uppercut state
    attacker.isUppercutting = false;
    attacker.uppercutPower = 0;
    
    const upperType = attacker.sdtActive ? 'SDT Balrog' : 'Balrog';
    const emoji = attacker.sdtActive ? '💀👊⬆️💫🔥' : '👊⬆️💫';
    console.log(`${attacker.name}'s ${upperType} Rising Uppercut launches ${opponent.name} skyward! ${emoji}`);
    return true;
  }
  return false;
}

function handleMirageBladeAttack() {
  for (let i = 0; i < 2; i++) {
    const p = players[i];
    const opp = players[1 - i];
    if (!p.alive || !opp.alive || !p.mirageActive) continue;

    const slashW = p.mirageSlashW || 200; // Use custom width
    const slashH = p.mirageSlashH || 100; // Use custom height
    const sx = p.mirageSlashX;
    const sy = p.mirageSlashY;
    
    if (sx < opp.x + opp.w && sx + slashW > opp.x &&
        sy < opp.y + opp.h && sy + slashH > opp.y) {
      
      // Only hit if not already hit by this slash
      if (!p.mirageHasHit) {
        // Interrupt any charging
        interruptJudgmentCut(opp);
        interruptDantyCharging(opp);
        
        opp.pauseTimer = 120;
        p.mirageHasHit = true; // Mark as hit but don't destroy slash!
        createImpactEffect(p, opp, 'dash');
        console.log(`${p.name}'s Mirage Blade slash freezes ${opp.name}! ❄️⏳ (Slash persists!)`);
      }
    }
    
    // Update slash timer - it disappears after duration, not on contact!
    if (p.mirageTimer > 0) {
      p.mirageTimer--;
    } else {
      p.mirageActive = false;
      p.mirageHasHit = false; // Reset for next slash
      console.log(`${p.name}'s Mirage Blade slash fades away! ✨💨`);
    }
  }
}
function pauseGame(reason) {
    gameState.paused = true;
    gameState.pauseReason = reason;
    gameState.pauseStartTime = performance.now();
}

function resumeGame() {
    gameState.paused = false;
    gameState.pauseReason = null;
}

function startCameraZoomEffect() {
    cameraZoomEffect.active = true;
    cameraZoomEffect.phase = 'zoom_in';
    cameraZoomEffect.startTime = performance.now();
    cameraZoomEffect.startZoom = 1;
    cameraZoomEffect.currentZoom = 1;
}

function updateCameraZoomEffect() {
    if (!cameraZoomEffect.active) return;
    
    const now = performance.now();
    const elapsed = now - cameraZoomEffect.startTime;
    
    switch (cameraZoomEffect.phase) {
        case 'zoom_in':
            const zoomProgress = Math.min(elapsed / cameraZoomEffect.duration.zoomIn, 1);
            const easeProgress = 1 - Math.pow(1 - zoomProgress, 3);
            cameraZoomEffect.currentZoom = 1 + (cameraZoomEffect.targetZoom - 1) * easeProgress;
            
            if (elapsed >= cameraZoomEffect.duration.zoomIn) {
                cameraZoomEffect.phase = 'hold';
                cameraZoomEffect.startTime = now;
            }
            break;
            
        case 'hold':
            cameraZoomEffect.currentZoom = cameraZoomEffect.targetZoom;
            
            if (elapsed >= cameraZoomEffect.duration.hold) {
                cameraZoomEffect.phase = 'zoom_out';
                cameraZoomEffect.startTime = now;
            }
            break;
            
        case 'zoom_out':
            const outProgress = Math.min(elapsed / cameraZoomEffect.duration.zoomOut, 1);
            const easeOutProgress = Math.pow(outProgress, 2);
            cameraZoomEffect.currentZoom = cameraZoomEffect.targetZoom - (cameraZoomEffect.targetZoom - 1) * easeOutProgress;
            
            if (elapsed >= cameraZoomEffect.duration.zoomOut) {
                cameraZoomEffect.active = false;
                cameraZoomEffect.phase = 'idle';
                cameraZoomEffect.currentZoom = 1;
            }
            break;
    }
}

function executeJudgmentCut(character) {
  pauseGame('judgement_cut');
  
  const { cx, cy, zoom } = getCamera();
  const viewW = canvas.width / zoom;
  const viewH = canvas.height / zoom;
  
  if (!character.snapCanvas) {
      character.snapCanvas = document.createElement('canvas');
      character.snapCtx = character.snapCanvas.getContext('2d');
  }
  
  character.snapCanvas.width = viewW;
  character.snapCanvas.height = viewH;
  
  const viewLeft = cx - viewW / 2;
  const viewTop = cy - viewH / 2;
  
  character.snapCtx.clearRect(0, 0, viewW, viewH);
  character.snapCtx.save();
  character.snapCtx.translate(-viewLeft, -viewTop);
  
  // Background
  if (bgImg.complete && bgImg.naturalWidth > 0) {
    character.snapCtx.drawImage(bgImg, 0, 0, WIDTH, HEIGHT);
  } else {
    character.snapCtx.fillStyle = "#181c24";
    character.snapCtx.fillRect(0, 0, WIDTH, HEIGHT);
  }
  character.snapCtx.fillStyle = "#6d4c41";
  character.snapCtx.fillRect(0, FLOOR_HEIGHT, WIDTH, HEIGHT - FLOOR_HEIGHT);

  // Players
  for (let player of players) {
      if (!player.alive) continue;
      
      // Shadow
      character.snapCtx.globalAlpha = 0.18;
      character.snapCtx.beginPath();
      character.snapCtx.ellipse(player.x + player.w / 2, player.y + player.h - 4, player.w / 2.5, 7, 0, 0, 2 * Math.PI);
      character.snapCtx.fillStyle = "#000";
      character.snapCtx.fill();
      character.snapCtx.globalAlpha = 1;
      
      let anim = getAnimForPlayer(player);
      let spritesheet = anim && spritesheetCache[anim.src];
      
      if (anim && spritesheet && spritesheet.complete && spritesheet.naturalWidth > 0) {
        const scaleX = player.w / anim.w;
        const scaleY = player.h / anim.h;
        
        if (player.facing === 1) {
          character.snapCtx.save();
          character.snapCtx.translate(player.x + player.w/2, player.y + player.h/2);
          character.snapCtx.scale(-scaleX, scaleY);
          character.snapCtx.translate(-anim.w/2, -anim.h/2);
          character.snapCtx.drawImage(spritesheet, anim.w * player.animFrame, 0, anim.w, anim.h, 0, 0, anim.w, anim.h);
          character.snapCtx.restore();
        } else {
          character.snapCtx.drawImage(spritesheet, anim.w * player.animFrame, 0, anim.w, anim.h, player.x, player.y, player.w, player.h);
        }
      } else {
        character.snapCtx.fillStyle = player.color;
        character.snapCtx.strokeStyle = "#fff";
        character.snapCtx.lineWidth = 3;
        character.snapCtx.fillRect(player.x, player.y, player.w, player.h);
        character.snapCtx.strokeRect(player.x, player.y, player.w, player.h);
      }
      
      if (player.blocking && player.block > 0) {
        character.snapCtx.save();
        character.snapCtx.globalAlpha = 0.5;
        character.snapCtx.strokeStyle = "#b0bec5";
        character.snapCtx.lineWidth = 7;
        character.snapCtx.beginPath();
        character.snapCtx.roundRect(player.x-4, player.y-4, player.w+8, player.h+8, 18);
        character.snapCtx.stroke();
        character.snapCtx.restore();
      }
      
      if (player.dizzy > 0) {
        character.snapCtx.save();
        character.snapCtx.globalAlpha = 0.5;
        character.snapCtx.strokeStyle = "#ffd740";
        character.snapCtx.lineWidth = 4;
        character.snapCtx.beginPath();
        character.snapCtx.arc(player.x+player.w/2, player.y-14, 19, 0, 2*Math.PI);
        character.snapCtx.stroke();
        character.snapCtx.restore();
      }
  }
  
  character.snapCtx.restore();
  
    setTimeout(() => { AbilityLibrary.judgementCut(character); }, 100); // adjust appearance of lines adjust white lines
   setTimeout(() => { 
    resumeGame(); 
    
    // RESUME BACKGROUND MUSIC AFTER JUDGMENT CUT! 🎵✨
    if (defaultFightMusic && defaultFightMusic.paused) {
      defaultFightMusic.play().catch(error => {
        console.log("Music resume failed");
      });
      console.log("🎵 Background music resumed after EPIC JUDGMENT CUT! ⚔️🎭");
    }
  }, 7300);
}

function getControls(pid) {
  return pid === 0
    ? { left: 'a', right: 'd', up: 'w', down: 's', special: 'e', weaponSwitch: 'q' }
    : { left: 'k', right: ';', up: 'o', down: 'l', special: 'p', weaponSwitch: 'i' };
}

function knockback(attacker, defender, strengthX, strengthY) {
  defender.vx = (defender.x < attacker.x ? -1 : 1) * Math.abs(strengthX);
  defender.vy = strengthY;
}

function interruptJudgmentCut(player) {
  if (player.judgmentCutCharging) {
    player.judgmentCutCharging = false;
    player.judgmentCutChargeLevel = 0;
    player.animState = "hit";
    player.animFrame = 0;
    player.animTimer = 0;
    
    player.vx = (Math.random() - 0.5) * 4;
    player.vy = -3;
    
    for (let i = 0; i < 6; i++) {
      particles.push({
        type: "smoke",
        x: player.x + player.w/2 + (Math.random() - 0.5) * 20,
        y: player.y + player.h/2 + (Math.random() - 0.5) * 20,
        life: 15
      });
    }
    
    console.log(`${player.name}'s Judgment Cut was interrupted!`);
    return true;
  }
  return false;
}


function interruptDantyCharging(player) {
  if (player.charId !== 'danty') return false;
  
  let wasInterrupted = false;
  
  // INTERRUPT SPECTRAL SWORD CONTROL 👻💥❌
  if (player.spectralSwordControlling && player.spectralSword) {
    // Create dramatic ghost vanishing effect
    const sword = player.spectralSword;
    
    // Create ghost vanishing particles at sword location
    for (let i = 0; i < 15; i++) {
      particles.push({
        type: "smoke",
        x: sword.x + sword.w/2 + (Math.random() - 0.5) * 40,
        y: sword.y + sword.h/2 + (Math.random() - 0.5) * 40,
        life: 30
      });
    }
    
    // Additional ghostly explosion particles
    for (let i = 0; i < 8; i++) {
      particles.push({
        type: "explosion",
        x: sword.x + sword.w/2 + (Math.random() - 0.5) * 30,
        y: sword.y + sword.h/2 + (Math.random() - 0.5) * 30,
        life: 20,
        vx: (Math.random() - 0.5) * 8,
        vy: Math.random() * -6 - 1
      });
    }
    
    // Destroy the spectral sword (attacked = true)
    destroySpectralSword(player, true);
    
    // Reset Danty's animation
    player.animState = "hit";
    player.animFrame = 0;
    player.animTimer = 0;
    
    console.log(`${player.name} was attacked! The Spectral Sword connection SEVERED! Ghost vanished! 👻💥💔📹`);
    wasInterrupted = true;
  }
  
  // Interrupt Devil Trigger charging
  if (player.devilSwordActivating) {
    player.devilSwordActivating = false;
    player.devilSwordActivationStart = 0;
    player.animState = "hit";
    player.animFrame = 0;
    player.animTimer = 0;
    
    // Add knockback
    player.vx = (Math.random() - 0.5) * 6;
    player.vy = -4;
    
    // Create interruption particles
    for (let i = 0; i < 8; i++) {
      particles.push({
        type: "smoke",
        x: player.x + player.w/2 + (Math.random() - 0.5) * 25,
        y: player.y + player.h/2 + (Math.random() - 0.5) * 25,
        life: 20
      });
    }
    
    console.log(`${player.name}'s Devil Trigger charging was INTERRUPTED! 😈💥❌`);
    wasInterrupted = true;
  }
  
  // Interrupt SDT charging
  if (player.sdtCharging) {
    player.sdtCharging = false;
    player.sdtChargeStart = 0;
    player.animState = "hit";
    player.animFrame = 0;
    player.animTimer = 0;
    
    // Add stronger knockback for SDT interrupt
    player.vx = (Math.random() - 0.5) * 8;
    player.vy = -6;
    
    // Create more dramatic interruption particles
    for (let i = 0; i < 12; i++) {
      particles.push({
        type: "explosion",
        x: player.x + player.w/2 + (Math.random() - 0.5) * 30,
        y: player.y + player.h/2 + (Math.random() - 0.5) * 30,
        life: 25,
        vx: (Math.random() - 0.5) * 6,
        vy: Math.random() * -4 - 2
      });
    }
    
    console.log(`${player.name}'s SIN DEVIL TRIGGER charging was BRUTALLY INTERRUPTED! 💀💥❌🔥`);
    wasInterrupted = true;
  }
  
  return wasInterrupted;
}
function isOpponentInJudgmentCutRange(caster) {
    for (let i = 0; i < players.length; i++) {
        const opponent = players[i];
        if (opponent !== caster && opponent.alive) {
            const dx = opponent.x + opponent.w/2 - (caster.x + caster.w/2);
            const dy = opponent.y + opponent.h/2 - (caster.y + caster.h/2);
            const distance = Math.sqrt(dx*dx + dy*dy);
            
            if (distance <= JUDGMENT_CUT_TRIGGER_RANGE) {
                return true;
            }
        }
    }
    return false;
}

function dealJudgmentCutDamage(effect) {
    if (effect.damageDealt) return;
    
    const character = effect.caster;
    
    for (let i = 0; i < players.length; i++) {
        const opponent = players[i];
        if (opponent !== character && opponent.alive) {
            const dx = opponent.x - character.x;
            const dy = opponent.y - character.y;
            const distance = Math.sqrt(dx*dx + dy*dy);
            
            if (distance < effect.range) {
                const damageMultiplier = 1 - (distance / effect.range);
                const damage = Math.round(effect.damage * damageMultiplier);
                opponent.hp -= damage;
                opponent.justHit = 20;
                
                const knockbackX = (opponent.x < character.x ? -1 : 1) * 15;
                const knockbackY = -12;
                knockback(character, opponent, knockbackX, knockbackY);
                
                if (opponent.hp <= 0) { 
                    opponent.hp = 0; 
                    opponent.alive = false; 
                    
                    if (character.hp <= 0) {
                        character.hp = 0;
                        character.alive = false;
                        winner = "draw";
                    } else {
                        winner = character.id; 
                    }
                }
            }
        }
    }
    
    effect.damageDealt = true;
}

const AbilityLibrary = {
    judgementCut: function(character) {
        if (character.judgementCutCooldown > 0) return false;
        
        startCameraZoomEffect();
        
        const { cx, cy, zoom } = getCamera();
        const viewW = canvas.width / zoom;
        const viewH = canvas.height / zoom;
        
        if (!character.effectCanvas) {
            character.effectCanvas = document.createElement('canvas');
            character.effectCtx = character.effectCanvas.getContext('2d');
        }
        
        character.effectCanvas.width = viewW;
        character.effectCanvas.height = viewH;
        character.judgementCutCooldown = 120;
        
        character.judgementCutPhase = VERGIL_JUDGMENT_CUT_PHASES.PREPARING;
        character.slashAnimationFrame = 0;
        character.slashAnimationTimer = 0;
        
        const effect = {
            lines: [
                [0, viewH * 0.07, viewW, viewH * 0.82],
                [0, viewH * 0.29, viewW, viewH],
                [0, viewH * 0.52, viewW * 0.82, viewH],
                [0, viewH * 0.88, viewW, viewH * 0.8],
                [0, viewH * 0.92, viewW, viewH * 0.51],
                [viewW * 0.16, 0, viewW, viewH],
                [viewW * 0.22, 0, viewW, viewH * 0.73],
                [viewW * 0.3, 0, viewW, viewH * 0.48],
                [0, viewH * 0.2, viewW, viewH * 0.08],
              [0, viewH * 0.12, viewW, viewH * 0.45],
                [0, viewH * 0.55, viewW, viewH * 0.23],
                [0, viewH * 0.75, viewW, viewH * 0.19],
                [0, viewH * 0.2, viewW * 0.55, viewH],
                [0, viewH, viewW, viewH * 0.25],
                [viewW * 0.73, 0, viewW, viewH],
              [viewW, 0, viewW * 0.34, viewH],
              [viewW, 0, viewW * 0.03, viewH],
            ],
            phase: 'lines',
            damage: 35,
            range: 500,
            cameraX: cx - viewW / 2,
            cameraY: cy - viewH / 2,
            viewWidth: viewW,
            viewHeight: viewH,
            shards: [],
            visibleLines: 0,
            damageDealt: false,  
            caster: character    
        };
        
        character.judgementCutEffect = effect;
            // Lines appear one by one
        for (let i = 0; i < 7; i++) {
            setTimeout(() => {
                if (character.judgementCutEffect && character.judgementCutEffect.phase === 'lines') {
                    character.judgementCutEffect.visibleLines = i + 1;
                }
            }, i * JUDGEMENT_CUT_CONSTANTS.FIRST_THREE_INTERVAL);
        }
        
        // Remaining lines appear all at once after delay
        setTimeout(() => {
            if (character.judgementCutEffect && character.judgementCutEffect.phase === 'lines') {
                character.judgementCutEffect.visibleLines = effect.lines.length;
            }
        }, 3 * JUDGEMENT_CUT_CONSTANTS.FIRST_THREE_INTERVAL + JUDGEMENT_CUT_CONSTANTS.REMAINING_LINES_DELAY);
        
        // After lines display duration, hide lines and prepare shards
        setTimeout(() => {
            if (character.judgementCutEffect) {
                character.judgementCutEffect.phase = 'preparing';
                
                // Generate shards
                const helpers = {
                    lineSide: function(line, pt) {
                        const [x1,y1,x2,y2] = line;
                        return (x2-x1)*(pt[1]-y1)-(y2-y1)*(pt[0]-x1);
                    },
                    
                    segLineIntersection: function(a, b, line) {
                        const [x1,y1,x2,y2] = line;
                        const x3 = a[0], y3 = a[1], x4 = b[0], y4 = b[1];
                        const denom = (x1-x2)*(y3-y4)-(y1-y2)*(x3-x4);
                        if (Math.abs(denom)<1e-8) return null;
                        const px = ((x1*y2-y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-y3*x4))/denom;
                        const py = ((x1*y2-y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-y3*x4))/denom;
                        const between = (a,b,c) => a>=Math.min(b,c)-1e-6 && a<=Math.max(b,c)+1e-6;
                        if (between(px,a[0],b[0])&&between(py,a[1],b[1])) return [px,py];
                        return null;
                    },
                    
                    splitPolygonByLine: function(poly, line) {
                        let left=[], right=[];
                        for (let i=0;i<poly.length;++i) {
                            let a = poly[i], b = poly[(i+1)%poly.length];
                            let aside = this.lineSide(line, a);
                            let bside = this.lineSide(line, b);
                            if (aside >= 0) left.push(a);
                            if (aside <= 0) right.push(a);
                            if ((aside > 0 && bside < 0) || (aside < 0 && bside > 0)) {
                                let ipt = this.segLineIntersection(a, b, line);
                                if (ipt) { left.push(ipt); right.push(ipt); }
                            }
                        }
                        if (left.length>2) {
                            left = left.filter((p,i,arr)=>
                                i==0||Math.abs(p[0]-arr[i-1][0])>1e-5||Math.abs(p[1]-arr[i-1][1])>1e-5
                            );
                        } else left = null;
                        if (right.length>2) {
                            right = right.filter((p,i,arr)=>
                                i==0||Math.abs(p[0]-arr[i-1][0])>1e-5||Math.abs(p[1]-arr[i-1][1])>1e-5
                            );
                        } else right = null;
                        return [left, right];
                    },
                    
                    shatterPolygons: function(lines) {
                        let initial = [[ [0,0], [WIDTH,0], [WIDTH,HEIGHT], [0,HEIGHT] ]];
                        for (let line of lines) {
                            let next = [];
                            for (let poly of initial) {
                                let [left, right] = this.splitPolygonByLine(poly, line);
                                if (left) next.push(left);
                                if (right) next.push(right);
                            }
                            initial = next;
                        }
                        return initial;
                    }
                };
                
                const polys = helpers.shatterPolygons.call(helpers, effect.lines);
                character.judgementCutEffect.shards = polys.map(poly => {
                    let cx=0, cy=0;
                    for (let p of poly) { cx+=p[0]; cy+=p[1]; }
                    cx/=poly.length; cy/=poly.length;
                    
                    const expandedPoly = poly.map(point => {
                        const dx = point[0] - cx;
                        const dy = point[1] - cy;
                        const expandFactor = 1.1;
                        return [cx + dx * expandFactor, cy + dy * expandFactor];
                    });
                    
                    let dir = Math.random() < 0.5 ? -0.8 : 0.8;
                    return {
                        poly: expandedPoly,
                        x: (Math.random()-0.5) * 10,
                        y: (Math.random()-0.5) * 10,
                        vx: dir * (18 + Math.random()*10),
                        vy: (Math.random()-0.5)*10,
                        g: 1.10 + Math.random()*0.2,
                        angle: (Math.random()-0.5)*0.2,
                        vangle: (Math.random()-0.5)*0.12 + (cx-effect.viewWidth/2)*0.0003
                    };
                });
            }
        }, JUDGEMENT_CUT_CONSTANTS.LINE_DISPLAY_DURATION);
        
               // Make Vergil visible DURING line display! ⚔️✨
        setTimeout(() => {
            if (character.judgementCutEffect) {
                character.isInvisibleDuringJudgmentCut = false; // Show Vergil while lines appear!
                console.log("🎬 Vergil becomes visible during line sequence! ⚔️✨");
            }
        }, 500);
     
        
        setTimeout(() => {
            if (character.judgementCutEffect) {
                character.judgementCutPhase = VERGIL_JUDGMENT_CUT_PHASES.SHEATHING;
                character.animState = "sheathing";
                character.animFrame = 0;
                character.animTimer = 0;
            }
        }, JUDGEMENT_CUT_CONSTANTS.LINE_DISPLAY_DURATION + 50);
        
        setTimeout(() => {
            if (character.judgementCutEffect) {
                character.judgementCutEffect.phase = 'slide';
                character.judgementCutEffect.startTime = performance.now();
            }
        }, JUDGEMENT_CUT_CONSTANTS.LINE_DISPLAY_DURATION + 1300);
        
        setTimeout(() => {
            if (character.judgementCutPhase === VERGIL_JUDGMENT_CUT_PHASES.SHEATHING) {
                character.judgementCutPhase = null;
                character.animState = "idle";
                character.animFrame = 0;
                character.animTimer = 0;
            }
        }, JUDGEMENT_CUT_CONSTANTS.LINE_DISPLAY_DURATION +6000);
        
        return true;
    }
};

function getCamera() {
  const p1 = players[0], p2 = players[1];
  
  // Get player 1 position (or spectral sword if controlling)
  let x1, y1;
  if (p1.charId === 'danty' && p1.spectralSwordControlling && p1.spectralSword) {
    // Camera follows spectral sword for player 1
    x1 = p1.spectralSword.x + p1.spectralSword.w / 2;
    y1 = p1.spectralSword.y + p1.spectralSword.h / 2;
  } else {
    x1 = p1.x + p1.w / 2;
    y1 = p1.y + p1.h / 2;
  }
  
  // Get player 2 position (or spectral sword if controlling)
  let x2, y2;
  if (p2.charId === 'danty' && p2.spectralSwordControlling && p2.spectralSword) {
    // Camera follows spectral sword for player 2
    x2 = p2.spectralSword.x + p2.spectralSword.w / 2;
    y2 = p2.spectralSword.y + p2.spectralSword.h / 2;
  } else {
    x2 = p2.x + p2.w / 2;
    y2 = p2.y + p2.h / 2;
  }

  let cx = (x1 + x2) / 2;
  let cy = (y1 + y2) / 2;

  const extra = 80;
  const playersW = Math.abs(x2 - x1) + 100 + extra; // Use fixed width since sword size varies
  const playersH = Math.abs(y2 - y1) + 100 + extra; // Use fixed height since sword size varies

  const zoomW = canvas.width / playersW;
  const zoomH = canvas.height / playersH;
  let baseZoom = Math.min(zoomW, zoomH);

  const minZoom = Math.max(canvas.width / WIDTH, canvas.height / HEIGHT);
  const maxZoom = 1.8;
  baseZoom = Math.max(minZoom, Math.min(maxZoom, baseZoom));

  let finalZoom = baseZoom;
  if (cameraZoomEffect.active) {
      finalZoom = baseZoom * cameraZoomEffect.currentZoom;
  }

  const viewW = canvas.width / finalZoom, viewH = canvas.height / finalZoom;
  cx = Math.max(viewW / 2, Math.min(WIDTH - viewW / 2, cx));
  cy = Math.max(viewH / 2, Math.min(HEIGHT - viewH / 2, cy));

  return { cx, cy, zoom: finalZoom };
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
    const p = players[pid];
    if (!p.alive) continue;
    
    const controls = getControls(pid);
      if (k === controls.special && p.charId === 'vergil' && !p.judgmentCutCharging && p.judgementCutCooldown === 0) {
      if (p.currentWeapon === VERGIL_WEAPONS.YAMATO) {
        // CHECK FOR STORM SLASHES FIRST! ⚡🌩️
        if (p.stormSlashesReady) {
          // Find nearby enemy for Storm Slashes
          const nearbyEnemy = players.find(enemy => {
            if (enemy === p || !enemy.alive) return false;
            const dx = Math.abs(enemy.x + enemy.w/2 - (p.x + p.w/2));
            const dy = Math.abs(enemy.y + enemy.h/2 - (p.y + p.h/2));
            return dx <= 200 && dy <= 100; // Storm Slashes range
          });
          
          if (nearbyEnemy) {
            // ACTIVATE STORM SLASHES! ⚡⚔️🌩️
            p.stormSlashesActive = true;
            p.stormSlashesDuration = 50; // 2 seconds of slashing
            p.stormSlashesAnimationFrame = 0;
            p.stormSlashesAnimationTimer = 0;
            p.stormSlashesTarget = nearbyEnemy;
            p.stormSlashesReady = false;
            p.stormSlashesTimer = 0;
          
          } else {
           
          }
        }
        else if (p.onGround) {
          if (isOpponentInJudgmentCutRange(p)) {
            p.judgmentCutCharging = true;
            p.judgmentCutChargeStart = performance.now();
            p.judgmentCutChargeLevel = 0;
            p.animState = "charging";
            p.animFrame = 0;
            p.animTimer = 0;
          } else {
            rangeWarningText.show = true;
            rangeWarningText.timer = 60;
          }
        }
      } else if (p.currentWeapon === VERGIL_WEAPONS.BEOWULF) {
        if (p.onGround && !p.beowulfCharging && !p.beowulfDiveKick) {
          p.beowulfCharging = true;
          p.beowulfChargeStart = performance.now();
          p.beowulfChargeType = 'uppercut';
          p.animState = "beowulf-charging";
          p.animFrame = 0;
          p.animTimer = 0;
          console.log(`${p.name} is charging Beowulf Rising Uppercut! 👊⬆️`);
        } else if (!p.onGround && !p.beowulfCharging && !p.beowulfDiveKick) {
          const currentHeight = GROUND - (p.y + p.h);
          
          if (currentHeight >= 50) {
            p.beowulfDiveKick = true;
            p.beowulfDiveDirection = p.facing;
            p.vy = 16;
            p.vx = p.facing * 18;
            p.isDiveKicking = true;
            p.animState = "beowulf-divekick";
            p.animFrame = 0;
            p.animTimer = 0;
            console.log(`${p.name} performs SUPER DIAGONAL Kamen Rider Kick! 👊💥`);
          } else {
            console.log(`${p.name} not high enough for Kamen Rider kick! Need 100px height 🚫`);
          }
        }
             } else if (p.currentWeapon === VERGIL_WEAPONS.MIRAGE_BLADE) {
        if (p.onGround && !p.mirageActive) {
          p.mirageActive = true;
          p.mirageTimer = MIRAGE_BLADE_CONFIG.DURATION; // Use config duration!
          p.mirageMaxTimer = MIRAGE_BLADE_CONFIG.DURATION; // Store max for fade calculations
          p.mirageHasHit = false;
          
          // Use config dimensions
          const slashW = MIRAGE_BLADE_CONFIG.WIDTH;
          const slashH = MIRAGE_BLADE_CONFIG.HEIGHT;
          
          p.mirageSlashW = slashW;
          p.mirageSlashH = slashH;
          
          p.mirageSlashX = p.facing > 0 ? p.x + p.w : p.x - slashW;
          p.mirageSlashY = p.y + (p.h - slashH)/2;
          
          console.log(`${p.name} unleashes CONFIGURED Mirage Blade! ${slashW}x${slashH} for ${MIRAGE_BLADE_CONFIG.DURATION} frames! 🔪⚙️`);
        }
      }
    }
 if (k === controls.special && p.charId === 'danty') {
      // SDT STATE: Can use ALL abilities regardless of weapon! 💀🔥
      if (p.sdtActive) {
        if (p.onGround && !p.balrogCharging && !p.balrogDiveKick) {
          // SDT allows Balrog uppercut with ANY weapon equipped!
          p.balrogCharging = true;
          p.balrogChargeStart = performance.now();
          p.balrogChargeType = 'uppercut';
          p.animState = "sdt-charging";
          p.animFrame = 0;
          p.animTimer = 0;
          console.log(`${p.name}'s SDT UNLEASHES BALROG UPPERCUT! 💀👊⬆️🔥`);
        } else if (!p.onGround && !p.balrogCharging && !p.balrogDiveKick) {
          const currentHeight = GROUND - (p.y + p.h);
          
          if (currentHeight >= 30) { // Lower requirement for SDT
            p.balrogDiveKick = true;
            p.balrogDiveDirection = p.facing;
            p.vy = 18; // Stronger for SDT
            p.vx = p.facing * 22; // Faster for SDT
            p.isDiveKicking = true;
            p.animState = "sdt-divekick";
            p.animFrame = 0;
            p.animTimer = 0;
            console.log(`${p.name}'s SDT DEVASTATING AERIAL ASSAULT! 💀👊💥🔥`);
          }
        }
      }
      // NORMAL STATES (non-SDT)
      else if (p.currentWeapon === DANTY_WEAPONS.DEVIL_SWORD) {
        // Check if can activate Sin Devil Trigger (SDT)
        if (p.devilSwordUpgraded && p.sdtGauge >= SIN_DEVIL_TRIGGER.GAUGE_MAX && !p.sdtActive && !p.sdtCharging) {
          p.sdtCharging = true;
          p.sdtChargeStart = performance.now();
          console.log(`${p.name} is charging SIN DEVIL TRIGGER! Hold to unleash ultimate power... 😈💀🔥`);
        }
        // Check if can activate Devil Trigger
        else if (p.devilSwordGauge >= DEVIL_SWORD_GAUGE.MAX && !p.devilSwordUpgraded && !p.devilSwordActivating && !p.sdtActive) {
          p.devilSwordActivating = true;
          p.devilSwordActivationStart = performance.now();
          console.log(`${p.name} is activating Devil Trigger! Hold to charge... 😈⚡`);
        } else {
          console.log(`${p.name} uses Devil Sword ability! ⚔️`);
        }
      } else if (p.currentWeapon === DANTY_WEAPONS.BALROG) {
        if (p.onGround && !p.balrogCharging && !p.balrogDiveKick) {
          // Start charging Balrog uppercut
          p.balrogCharging = true;
          p.balrogChargeStart = performance.now();
          p.balrogChargeType = 'uppercut';
          p.animState = "balrog-charging";
          p.animFrame = 0;
          p.animTimer = 0;
          console.log(`${p.name} is charging Balrog Rising Uppercut! 👊⬆️`);
        } else if (!p.onGround && !p.balrogCharging && !p.balrogDiveKick) {
          const currentHeight = GROUND - (p.y + p.h);
          
          if (currentHeight >= 50) {
            p.balrogDiveKick = true;
            p.balrogDiveDirection = p.facing;
            p.vy = 16;
            p.vx = p.facing * 18;
            p.isDiveKicking = true;
            p.animState = "balrog-divekick";
            p.animFrame = 0;
            p.animTimer = 0;
            console.log(`${p.name} performs SUPER DIAGONAL Balrog Kick! 👊💥`);
          } else {
            console.log(`${p.name} not high enough for Balrog kick! Need 50px height 🚫`);
          }
        }
          } else if (p.currentWeapon === DANTY_WEAPONS.SPECTRAL_SWORD) {
        // Spectral Sword special ability
        if (!p.spectralSword && !p.spectralSwordTransferring) {
          // Summon spectral sword
          p.spectralSword = createSpectralSword(p);
          if (p.spectralSword) {
            p.spectralSwordTransferring = true;
            p.spectralSwordTransferTimer = SPECTRAL_SWORD.CONTROL_TRANSFER_FRAMES;
            p.animState = "transferring-control";
            p.animFrame = 0;
            p.animTimer = 0;
          }
        } else if (p.spectralSword && p.spectralSwordControlling) {
          console.log(`${p.name}'s Spectral Sword is already active! ⚔️👻`);
        }
      }
    }
    
  // Weapon switching
const weaponSwitchKey = pid === 0 ? 'q' : 'i';
if (k === weaponSwitchKey) {
  let canSwitch = true;
  if (p.charId === 'vergil') {
    canSwitch = !p.judgmentCutCharging && !p.beowulfCharging && !p.beowulfDiveKick && !p.beowulfRecovering;
  } else if (p.charId === 'danty') {
    canSwitch = !p.balrogCharging && !p.balrogDiveKick && !p.balrogRecovering;
  }
  
  if (canSwitch) {
    if (p.charId === 'vergil') {
      if (p.currentWeapon === VERGIL_WEAPONS.YAMATO) {
        p.currentWeapon = VERGIL_WEAPONS.BEOWULF;
        console.log(`${p.name} switched to Beowulf (Gauntlets)! ${p.onGround ? '🟢 Ground' : '🔵 Mid-Air'}`);
      } else if (p.currentWeapon === VERGIL_WEAPONS.BEOWULF) {
        p.currentWeapon = VERGIL_WEAPONS.MIRAGE_BLADE;
        console.log(`${p.name} switched to Mirage Blade (Magic)! ${p.onGround ? '🟢 Ground' : '🔵 Mid-Air'}`);
      } else {
        p.currentWeapon = VERGIL_WEAPONS.YAMATO;
        console.log(`${p.name} switched to Yamato (Sword)! ${p.onGround ? '🟢 Ground' : '🔵 Mid-Air'}`);
      }
       } else if (p.charId === 'danty') {
      if (p.currentWeapon === DANTY_WEAPONS.DEVIL_SWORD) {
        p.currentWeapon = DANTY_WEAPONS.BALROG;
        console.log(`${p.name} switched to Balrog (Gauntlets)! ${p.onGround ? '🟢 Ground' : '🔵 Mid-Air'}`);
      } else if (p.currentWeapon === DANTY_WEAPONS.BALROG) {
        p.currentWeapon = DANTY_WEAPONS.SPECTRAL_SWORD;
        // Destroy spectral sword if switching away
        if (p.spectralSword) {
          destroySpectralSword(p);
        }
             console.log(`${p.name} switched to Spectral Sword (Entity Control)! ${p.onGround ? '🟢 Ground' : '🔵 Mid-Air'} 👻⚔️`);
      } else {
        // Destroy spectral sword when switching away
        if (p.spectralSword) {
          destroySpectralSword(p);
        }
        p.currentWeapon = DANTY_WEAPONS.DEVIL_SWORD;
        console.log(`${p.name} switched to Devil Sword (Sword)! ${p.onGround ? '🟢 Ground' : '🔵 Mid-Air'}`);
      }
    }
    
    p.animFrame = 0;
    p.animTimer = 0;
  }
}
  }

  for (let pid = 0; pid < 2; pid++) {
    const controls = pid === 0 ? {left:'a', right:'d'} : {left:'k', right:';'};
    const p = players[pid];
    if(!p.alive) continue;
    
    // SPECTRAL SWORD DASH CONTROLS 👻⚔️💨
    if (p.charId === 'danty' && p.spectralSword && p.spectralSwordControlling) {
      const sword = p.spectralSword;
      
      if (k === controls.left && !keys[controls.right] && sword.dashCooldown === 0) {
        let now = performance.now();
        if (dashTapState[pid].lastTapDir === 'left' && now - dashTapState[pid].lastTapTime < DASH_WINDOW && now - dashTapState[pid].lastReleaseTime.left < DASH_WINDOW) {
          sword.vx = -SPECTRAL_SWORD.DASH_SPEED;
          sword.dash = SPECTRAL_SWORD.DASH_FRAMES;
          sword.dashCooldown = SPECTRAL_SWORD.DASH_COOLDOWN;
          sword.facing = -1;
          sword.animState = "dash";
          sword.animFrame = 0;
          sword.animTimer = 0;
          dashTapState[pid].lastTapDir = null;
          console.log(`${p.name}'s Spectral Sword dashes left! 👻⚔️💨`);
        } else {
          dashTapState[pid].lastTapDir = 'left';
          dashTapState[pid].lastTapTime = now;
        }
      }
      
      if (k === controls.right && !keys[controls.left] && sword.dashCooldown === 0) {
        let now = performance.now();
        if (dashTapState[pid].lastTapDir === 'right' && now - dashTapState[pid].lastTapTime < DASH_WINDOW && now - dashTapState[pid].lastReleaseTime.right < DASH_WINDOW) {
          sword.vx = SPECTRAL_SWORD.DASH_SPEED;
          sword.dash = SPECTRAL_SWORD.DASH_FRAMES;
          sword.dashCooldown = SPECTRAL_SWORD.DASH_COOLDOWN;
          sword.facing = 1;
          sword.animState = "dash";
          sword.animFrame = 0;
          sword.animTimer = 0;
          dashTapState[pid].lastTapDir = null;
          console.log(`${p.name}'s Spectral Sword dashes right! 👻⚔️💨`);
        } else {
          dashTapState[pid].lastTapDir = 'right';
          dashTapState[pid].lastTapTime = now;
        }
      }
      
      continue; // Skip normal dash for player when controlling spectral sword
    }
    
    if (k === controls.left && !keys[controls.right] && p.dashCooldown === 0 && !p.inHitstun) {
      let now = performance.now();
      if (dashTapState[pid].lastTapDir === 'left' && now - dashTapState[pid].lastTapTime < DASH_WINDOW && now - dashTapState[pid].lastReleaseTime.left < DASH_WINDOW) {
                if (p.charId === 'vergil') {
          p.teleportTrail = { x: p.x, y: p.y, duration: 15, alpha: 0.8, frame: p.animFrame, animState: p.animState, facing: p.facing };
          p.isTeleporting = true;
          p.teleportAlpha = 0.3;
          p.vx = -DASH_SPEED * 1.2;
        } else {
          // SDT DASH SPEED BOOST 💀⚡
          const dashMultiplier = (p.charId === 'danty' && p.sdtActive) ? SIN_DEVIL_TRIGGER.DASH_SPEED_MULTIPLIER : 1.0;
          p.vx = -DASH_SPEED * dashMultiplier;
        }
        p.dash = DASH_FRAMES;
        p.dashCooldown = DASH_COOLDOWN;
        dashTapState[pid].lastTapDir = null;
        spawnDashEffects(p);
      } else {
        dashTapState[pid].lastTapDir = 'left';
        dashTapState[pid].lastTapTime = now;
      }
    }
    
    if (k === controls.right && !keys[controls.left] && p.dashCooldown === 0 && !p.inHitstun) {
      let now = performance.now();
      if (dashTapState[pid].lastTapDir === 'right' && now - dashTapState[pid].lastTapTime < DASH_WINDOW && now - dashTapState[pid].lastReleaseTime.right < DASH_WINDOW) {
                    if (p.charId === 'vergil') {
          p.teleportTrail = { x: p.x, y: p.y, duration: 15, alpha: 0.8, frame: p.animFrame, animState: p.animState, facing: p.facing };
          p.isTeleporting = true;
          p.teleportAlpha = 0.3;
          p.vx = DASH_SPEED * 1.2;
        } else {
          // SDT DASH SPEED BOOST 💀⚡
          const dashMultiplier = (p.charId === 'danty' && p.sdtActive) ? SIN_DEVIL_TRIGGER.DASH_SPEED_MULTIPLIER : 1.0;
          p.vx = DASH_SPEED * dashMultiplier;
        }
        p.dash = DASH_FRAMES;
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
    const controls = pid === 0 ? {left:'a', right:'d'} : {left:'k', right:';'};
    let now = performance.now();
    if (k === controls.left) dashTapState[pid].lastReleaseTime.left = now;
    if (k === controls.right) dashTapState[pid].lastReleaseTime.right = now;
    
    const playerControls = getControls(pid);
    if (k === playerControls.special) {
      const p = players[pid];
      if (p.charId === 'vergil' && p.judgmentCutCharging) {
        const chargeTime = now - p.judgmentCutChargeStart;
        
                      if (chargeTime >= JUDGMENT_CUT_CHARGE.MIN_CHARGE_TIME) {
          p.isInvisibleDuringJudgmentCut = true;
          p.judgementCutPhase = VERGIL_JUDGMENT_CUT_PHASES.SLASHING;
          p.slashAnimationFrame = 0;
          p.slashAnimationTimer = 0;
          p.judgmentCutCharging = false;
          p.judgmentCutChargeLevel = 0;
          
                  // PAUSE BACKGROUND MUSIC FOR DRAMATIC EFFECT! 🎵❌
          if (defaultFightMusic && !defaultFightMusic.paused) {
            defaultFightMusic.pause();
            console.log("🎵 Background music paused for DRAMATIC JUDGMENT CUT! 🎭⚔️");
          }
          
          // PLAY THE LEGENDARY VERGIL SOUND! ⚡⚔️🎵
          playJudgmentCutSound();
          
          // Start lines IMMEDIATELY during slashing! ⚡⚔️
          setTimeout(() => { 
            AbilityLibrary.judgementCut(p); 
            console.log("🎬 WHITE LINES starting during slash animation! ⚔️⚡✨");
          }, 800); // Lines start just 300ms after slashing begins!
          
          // Keep the pause for dramatic effect
          executeJudgmentCut(p);
        } else {
          p.judgmentCutCharging = false;
          p.judgmentCutChargeLevel = 0;
          p.animState = "idle";
          p.animFrame = 0;
          p.animTimer = 0;
        }
      }
      
      if (p.charId === 'vergil' && p.beowulfCharging && p.beowulfChargeType === 'uppercut') {
        const chargeTime = now - p.beowulfChargeStart;
        const minChargeTime = 200;
        if (chargeTime >= minChargeTime) {
          executeBeowulfUppercut(p, chargeTime);
        } else {
          p.beowulfCharging = false;
          p.beowulfChargeType = null;
          p.animState = "idle";
          p.animFrame = 0;
          p.animTimer = 0;
        }
      }

if (p.charId === 'danty' && p.balrogCharging && p.balrogChargeType === 'uppercut') {
  const chargeTime = now - p.balrogChargeStart;
  const minChargeTime = 200;
  if (chargeTime >= minChargeTime) {
    executeBalrogUppercut(p, chargeTime);
  } else {
    p.balrogCharging = false;
    p.balrogChargeType = null;
    p.animState = p.sdtActive ? "sdt-idle" : "idle";
    p.animFrame = 0;
    p.animTimer = 0;
  }
}

         // ADD DEVIL TRIGGER RELEASE HANDLER:
      if (p.charId === 'danty' && p.devilSwordActivating) {
        const holdTime = performance.now() - p.devilSwordActivationStart;
        if (holdTime < DEVIL_SWORD_GAUGE.ACTIVATION_HOLD_TIME) {
          // Released too early
          p.devilSwordActivating = false;
          console.log(`${p.name} released too early! Need to hold longer for Devil Trigger! 😈❌`);
        }
        // If held long enough, activation happens in updatePlayer
      }
      
      // ADD SDT RELEASE HANDLER:
      if (p.charId === 'danty' && p.sdtCharging) {
        const holdTime = performance.now() - p.sdtChargeStart;
        if (holdTime < SIN_DEVIL_TRIGGER.ACTIVATION_HOLD_TIME) {
          // Released too early
          p.sdtCharging = false;
          console.log(`${p.name} released too early! Need to hold longer for Sin Devil Trigger! 😈💀❌`);
        }
        // If held long enough, activation happens in updatePlayer
      }
    }
  }
});

function handleDiveKickAttack() {
  for (let i = 0; i < 2; i++) {
    const p = players[i];
    const opp = players[1 - i];
    if (!p.alive || !opp.alive) continue;

    // Check for dive kicks: Beowulf, Balrog, OR SDT (any weapon)
    const hasBeowulfDive = (p.charId === 'vergil' && p.currentWeapon === VERGIL_WEAPONS.BEOWULF && p.beowulfDiveKick);
    const hasBalrogDive = (p.charId === 'danty' && p.currentWeapon === DANTY_WEAPONS.BALROG && p.balrogDiveKick);
    const hasSDTDive = (p.charId === 'danty' && p.sdtActive && p.balrogDiveKick); // SDT can use divekick with any weapon
    
    if (hasBeowulfDive || hasBalrogDive || hasSDTDive) {
      
      if (p.x < opp.x + opp.w && p.x + p.w > opp.x &&
          p.y < opp.y + opp.h && p.y + p.h > opp.y) {

        if (opp.blocking && opp.block > 0 && opp.onGround && !opp.inHitstun) {
          // Reset the appropriate dive kick
          if (hasBeowulfDive) {
            p.beowulfDiveKick = false;
          } else if (hasBalrogDive || hasSDTDive) {
            p.balrogDiveKick = false;
          }
          
                   p.isDiveKicking = false;
          p.vy = -4;
          p.hitstun = HEAVY_HITSTUN_FRAMES;
          p.inHitstun = true;
          createImpactEffect(opp, p, 'block');
          
          // PARRY SOUND FOR DIVE KICK BLOCK 🛡️🦆🔊
          playParrySound();
          
          const kickType = hasSDTDive ? 'SDT dive kick' : hasBeowulfDive ? 'Beowulf dive kick' : 'Balrog dive kick';
          console.log(`${opp.name} blocked ${p.name}'s ${kickType}! 🛡️${hasSDTDive ? '💀' : ''}`);
               } else {
          // Interrupt any charging
          interruptJudgmentCut(opp);
          interruptDantyCharging(opp);
          
          // Calculate damage (SDT does double damage)
          let damage = 12;
          if (hasSDTDive) {
            damage = Math.floor(12 * SIN_DEVIL_TRIGGER.DAMAGE_MULTIPLIER);
            console.log(`${p.name}'s SDT dive kick deals DOUBLE DAMAGE! ${damage} instead of 12 💀👊💥`);
          }
          
          opp.hp -= damage;
          opp.justHit = 20;
          opp.hitstun = HITSTUN_FRAMES;
          opp.inHitstun = true;
          
          // KNOCKUP EFFECT - same as before
          opp.vy = -10;
          opp.vx = p.facing * 5; // Horizontal knockback
          
          // Reset the appropriate dive kick and choose impact effect
          if (hasBeowulfDive) {
            p.beowulfDiveKick = false;
            createImpactEffect(p, opp, 'beowulf-dash');
            console.log(`${p.name}'s Beowulf dive kick hits ${opp.name}! 💥`);
          } else if (hasSDTDive) {
            p.balrogDiveKick = false;
            createImpactEffect(p, opp, 'sdt-divekick');
            console.log(`${p.name}'s SDT DEVASTATING dive kick hits ${opp.name}! 💀👊💥🔥`);
          } else if (hasBalrogDive) {
            p.balrogDiveKick = false;
            createImpactEffect(p, opp, 'balrog-dash');
            console.log(`${p.name}'s Balrog dive kick hits ${opp.name}! 💥`);
          }
          
          p.isDiveKicking = false;
          
          if (opp.hp <= 0) {
            opp.hp = 0;
            opp.alive = false;
            winner = p.id;
          }
        }
      }
    }
  }
}

// Add this function around line 1202 to handle Danty's dive kick attacks
function handleDantyDiveKickAttack() {
  for (let i = 0; i < 2; i++) {
    const p = players[i];
    const opp = players[1 - i];
    if (!p.alive || !opp.alive) continue;

    if (p.charId === 'danty' && p.currentWeapon === DANTY_WEAPONS.BALROG && p.balrogDiveKick) {
      if (p.x < opp.x + opp.w && p.x + p.w > opp.x &&
          p.y < opp.y + opp.h && p.y + p.h > opp.y) {

        // Blocking condition for Balrog divekick
        if (opp.blocking && opp.block > 0 && opp.onGround && !opp.inHitstun) {
          p.balrogDiveKick = false;
          p.isDiveKicking = false;
          p.vy = -4;
          p.hitstun = HEAVY_HITSTUN_FRAMES;
          p.inHitstun = true;
          createImpactEffect(opp, p, 'block');
          console.log(`${opp.name} blocked ${p.name}'s Balrog dive kick! 🛡️`);
        } else {
          opp.hp -= 12;
          opp.justHit = 20;
          opp.hitstun = HITSTUN_FRAMES;
          opp.inHitstun = true;
          opp.vy = -10;
          
          p.balrogDiveKick = false;
          p.isDiveKicking = false;
          
          createImpactEffect(p, opp, 'balrog-dash');
          console.log(`${p.name}'s Balrog dive kick hits ${opp.name}! 💥`);
          
          if (opp.hp <= 0) {
            opp.hp = 0;
            opp.alive = false;
            winner = p.id;
          }
        }
      }
    }
  }
}

function handleSpectralSwordAttack() {
  for (let i = 0; i < 2; i++) {
    const p = players[i];
    const opp = players[1 - i];
    if (!p.alive || !opp.alive || !p.spectralSword) continue;

    const sword = p.spectralSword;
    if (sword.dash > 0 && !sword.hasDashHit) {
      // Check collision between sword and opponent
      if (sword.x < opp.x + opp.w && sword.x + sword.w > opp.x &&
          sword.y < opp.y + opp.h && sword.y + sword.h > opp.y) {
        
        // Check if opponent is blocking
        const isBlocking = opp.blocking && opp.block > 0 && !opp.inHitstun &&
                          (opp.charId === 'danty' || opp.facing === -Math.sign(sword.vx || sword.facing));
        
        if (isBlocking) {
                  sword.vx = opp.facing * BLOCK_PUSHBACK_X * 0.5;
          sword.vy = BLOCK_PUSHBACK_Y * 0.5;
          sword.hasDashHit = true;
          createImpactEffect(p, opp, 'block');
          
          // PARRY SOUND FOR SPECTRAL SWORD BLOCK 🛡️👻🔊
          playParrySound();
          
          console.log(`${opp.name} blocked ${p.name}'s Spectral Sword! 🛡️👻`);
               } else if (opp.justHit === 0) {
          // Interrupt any charging
          interruptJudgmentCut(opp);
          interruptDantyCharging(opp);
          
          // Spectral sword hits
          let damage = SPECTRAL_SWORD.DASH_DAMAGE;
          if (p.sdtActive) {
            damage = Math.floor(damage * SIN_DEVIL_TRIGGER.DAMAGE_MULTIPLIER);
            console.log(`${p.name}'s SDT Spectral Sword deals DOUBLE DAMAGE! ${damage} 💀👻💥`);
          }
          
          opp.hp -= damage;
          opp.justHit = 20;
          opp.hitstun = HITSTUN_FRAMES;
          opp.inHitstun = true;
          
          // Knockback opponent
          opp.vx = sword.facing * 8;
          opp.vy = -6;
          
          // Slight recoil for sword
          sword.vx *= 0.3;
          sword.vy *= 0.3;
          
          sword.hasDashHit = true;
          createImpactEffect(p, opp, 'spectral-sword-dash');
          console.log(`${p.name}'s Spectral Sword strikes ${opp.name}! 👻⚔️💥`);
          
          if (opp.hp <= 0) {
            opp.hp = 0;
            opp.alive = false;
            winner = p.id;
          }
        }
      }
    }
  }
}

function handleDashAttack() {
  let simultaneousCollision = false;
  let p1 = players[0], p2 = players[1];
  
  if (p1.alive && p2.alive && p1.dash > 0 && p2.dash > 0 && !p1.hasDashHit && !p2.hasDashHit) {
    if (p1.x < p2.x + p2.w && p1.x + p1.w > p2.x && p1.y < p2.y + p2.h && p1.y + p1.h > p2.y) {
      simultaneousCollision = true;
    }
  }
  
  if (simultaneousCollision) {
    handleSimultaneousDashCollision(p1, p2);
    return;
  }
  
  for (let i = 0; i < 2; ++i) {
    let p = players[i], opp = players[1 - i];
    if (!p.alive || !opp.alive) continue;
    
    if (p.dash > 0 && !p.hasDashHit) {
      if (p.x < opp.x + opp.w && p.x + p.w > opp.x && p.y < opp.y + opp.h && p.y + p.h > opp.y) {
        handleSingleDashHit(p, opp);
      }
    }
    if (p.dash === 0) p.hasDashHit = false;
  }
}

function handleSimultaneousDashCollision(p1, p2) {
  console.log("⚡ Simultaneous dash collision detected!");
  
  // Interrupt any charging before checking blocking
  interruptJudgmentCut(p1);
  interruptJudgmentCut(p2);
  interruptDantyCharging(p1);
  interruptDantyCharging(p2);
  
  let p1Blocking = p2.blocking && p2.block > 0 && !p2.dizzy && !p2.inHitstun &&
                     (p2.charId === 'danty' || (p2.facing === -Math.sign(p1.vx || p1.facing)));
 let p2Blocking = p1.blocking && p1.block > 0 && !p1.dizzy && !p1.inHitstun &&
                     (p1.charId === 'danty' || (p1.facing === -Math.sign(p2.vx || p2.facing)));
  
  if (p1Blocking && p2Blocking) {
    p1.hitstun = HEAVY_HITSTUN_FRAMES; // Changed from HITSTUN_FRAMES
    p1.inHitstun = true;
    p2.hitstun = HEAVY_HITSTUN_FRAMES; // Changed from HITSTUN_FRAMES
    p2.inHitstun = true;
    p1.vx = p2.facing * BLOCK_PUSHBACK_X;
    p2.vx = p1.facing * BLOCK_PUSHBACK_X;
    p1.vy = p2.vy = BLOCK_PUSHBACK_Y;
    createImpactEffect(p1, p2, 'block');
    createImpactEffect(p2, p1, 'block');
    
    // DOUBLE PARRY SOUND 🛡️🛡️🔊
    playParrySound();
  } else if (p1Blocking) { // p2's dash was blocked by p1
    p2.hitstun = HEAVY_HITSTUN_FRAMES; // Changed from HITSTUN_FRAMES
    p2.inHitstun = true;
    p2.vx = p1.facing * BLOCK_PUSHBACK_X;
    p2.vy = BLOCK_PUSHBACK_Y;
    createImpactEffect(p2, p1, 'block');
    
    // PARRY SOUND 🛡️🔊
    playParrySound();
  } else if (p2Blocking) { // p1's dash was blocked by p2
    p1.hitstun = HEAVY_HITSTUN_FRAMES; // Changed from HITSTUN_FRAMES
    p1.inHitstun = true;
    p1.vx = p2.facing * BLOCK_PUSHBACK_X;
    p1.vy = BLOCK_PUSHBACK_Y;
    createImpactEffect(p1, p2, 'block');
    
    // PARRY SOUND 🛡️🔊
    playParrySound();
  } else {
    if (p1.justHit === 0 && p2.justHit === 0) {
      p1.hp -= DASH_DAMAGE;
      p2.hp -= DASH_DAMAGE;
      p1.justHit = p2.justHit = 16;
      p1.hitstun = Math.max(p1.hitstun, HITSTUN_FRAMES); // Standard hitstun for clash
      p2.hitstun = Math.max(p2.hitstun, HITSTUN_FRAMES); // Standard hitstun for clash
      p1.inHitstun = p2.inHitstun = true;
      
      const clashKnockback = 25;
      p1.vx = -clashKnockback;
      p2.vx = clashKnockback;
      p1.vy = p2.vy = -8;
      
      createImpactEffect(p1, p2, 'dash');
      createImpactEffect(p2, p1, 'dash');
      
      if (p1.hp <= 0 && p2.hp <= 0) {
        p1.hp = p2.hp = 0;
        p1.alive = p2.alive = false;
        winner = "draw";
        console.log("💀 DOUBLE KO! It's a draw!");
      } else if (p1.hp <= 0) {
        p1.hp = 0;
        p1.alive = false;
        winner = 1;
      } else if (p2.hp <= 0) {
        p2.hp = 0;
        p2.alive = false;
        winner = 0;
      }
      
      console.log("💥 DASH CLASH! Both players take damage!");
    }
  }
  
  p1.hasDashHit = p2.hasDashHit = true;
}

function handleSingleDashHit(p, opp) {
if (p.charId === 'vergil' && p.currentWeapon === VERGIL_WEAPONS.BEOWULF && p.isUppercutting) {
  if (handleBeowulfUppercutHit(p, opp)) {
    p.hasDashHit = true;
    return;
  }
} else if (p.charId === 'danty' && (p.currentWeapon === DANTY_WEAPONS.BALROG || p.sdtActive) && p.isUppercutting) {
  // SDT can use Balrog uppercut with any weapon equipped
  if (handleBalrogUppercutHit(p, opp)) {
    p.hasDashHit = true;
    return;
  }
}
  
const isBlocking = opp.blocking && opp.block > 0 && !opp.inHitstun &&
                   (opp.charId === 'danty' || opp.facing === -Math.sign(p.vx || p.facing));
  
if (isBlocking) {
    // CHECK FOR DEVIL TRIGGER OR PHASE 3 PASS-THROUGH
    if ((p.charId === 'danty' && p.devilSwordUpgraded) || 
        (p.charId === 'danty' && p.currentWeapon === DANTY_WEAPONS.DEVIL_SWORD && p.devilSwordPhase === 3)) {
      
      if (p.devilSwordUpgraded) {
        console.log(`${p.name}'s Devil Trigger passes through ${opp.name}'s block! 😈👻`);
      } else if (p.devilSwordPhase === 3) {
        console.log(`${p.name}'s Devil Sword Phase 3 penetrates through ${opp.name}'s block! ⚔️👻`);
      }
      // Don't return here - continue to damage calculation (this allows pass-through)
    } else {
      interruptJudgmentCut(opp); // The opponent (blocker) might be charging
      p.hitstun = HEAVY_HITSTUN_FRAMES; // Attacker (p) gets HEAVY_HITSTUN_FRAMES, was HITSTUN_FRAMES
      p.inHitstun = true;
      p.vx = opp.facing * BLOCK_PUSHBACK_X;
      p.vy = BLOCK_PUSHBACK_Y;
      p.hasDashHit = true;
      createImpactEffect(p, opp, 'block');
       playParrySound();
      
      // ADD DEVIL SWORD GAUGE GAIN ON SUCCESSFUL BLOCK:
      if (opp.charId === 'danty' && opp.currentWeapon === DANTY_WEAPONS.DEVIL_SWORD && !opp.devilSwordUpgraded) {
        opp.devilSwordGauge += DEVIL_SWORD_GAUGE.BLOCK_GAIN;
        if (opp.devilSwordGauge > DEVIL_SWORD_GAUGE.MAX) opp.devilSwordGauge = DEVIL_SWORD_GAUGE.MAX;
        console.log(`${opp.name} gained Devil Sword power from blocking! Gauge: ${opp.devilSwordGauge.toFixed(0)}% 😈🛡️`);
      }
      
      return;
    }
  }
  
  if (opp.justHit === 0) {
    interruptJudgmentCut(opp);
    
    // Special dramatic effect for spectral sword users
    if (opp.charId === 'danty' && opp.spectralSwordControlling && opp.spectralSword) {
      console.log(`💥 ${p.name} attacks ${opp.name}! The ghost connection wavers! 👻⚡💔`);
    }
    
    interruptDantyCharging(opp); // Add this line! 😈⚔️
let damage = DASH_DAMAGE;
if (p.charId === 'danty' && p.sdtActive) {
  damage = Math.floor(DASH_DAMAGE * SIN_DEVIL_TRIGGER.DAMAGE_MULTIPLIER); // DOUBLE DAMAGE IN SDT 💀💥
  console.log(`${p.name}'s SDT DOUBLE DAMAGE! ${damage} instead of ${DASH_DAMAGE} 💀💥🔥`);
} else if (p.charId === 'danty' && p.devilSwordUpgraded) {
  damage = Math.floor(DASH_DAMAGE * 1.5); // 50% extra damage when upgraded
  console.log(`${p.name}'s upgraded weapon deals extra damage! ${damage} instead of ${DASH_DAMAGE} 😈💥`);
}
opp.hp -= damage;
    opp.justHit = 16;
    opp.hitstun = Math.max(opp.hitstun, HITSTUN_FRAMES); // Opponent takes heavy hitstun on successful hit
       opp.inHitstun = true;
    
    // DEVIL SWORD PROGRESSION AND GAUGE SYSTEM:
    if (p.charId === 'danty' && p.currentWeapon === DANTY_WEAPONS.DEVIL_SWORD) {
      // Update combo progression with cycling 1→2→3→1→2→3
      p.devilSwordComboHits++;
      p.devilSwordLastHitTime = performance.now();
      
      // Calculate current phase (cycles 1→2→3→1→2→3...)
      p.devilSwordPhase = ((p.devilSwordComboHits - 1) % 3) + 1;
      
      // Create appropriate effect and log based on phase
         // Create appropriate effect and log based on phase and enhancement state
      let effectType = "";
      if (p.devilSwordUpgraded) {
        // Enhanced Devil Sword (Devil Trigger mode)
        if (p.devilSwordPhase === 1) {
          effectType = 'devilsword-enhanced-strike1';
          console.log(`${p.name}'s ENHANCED Devil Sword - First Strike! 😈🔥⚔️ (Enhanced Phase 1)`);
        } else if (p.devilSwordPhase === 2) {
          effectType = 'devilsword-enhanced-strike2';
          console.log(`${p.name}'s ENHANCED Devil Sword - Second Strike! 😈🔥⚔️⚔️ (Enhanced Phase 2)`);
        } else if (p.devilSwordPhase === 3) {
          effectType = 'devilsword-enhanced-strike3';
          console.log(`${p.name}'s ENHANCED Devil Sword - DEVASTATING PENETRATION! 😈🔥👻⚔️ (Enhanced Phase 3)`);
        }
      } else {
        // Normal Devil Sword
        if (p.devilSwordPhase === 1) {
          effectType = 'devilsword-strike1';
          console.log(`${p.name}'s Devil Sword - First Strike! 😈⚔️ (Phase 1)`);
        } else if (p.devilSwordPhase === 2) {
          effectType = 'devilsword-strike2';
          console.log(`${p.name}'s Devil Sword - Second Strike! 😈⚔️⚔️ (Phase 2)`);
        } else if (p.devilSwordPhase === 3) {
          effectType = 'devilsword-strike3';
          console.log(`${p.name}'s Devil Sword - PENETRATING STRIKE! Passes through blocks! 😈👻⚔️ (Phase 3)`);
        }
      }
      
      createImpactEffect(p, opp, effectType);
      
      // Gain gauge power (only if not upgraded)
      if (!p.devilSwordUpgraded) {
        p.devilSwordGauge += DEVIL_SWORD_GAUGE.HIT_GAIN;
        if (p.devilSwordGauge > DEVIL_SWORD_GAUGE.MAX) p.devilSwordGauge = DEVIL_SWORD_GAUGE.MAX;
        console.log(`${p.name} gained Devil Sword power! Gauge: ${p.devilSwordGauge.toFixed(0)}%`);
      }
    } else {
      // ADD DEVIL SWORD GAUGE GAIN ON SUCCESSFUL HIT:
      if (p.charId === 'danty' && p.currentWeapon === DANTY_WEAPONS.DEVIL_SWORD && !p.devilSwordUpgraded) {
        p.devilSwordGauge += DEVIL_SWORD_GAUGE.HIT_GAIN;
        if (p.devilSwordGauge > DEVIL_SWORD_GAUGE.MAX) p.devilSwordGauge = DEVIL_SWORD_GAUGE.MAX;
        console.log(`${p.name} gained Devil Sword power from hitting! Gauge: ${p.devilSwordGauge.toFixed(0)}% 😈⚔️`);
      }
    }
    
           if (p.charId === 'vergil' && p.currentWeapon === VERGIL_WEAPONS.YAMATO) {
      createImpactEffect(p, opp, 'dash');
      if (opp.dizzy > 0) {
        opp.vx = p.facing * DIZZY_KNOCKBACK_X;
        opp.vy = DIZZY_KNOCKBACK_Y;
      } else {
        opp.vx = p.facing * 8;
        opp.vy = -8;
      }
      
      // ENABLE STORM SLASHES FOLLOW-UP! ⚡⚔️🌩️
      p.stormSlashesReady = true;
      p.stormSlashesTimer = 90; // 1.5 seconds to use it
      console.log(`${p.name} slashed ${opp.name} with Yamato! ⚔️ - STORM SLASHES READY! ⚡🌩️`);
       } else if (p.charId === 'danty' && p.currentWeapon === DANTY_WEAPONS.DEVIL_SWORD && p.devilSwordPhase === 3) {
      // Special behavior for Devil Sword Phase 3 penetration
      if (p.devilSwordUpgraded) {
        createImpactEffect(p, opp, 'devilsword-enhanced-strike3');
        opp.vx = p.facing * 15; // Even stronger knockback for enhanced phase 3
        opp.vy = -12;
        console.log(`${p.name}'s ENHANCED Devil Sword devastated ${opp.name}! 😈🔥⚔️👻💥`);
      } else {
        createImpactEffect(p, opp, 'devilsword-strike3');
        opp.vx = p.facing * 12; // Stronger knockback for phase 3
        opp.vy = -10;
        console.log(`${p.name}'s Devil Sword penetrated ${opp.name}! ⚔️👻💥`);
      }
    } else {
      // Universal knockback system
      const pushDirection = p.facing;
      if (opp.dizzy > 0) {
        opp.vx = pushDirection * UNIVERSAL_DASH_KNOCKBACK_X * 1.5;
        opp.vy = UNIVERSAL_DASH_KNOCKBACK_Y - 3;
      } else {
        opp.vx = pushDirection * UNIVERSAL_DASH_KNOCKBACK_X;
        opp.vy = UNIVERSAL_DASH_KNOCKBACK_Y;
      }
      
      opp.isBeingKnockedBack = true;
      p.vx *= 0.3;
      
      opp.bounceEffect = {
        duration: 25,
        intensity: Math.abs(opp.vx) * 0.5,
        alpha: 1.0,
        bounceCount: 0,
        maxBounces: 2
      };
      
      if (p.charId === 'vergil' && p.currentWeapon === VERGIL_WEAPONS.BEOWULF) {
        createImpactEffect(p, opp, 'beowulf-dash');
        console.log(`💥 ${p.name} punched ${opp.name} with Beowulf! Force: ${Math.abs(opp.vx).toFixed(1)}`);
      } else {
        createImpactEffect(p, opp, 'dash');
        console.log(`💥 ${p.name} sent ${opp.name} flying! Force: ${Math.abs(opp.vx).toFixed(1)}`);
      }
    }
    
        if (opp.hp <= 0) { 
        opp.hp = 0; 
        opp.alive = false; 
        
        if (p.hp <= 0) {
          p.hp = 0;
          p.alive = false;
          winner = "draw";
          console.log("💀 DOUBLE KO! Both players defeated!");
          // Stop all music for dramatic effect
          if (currentMusic) {
            currentMusic.pause();
          }
        } else {
          winner = p.id;
        }
      }
    p.hasDashHit = true;
  }
}

function updateUI() {
  let p1hp = Math.max(0,players[0].hp)/PLAYER_HP*100;
  let p2hp = Math.max(0,players[1].hp)/PLAYER_HP*100;
  document.querySelector("#p1hp .hp-inner").style.width = p1hp+"%";
  document.querySelector("#p2hp .hp-inner").style.width = p2hp+"%";
  document.getElementById("p1nameui").textContent = players[0].name;
  document.getElementById("p2nameui").textContent = players[1].name;
  document.getElementById("p1nameui").style.color = players[0].color;
  document.getElementById("p2nameui").style.color = players[1].color;
  
  if(winner !== null) {
    if (winner === "draw") {
      document.getElementById("winner").textContent = "DRAW - Both Players Defeated!";
      document.getElementById("winner").style.color = "#ff6b6b";
    } else {
      document.getElementById("winner").textContent = `Winner: ${players[winner].name || `Player ${winner+1}`}`;
      document.getElementById("winner").style.color = "#ffeb3b";
    }
  } else {
    document.getElementById("winner").textContent = "";
  }
  
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
  if (player.charId !== 'vergil') {
    particles.push({
      type: "smoke",
      x: player.x + player.w/2,
      y: player.y + player.h,
      life: 20
    });
  }
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
    } else if (e.type === "explosion") {
      ctx.save();
      ctx.globalAlpha = e.life/25 * 0.8;
      ctx.fillStyle = "#ff6b35";
      ctx.strokeStyle = "#ffeb3b";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(e.x, e.y, 8, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      e.x += e.vx;
      e.y += e.vy;
      e.vy += 0.3;
      ctx.restore();
    }
  }
}

const platforms = [];

function updatePlayer(p, pid) {
  if (p.pauseTimer > 0) {
    p.pauseTimer--;
    return;
  }
  
  // Allow basic physics even when dead/game over
  if (!p.alive) {
    // Still apply gravity and ground collision for dramatic effect
    p.vy += GRAVITY;
    p.y += p.vy;
    
    // Ground collision
    if (p.y + p.h >= FLOOR_HEIGHT) {
      p.y = FLOOR_HEIGHT - p.h;
      p.vy = 0;
      p.onGround = true;
    }
    
    // Platform collision
    for (let plat of platforms) {
      if (p.vy >= 0 && p.x + p.w > plat.x && p.x < plat.x + plat.w && p.y + p.h > plat.y && p.y + p.h - p.vy <= plat.y + 3) {
        p.y = plat.y - p.h;
        p.vy = 0;
        p.onGround = true;
      }
    }
    
    // Keep them within screen bounds
    if (p.y < 0) { p.y = 0; p.vy = 0; }
    
    return; // Exit early, no other updates needed for dead players
  }

 if (p.charId === 'vergil') {
    if (p.judgementCutCooldown > 0) p.judgementCutCooldown--;
    
    // Handle Beowulf recovery state
    if (p.beowulfRecovering) {
      p.beowulfRecoveryTimer--;
      if (p.beowulfRecoveryTimer <= 0) {
        p.beowulfRecovering = false;
        p.animState = "idle";
        p.animFrame = 0;
        p.animTimer = 0;
        console.log(`${p.name} finished recovering from dive kick!`);
      } else {
        // During recovery, player can't move or act
        p.vx *= 0.7;
        if (Math.abs(p.vx) < 0.1) p.vx = 0;
        p.vy += GRAVITY;
        p.y += p.vy;
        
        if (p.y + p.h >= FLOOR_HEIGHT) {
          p.y = FLOOR_HEIGHT - p.h;
          p.vy = 0;
          p.onGround = true;
        }
        
        return;
      }
    }
    
    // ADD BEOWULF UPDATES
    if (p.beowulfDiveKick) {
      handleBeowulfDiveKick(p);
    }
    
     // MAINTAIN SUPER DIAGONAL MOMENTUM
    if (p.isDiveKicking && p.beowulfDiveKick) {
      // Keep VERY strong diagonal movement during dive
      p.vy = Math.max(p.vy, 14); // Faster downward speed
      p.vx = p.beowulfDiveDirection * 16; // Much stronger horizontal speed
    }
    
    if (p.isUppercutting && p.dash <= 0) {
      p.isUppercutting = false;
      p.uppercutPower = 0;
    }

    if (p.judgmentCutCharging) {
        const chargeTime = performance.now() - p.judgmentCutChargeStart;
        p.judgmentCutChargeLevel = Math.min(chargeTime / JUDGMENT_CUT_CHARGE.MAX_CHARGE_TIME, 1.0);
    }
    
    if (p.teleportTrail && p.teleportTrail.duration > 0) {
        p.teleportTrail.duration--;
        p.teleportTrail.alpha *= 0.92;
        if (p.teleportTrail.duration <= 0) p.teleportTrail = null;
    }
    
    if (p.isTeleporting) {
        if (p.dash > 0) {
            p.teleportAlpha = 0.2 + 0.3 * Math.sin(performance.now() / 50);
        } else {
            p.teleportAlpha += 0.15;
            if (p.teleportAlpha >= 1.0) {
                p.teleportAlpha = 1.0;
                p.isTeleporting = false;
            }
        }
    }

    if (p.judgementCutEffect) {
        const effect = p.judgementCutEffect;
        
if (effect.phase === 'slide') {
    const t = performance.now() - effect.startTime;
    
    for (let s of effect.shards) {
        s.x += s.vx * JUDGEMENT_CUT_CONSTANTS.SLIDE_SPEED;
        s.y += s.vy * JUDGEMENT_CUT_CONSTANTS.SLIDE_SPEED;
        s.angle += s.vangle * JUDGEMENT_CUT_CONSTANTS.SLIDE_SPEED;
    }
    
    if (t > JUDGEMENT_CUT_CONSTANTS.SLIDE_DURATION) {
        effect.phase = 'fall';
        
        dealJudgmentCutDamage(effect);
        
        for (let s of effect.shards) {
            s.vy = JUDGEMENT_CUT_CONSTANTS.FALL_INITIAL_VY + Math.random()*2;
            s.vx = (Math.random()-0.5) * JUDGEMENT_CUT_CONSTANTS.FALL_VX_RANGE;
        }
    }
} else if (effect.phase === 'fall') {
            for (let s of effect.shards) {
                s.x += s.vx;
                s.y += s.vy;
                s.vy += s.g;
                s.angle += s.vangle;
            }
            const maxY = effect.viewHeight + 100;
            if (effect.shards.every(s => s.y > maxY)) {
                p.judgementCutEffect = null;
            }
        }
    }

      // UPDATE STORM SLASHES! ⚡🌩️
    if (p.stormSlashesReady) {
      p.stormSlashesTimer--;
      if (p.stormSlashesTimer <= 0) {
        p.stormSlashesReady = false;
        console.log(`${p.name}'s Storm Slashes opportunity expired! ⚡⏰`);
      }
    }
    
    if (p.stormSlashesActive) {
      p.stormSlashesDuration--;
      if (p.stormSlashesDuration <= 0) {
        p.stormSlashesActive = false;
        p.stormSlashesTarget = null;
        console.log(`${p.name}'s Storm Slashes ended! ⚡✨`);
      } else {
        // Deal damage to target if still in range
        const target = p.stormSlashesTarget;
        if (target && target.alive) {
          const dx = Math.abs(target.x + target.w/2 - (p.x + p.w/2));
          const dy = Math.abs(target.y + target.h/2 - (p.y + p.h/2));
          
          if (dx <= 250 && dy <= 120) {
            // Deal damage every 10 frames (6 times per second)
            if (p.stormSlashesDuration % 10 === 0) {
              target.hp -= 1; // Small but continuous damage
              target.justHit = 5;
              console.log(`${target.name} takes STORM SLASHES damage! Current HP: ${target.hp} ⚡💥`);
              
              if (target.hp <= 0) {
                target.hp = 0;
                target.alive = false;
                winner = p.id;
                p.stormSlashesActive = false;
                console.log(`${target.name} was defeated by STORM SLASHES! ⚡💀`);
              }
            }
          }
        }
      }
    }

    if (p.charId === 'vergil' && (p.judgementCutPhase === VERGIL_JUDGMENT_CUT_PHASES.SLASHING || 
                                  p.judgementCutPhase === VERGIL_JUDGMENT_CUT_PHASES.SHEATHING ||
                                  p.judgmentCutCharging ||
                                  p.stormSlashesActive)) {
      return;
    }
  }
  // Add after the Vergil updates section
if (p.charId === 'danty') {
  // Handle Balrog recovery state
  if (p.balrogRecovering) {
    p.balrogRecoveryTimer--;
    if (p.balrogRecoveryTimer <= 0) {
      p.balrogRecovering = false;
      p.animState = "idle";
      p.animFrame = 0;
      p.animTimer = 0;
      console.log(`${p.name} finished recovering from Balrog dive kick!`);
    } else {
      // During recovery, player can't move or act
      p.vx *= 0.7;
      if (Math.abs(p.vx) < 0.1) p.vx = 0;
      p.vy += GRAVITY;
      p.y += p.vy;
      
      if (p.y + p.h >= FLOOR_HEIGHT) {
        p.y = FLOOR_HEIGHT - p.h;
        p.vy = 0;
        p.onGround = true;
      }
      
      return;
    }
  }
  
  // ADD BALROG UPDATES
  if (p.balrogDiveKick) {
    handleBalrogDiveKick(p);
  }
  
  // MAINTAIN SUPER DIAGONAL MOMENTUM for Balrog
  // MAINTAIN SUPER DIAGONAL MOMENTUM for Balrog
  if (p.isDiveKicking && p.balrogDiveKick) {
    // Keep VERY strong diagonal movement during dive
    p.vy = Math.max(p.vy, 14); // Faster downward speed
    p.vx = p.balrogDiveDirection * 16; // Much stronger horizontal speed
  }
}

// ADD THIS ENTIRE DANTY SECTION HERE:
if (p.charId === 'danty') {
  // Handle Balrog recovery state
  if (p.balrogRecovering) {
    p.balrogRecoveryTimer--;
    if (p.balrogRecoveryTimer <= 0) {
      p.balrogRecovering = false;
      p.animState = "idle";
      p.animFrame = 0;
      p.animTimer = 0;
      console.log(`${p.name} finished recovering from Balrog dive kick!`);
    } else {
      // During recovery, player can't move or act
      p.vx *= 0.7;
      if (Math.abs(p.vx) < 0.1) p.vx = 0;
      p.vy += GRAVITY;
      p.y += p.vy;
      
      if (p.y + p.h >= FLOOR_HEIGHT) {
        p.y = FLOOR_HEIGHT - p.h;
        p.vy = 0;
        p.onGround = true;
      }
      
      return;
    }
  }
  
  // ADD BALROG UPDATES
  if (p.balrogDiveKick) {
    handleBalrogDiveKick(p);
  }
  
  // MAINTAIN SUPER DIAGONAL MOMENTUM for Balrog
  if (p.isDiveKicking && p.balrogDiveKick) {
    // Keep VERY strong diagonal movement during dive
    p.vy = Math.max(p.vy, 14); // Faster downward speed
    p.vx = p.balrogDiveDirection * 16; // Much stronger horizontal speed
  }
  
  if (p.isUppercutting && p.dash <= 0) {
    p.isUppercutting = false;
    p.uppercutPower = 0;
  }
}

// DEVIL SWORD GAUGE SYSTEM:
if (p.charId === 'danty') {
  // Handle Devil Sword upgrade state
  if (p.devilSwordUpgraded) {
    p.devilSwordUpgradeTimer--;
    if (p.devilSwordUpgradeTimer <= 0) {
      p.devilSwordUpgraded = false;
      p.devilSwordGauge = 0;
      console.log(`${p.name}'s Devil Trigger has ended! 😈➡️⚔️`);
    }
  }
  
  // Handle manual activation
  if (p.devilSwordActivating) {
    const holdTime = performance.now() - p.devilSwordActivationStart;
    if (holdTime >= DEVIL_SWORD_GAUGE.ACTIVATION_HOLD_TIME && p.devilSwordGauge >= DEVIL_SWORD_GAUGE.MAX && !p.devilSwordUpgraded) {
      // Activate Devil Trigger
      p.devilSwordUpgraded = true;
      p.devilSwordUpgradeTimer = DEVIL_SWORD_GAUGE.UPGRADE_DURATION;
      p.devilSwordActivating = false;
      p.devilSwordGauge = DEVIL_SWORD_GAUGE.MAX; // Keep gauge full during activation
      console.log(`${p.name} activated DEVIL TRIGGER! 😈🔥💀`);
    }
  }
  
   // PASSIVE GAUGE REGENERATION (only when not upgraded and gauge not full)
  if (!p.devilSwordUpgraded && p.devilSwordGauge < DEVIL_SWORD_GAUGE.MAX && !p.sdtActive) {
    p.devilSwordGauge += DEVIL_SWORD_GAUGE.PASSIVE_REGEN;
    if (p.devilSwordGauge > DEVIL_SWORD_GAUGE.MAX) {
      p.devilSwordGauge = DEVIL_SWORD_GAUGE.MAX;
    }
  }
  
  // SIN DEVIL TRIGGER SYSTEM
  if (p.sdtActive) {
    p.sdtTimer--;
    if (p.sdtTimer <= 0) {
      p.sdtActive = false;
      p.sdtAnimationPhase = null;
      p.devilSwordUpgraded = false; // End Devil Trigger too
      p.devilSwordGauge = 0;
      p.sdtGauge = 0;
      console.log(`${p.name}'s Sin Devil Trigger has ended! Back to mortal form... 😈➡️👤`);
    }
  }
  
  // SDT charging system
  if (p.sdtCharging) {
    const holdTime = performance.now() - p.sdtChargeStart;
    if (holdTime >= SIN_DEVIL_TRIGGER.ACTIVATION_HOLD_TIME && !p.sdtActive) {
      // Start SDT activation sequence
      p.sdtCharging = false;
      p.sdtAnimationPhase = 'sword_falling';
      p.sdtSwordX = p.x + p.w/2;
      p.sdtSwordY = p.y + SIN_DEVIL_TRIGGER.PIERCE_OFFSET_Y;
      console.log(`${p.name} UNLEASHES SIN DEVIL TRIGGER! 😈💀🔥⚡`);
    }
  }
  
  // SDT Animation phases
  if (p.sdtAnimationPhase === 'sword_falling') {
    p.sdtSwordY += SIN_DEVIL_TRIGGER.SWORD_FALL_SPEED;
    if (p.sdtSwordY >= p.y + p.h/2) {
      p.sdtAnimationPhase = 'piercing';
      p.sdtExplosionTimer = SIN_DEVIL_TRIGGER.EXPLOSION_DURATION;
      console.log(`${p.name} is pierced by the Sin Devil Sword! 💀⚔️💥`);
    }
  } else if (p.sdtAnimationPhase === 'piercing') {
    p.sdtExplosionTimer--;
    if (p.sdtExplosionTimer <= 0) {
      p.sdtAnimationPhase = 'active';
          p.sdtActive = true;
      p.sdtTimer = SIN_DEVIL_TRIGGER.SDT_DURATION;
      p.devilSwordUpgraded = true; // Keep Devil Trigger active during SDT
      console.log(`${p.name} has transformed into SIN DEVIL TRIGGER! ULTIMATE POWER UNLEASHED! 😈💀🔥👹`);
      
               // SDT activated - just let the default music keep rocking! 💀🎵
      console.log(`${p.name} has transformed into SIN DEVIL TRIGGER! ULTIMATE POWER UNLEASHED! 😈💀🔥👹`);
    }
  }
  
  // SDT gauge charging (fixed) - only when Devil Trigger is active and holding special
  if (p.devilSwordUpgraded && p.currentWeapon === DANTY_WEAPONS.DEVIL_SWORD && p.sdtGauge < SIN_DEVIL_TRIGGER.GAUGE_MAX && !p.sdtActive) {
    // Check if special key is being held down
    const specialKey = pid === 0 ? 'e' : 'p';
    if (keys[specialKey]) {
      p.sdtGauge += SIN_DEVIL_TRIGGER.CHARGE_RATE;
      if (p.sdtGauge > SIN_DEVIL_TRIGGER.GAUGE_MAX) {
        p.sdtGauge = SIN_DEVIL_TRIGGER.GAUGE_MAX;
      }
      // Only log occasionally to avoid spam
      if (Math.floor(p.sdtGauge) % 10 === 0) {
        console.log(`${p.name} is charging SDT gauge: ${p.sdtGauge.toFixed(0)}% 😈💀`);
      }
    }
  }
  
  // Handle Devil Sword combo system
  if (p.currentWeapon === DANTY_WEAPONS.DEVIL_SWORD) {
    const now = performance.now();
    // Reset combo if too much time passed
    if (now - p.devilSwordLastHitTime > DEVIL_SWORD_PROGRESSION.HIT_COMBO_RESET_TIME) {
      p.devilSwordComboHits = 0;
      p.devilSwordPhase = 0;
    }
  }
    
   if (p.spectralSwordTransferring) {
    p.spectralSwordTransferTimer--;
    if (p.spectralSwordTransferTimer <= 0) {
      p.spectralSwordTransferring = false;
      p.spectralSwordControlling = true;
      p.animState = "controlling-spectral";
      p.animFrame = 0;
      p.animTimer = 0;
      console.log(`${p.name} now controls the Spectral Sword! Camera following the ghost! 👻⚔️🎮📹`);
    }
  }
  
  if (p.spectralSword) {
    const sword = p.spectralSword;
    
        // Update spectral sword physics
    sword.x += sword.vx;
    sword.y += sword.vy;
    
    // Keep sword within screen bounds
    sword.x = Math.max(0, Math.min(WIDTH - sword.w, sword.x));
    sword.y = Math.max(0, Math.min(HEIGHT - sword.h, sword.y));
    
    // Update base position for floating effect
    sword.baseY = sword.y;
    
    // Floating animation (subtle up/down bobbing)
    sword.floatTimer += 1;
    const floatOffset = Math.sin(sword.floatTimer * 0.1) * 3; // Smaller float effect
    
    // Spectral Sword Animation States 👻⚔️
    if (sword.dash > 0) {
      sword.animState = "dash";
    } else if (Math.abs(sword.vx) > 0.5 || Math.abs(sword.vy) > 0.5) {
      sword.animState = "walk";
    } else {
      sword.animState = "idle";
    }
    
    // Update spectral sword animation
    updateSpectralSwordAnimation(sword);
    
    // Update sword dash
    if (sword.dash > 0) {
      sword.dash--;
    } else {
      sword.hasDashHit = false;
    }
    
    if (sword.dashCooldown > 0) sword.dashCooldown--;
    
    // Drain gauge continuously
    if (p.currentWeapon === DANTY_WEAPONS.SPECTRAL_SWORD) {
      p.devilSwordGauge -= SPECTRAL_SWORD.GAUGE_DRAIN;
      if (p.devilSwordGauge <= 0) {
        p.devilSwordGauge = 0;
        destroySpectralSword(p);
        console.log(`${p.name}'s Spectral Sword ran out of power! 👻💨⚡`);
      }
    }
  }
}

  const controls = pid === 0 ? {left: 'a', right: 'd', up: 'w', down: 's'} : {left: 'k', right: ';', up: 'o', down: 'l'};

  if (updateBlocking(p, pid)) return;

// Update hitstun
if (p.inHitstun) {
  if (p.hitstun > 0) {
    p.hitstun--;
  }
  
  // If we're in air hitstun from uppercut, only end it when we land
  if (p.airHitstun) {
    if (p.onGround) {
      // Player has landed, end the hitstun
      p.inHitstun = false;
      p.airHitstun = false;
      p.hitstun = 0; // Reset hitstun counter
      console.log(`${p.name} recovered from uppercut stun after landing!`);
    }
    // Don't decrement hitstun counter for air hitstun - it only ends on landing
  } else if (p.hitstun <= 0) {
    // Normal ground hitstun ends when counter reaches 0
    p.inHitstun = false;
  }
}

  if (p.dash > 0) {
    p.dash--;
  } else {
        // SPECTRAL SWORD CONTROL OVERRIDE 👻⚔️
  if (p.charId === 'danty' && p.spectralSwordControlling && p.spectralSword) {
    // Danty is frozen while controlling spectral sword
    p.vx *= FRICTION;
    if (Math.abs(p.vx) < 0.3) p.vx = 0;
    
    // Control the spectral sword instead
    const sword = p.spectralSword;
    const swordMoveSpeed = SPECTRAL_SWORD.MOVE_SPEED;
    
    if (keys[controls.left] && !keys[controls.right]) {
      sword.vx = -swordMoveSpeed;
      sword.facing = -1;
    } else if (keys[controls.right] && !keys[controls.left]) {
      sword.vx = swordMoveSpeed;
      sword.facing = 1;
    } else {
      sword.vx *= FRICTION;
      if (Math.abs(sword.vx) < 0.3) sword.vx = 0;
    }
    
      if (keys[controls.up] && !keys[controls.down]) {
      sword.vy = -swordMoveSpeed;
      // Debug message (remove later)
      if (Math.random() < 0.005) console.log(`${p.name}'s Spectral Sword ascending! Camera tracking! ⬆️👻📹`);
    } else if (keys[controls.down] && !keys[controls.up]) {
      sword.vy = swordMoveSpeed;
      // Debug message (remove later)
      if (Math.random() < 0.005) console.log(`${p.name}'s Spectral Sword descending! Camera tracking! ⬇️👻📹`);
    } else {
      sword.vy *= FRICTION;
      if (Math.abs(sword.vy) < 0.3) sword.vy = 0;
    }
  }
  // NORMAL PLAYER MOVEMENT
  else if (!p.inHitstun) {
    // SDT SPEED BOOST 🔥⚡
    const moveSpeed = (p.charId === 'danty' && p.sdtActive) ? PLAYER_SPEED * SIN_DEVIL_TRIGGER.SPEED_MULTIPLIER : PLAYER_SPEED;
    
    if (keys[controls.left] && !keys[controls.right] && !p.blocking && !p.inHitstun) {
      p.vx = -moveSpeed; p.facing = -1;
    }
    if (keys[controls.right] && !keys[controls.left] && !p.blocking && !p.inHitstun) {
      p.vx = moveSpeed; p.facing = 1;
    }
    if ((!keys[controls.left] && !keys[controls.right]) || p.blocking) {
      p.vx *= FRICTION;
      if (Math.abs(p.vx) < 0.3) p.vx = 0;
    }
  } else {
    // During hitstun, only apply friction to knockback velocity
    p.vx *= FRICTION;
    if (Math.abs(p.vx) < 0.3) p.vx = 0;
  }
  }

  let slowFallActive = false;
  if (!p.onGround && keys[controls.up]) slowFallActive = true;
  
  // SPECTRAL SWORD CONTROL: Don't let Danty jump while controlling sword
  if (p.charId === 'danty' && p.spectralSwordControlling && p.spectralSword) {
    // Danty can't jump while controlling spectral sword
    p.jumpHeld = false;
  } else {
    // Normal jump controls for player
    if (keys[controls.up] && !p.inHitstun) {
      if ((p.onGround || p.jumps < MAX_JUMPS) && !p.jumpHeld && !p.blocking) {
        p.vy = -JUMP_VEL; p.jumps++; p.jumpHeld = true;
      }
    } else {
      p.jumpHeld = false;
    }
  }

  if (p.dashCooldown > 0) p.dashCooldown--;

     if (slowFallActive && p.vy > 0) {
    p.vy += GRAVITY * SLOW_FALL_MULTIPLIER;
  } else {
    // SDT FLOATING EFFECT 🛸💀 (only when falling, not jumping)
    if (p.charId === 'danty' && p.sdtActive && p.vy > 0) {
      // Reduced gravity only when falling down for floating effect
      p.vy += GRAVITY * SIN_DEVIL_TRIGGER.GRAVITY_REDUCTION;
    } else {
      // Normal gravity for jumping up and non-SDT
      p.vy += GRAVITY;
    }
  }

  p.x += p.vx;
  p.y += p.vy;

  p.x = Math.max(0, Math.min(WIDTH - p.w, p.x));
  p.onGround = false;

  if (p.y + p.h >= FLOOR_HEIGHT) {
    p.y = FLOOR_HEIGHT - p.h;
    
    // Add ground bounce if being knocked back
    if (p.isBeingKnockedBack && Math.abs(p.vy) > 5) {
      p.vy = -p.vy * 0.4; // Bounce off ground
      if (p.bounceEffect && p.bounceEffect.bounceCount < p.bounceEffect.maxBounces) {
        p.bounceEffect.bounceCount++;
        console.log(`${p.name} bounced off the ground!`);
      }
    } else {
      p.vy = 0;
    }
    
    p.onGround = true;
    p.jumps = 0;
  } else {
    for (let plat of platforms) {
      if (p.vy >= 0 && p.x + p.w > plat.x && p.x < plat.x + plat.w && p.y + p.h > plat.y && p.y + p.h - p.vy <= plat.y + 3) {
        p.y = plat.y - p.h;
        
        // Add platform bounce if being knocked back
        if (p.isBeingKnockedBack && Math.abs(p.vy) > 5) {
          p.vy = -p.vy * 0.3; // Smaller bounce than ground
          if (p.bounceEffect && p.bounceEffect.bounceCount < p.bounceEffect.maxBounces) {
            p.bounceEffect.bounceCount++;
          }
        } else {
          p.vy = 0;
        }
        
        p.onGround = true;
        p.jumps = 0;
      }
    }
  }
  if (p.y < 0) { p.y = 0; p.vy = 0; }
    // Handle bounce physics
  if (p.isBeingKnockedBack) {
    p.vx *= BOUNCE_FRICTION;
    if (Math.abs(p.vx) < 2) {
      p.isBeingKnockedBack = false;
    }
  }
  
  // Update bounce effect
  if (p.bounceEffect) {
    p.bounceEffect.duration--;
    p.bounceEffect.alpha *= 0.9;
    p.bounceEffect.intensity *= 0.95;
    if (p.bounceEffect.duration <= 0) {
      p.bounceEffect = null;
    }
  }
}

function getAnimForPlayer(p) {
  let charAnim = characterSprites[p.charId];
  if (!charAnim) return null;
  
  // SDT ANIMATIONS OVERRIDE EVERYTHING 💀🔥
  if (p.charId === 'danty' && p.sdtActive) {
    const sdtAnimState = `sdt-${p.animState}`;
    if (charAnim[sdtAnimState]) {
      return charAnim[sdtAnimState];
    }
  }
  
  if (p.charId === 'vergil' && p.currentWeapon === VERGIL_WEAPONS.BEOWULF) {
    const beowulfAnimState = `beowulf-${p.animState}`;
    if (charAnim[beowulfAnimState]) {
      return charAnim[beowulfAnimState];
    }
  }


if (p.charId === 'danty' && p.currentWeapon === DANTY_WEAPONS.BALROG) {
  const balrogAnimState = `balrog-${p.animState}`;
  if (charAnim[balrogAnimState]) {
    return charAnim[balrogAnimState];
  }
}
  
  return charAnim[p.animState];
}

function updatePlayerAnimState(p, pid) {
  const prevState = p.animState;
  const other = players[1 - pid];
  
  if (p.charId === 'vergil' && p.judgmentCutCharging) {
      // Handle recovery state first
  if (p.beowulfRecovering) {
    if (p.animState !== "beowulf-recovery") {
      p.animState = "beowulf-recovery";
      p.animFrame = 0;
      p.animTimer = 0;
    }
    return;
  }
    if (!p.onGround) {
      interruptJudgmentCut(p);
      return;
    }
    
    if (p.animState !== "charging") {
      p.animState = "charging";
      p.animFrame = 0;
      p.animTimer = 0;
    }
    return;
  }

  if (p.charId === 'vergil' && p.beowulfCharging && p.beowulfChargeType === 'uppercut') {
    if (!p.onGround) {
      p.beowulfCharging = false;
      p.beowulfChargeType = null;
      return;
    }
    
    if (p.animState !== "beowulf-charging") {
      p.animState = "beowulf-charging";
      p.animFrame = 0;
      p.animTimer = 0;
    }
    return;
  }
  
  if (p.charId === 'vergil' && p.judgementCutPhase === VERGIL_JUDGMENT_CUT_PHASES.SHEATHING) {
    if (p.animState !== "sheathing") {
      p.animState = "sheathing";
      p.animFrame = 0;
      p.animTimer = 0;
    }
    return;
  }

    if (p.charId === 'danty') {
    // Handle recovery state first
    if (p.balrogRecovering) {
      if (p.animState !== "balrog-recovery") {
        p.animState = "balrog-recovery";
        p.animFrame = 0;
        p.animTimer = 0;
      }
      return;
    }

     // Handle SDT charging animation
    if (p.sdtCharging) {
      if (p.animState !== "transferring-control") {
        p.animState = "idle"; // Vulnerable while charging!
        p.animFrame = 0;
        p.animTimer = 0;
      }
      return;
    }
    
    // Handle Devil Trigger charging animation
    if (p.devilSwordActivating) {
      if (p.animState !== "transferring-control") {
        p.animState = "idle"; // Vulnerable while charging!
        p.animFrame = 0;
        p.animTimer = 0;
      }
      return;
    }
  }
  
  if (p.alive && other && !other.alive && getAnimForPlayer({...p, animState:"victory"})) {
    p.animState = "victory"; return;
  }
  if (!p.alive) { p.animState = "defeat"; return; }
  if (p.dizzy > 0) { p.animState = "dizzy"; return; }
  if (p.justHit > 0) { p.animState = "hit"; return; }
  
  if (p.blocking) { 
    const blockAnim = getAnimForPlayer({...p, animState: "block"});
    if (blockAnim && p.animState === "block") {
      const timeSinceBlockStart = performance.now() - p.blockStartTime;
      const blockAnimDuration = blockAnim.frames * blockAnim.speed * (1000/60);
      
      if (timeSinceBlockStart >= blockAnimDuration) {
        p.blockAnimationFinished = true;
      }
    }
    
    if (p.blockAnimationFinished) {
      p.animState = "blocking";
    } else {
      p.animState = "block";
    }
    return; 
  }
  
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

function updateSpectralSwordAnimation(sword) {
  const anim = characterSprites.spectralSword?.[sword.animState];
  if (!anim) { sword.animFrame = 0; sword.animTimer = 0; return; }
  
  sword.animTimer++;
  if (sword.animTimer >= anim.speed) {
    sword.animTimer = 0;
    sword.animFrame = (sword.animFrame + 1) % anim.frames;
  }
}

function getSpectralSwordAnim(sword) {
  return characterSprites.spectralSword?.[sword.animState];
}

function updateAnimation(p) {
  const anim = getAnimForPlayer(p);
  if (!anim) { p.animFrame = 0; p.animTimer = 0; return; }
  
  if (!p.prevAnimFrameCount) p.prevAnimFrameCount = anim.frames;
  
  if (p.prevAnimFrameCount !== anim.frames) {
    p.animFrame = 0;
    p.animTimer = 0;
    p.prevAnimFrameCount = anim.frames;
  }
  
  if (p.animState === "block") {
    p.animTimer++;
    if (p.animTimer >= anim.speed) {
      p.animTimer = 0;
      if (p.animFrame < anim.frames - 1) {
        p.animFrame++;
      }
    }
    return;
  }
  
  if (p.animState === "blocking") {
    p.animTimer++;
    if (p.animTimer >= anim.speed) {
      p.animTimer = 0;
      p.animFrame = (p.animFrame + 1) % anim.frames;
    }
    return;
  }
  
  p.animTimer++;
  if (p.animTimer >= anim.speed) {
    p.animTimer = 0;
    p.animFrame = (p.animFrame + 1) % anim.frames;
  }
}

// Load images
const mirageSlashSprite = new Image(); 
mirageSlashSprite.src = 'void-slash.png'

const blockBarBorderImg = new Image();
blockBarBorderImg.src = "gold-block-border.png";

const bgImg = new Image();
bgImg.src = "underground.jpg";

const vergilTeleportTrailSprite = new Image();
vergilTeleportTrailSprite.src = "vergil-teleport-trail.png";

const vergilSlashingSprite = new Image();
vergilSlashingSprite.src = "vergil-judgment-cut-slashes.png"; 

const vergilStormSlashesSprite = new Image();
vergilStormSlashesSprite.src = "vergil-storm-slashes.png"; 

const devilSwordStrike1Sprite = new Image();
devilSwordStrike1Sprite.src = "danty-devilsword-strike1.png";

const devilSwordStrike2Sprite = new Image();
devilSwordStrike2Sprite.src = "danty-devilsword-strike2.png";

const devilSwordStrike3Sprite = new Image();
devilSwordStrike3Sprite.src = "danty-devilsword-strike3.png";

const devilSwordEnhancedStrike1Sprite = new Image();
devilSwordEnhancedStrike1Sprite.src = "danty-devilsword-enhanced-strike1.png";

const devilSwordEnhancedStrike2Sprite = new Image();
devilSwordEnhancedStrike2Sprite.src = "danty-devilsword-enhanced-strike2.png";

const devilSwordEnhancedStrike3Sprite = new Image();
devilSwordEnhancedStrike3Sprite.src = "danty-devilsword-enhanced-strike3.png";

const sdtSwordSprite = new Image();
sdtSwordSprite.src = "danty-sdt-sword-pierce.png"; // The sword that falls and pierces Danty 🥵

// Spectral Sword sprites
const spectralSwordIdleSprite = new Image();
spectralSwordIdleSprite.src = "danty-spectral-sword-idle.png";

const spectralSwordDashSprite = new Image();
spectralSwordDashSprite.src = "danty-spectral-sword-dash.png";

const spectralSwordImpactSprite = new Image();
spectralSwordImpactSprite.src = "danty-spectral-sword-impact.png";

const dantyControllingSprite = new Image();
dantyControllingSprite.src = "danty-controlling-spectral.png";

// Spectral Sword animation sprites
const spectralSwordMoveSprite = new Image();
spectralSwordMoveSprite.src = "danty-spectral-sword-move.png";

// SOUND EFFECTS 🔊🔥//
const parrySound = new Audio();
parrySound.src = "sounds/parry.ogg";
parrySound.volume = 1.0; // Adjust volume as needed

// SIMPLE DEFAULT MUSIC SYSTEM 🎵🔥
const defaultFightMusic = new Audio();
defaultFightMusic.src = "sounds/default-fight-music.ogg"; // or .mp3
defaultFightMusic.volume = 0.3; // Good volume for battle
defaultFightMusic.loop = true;

// VERGIL'S LEGENDARY JUDGMENT CUT SOUND! ⚡⚔️🎵
const judgmentCutSound = new Audio();
judgmentCutSound.src = "sounds/iamthestormthatisapproaching.ogg";
judgmentCutSound.volume = 0.8; // EPIC VOLUME! 🔥
// No loop - let it play until it naturally ends! 🎭

let musicInitialized = false;

// SDT exclusive sprites
const sdtIdleSprite = new Image();
sdtIdleSprite.src = "danty-sdt-idle.png";

const sdtWalkSprite = new Image();
sdtWalkSprite.src = "danty-sdt-walk.png";

const sdtDashSprite = new Image();
sdtDashSprite.src = "danty-sdt-dash.png";

const sdtUppercutSprite = new Image();
sdtUppercutSprite.src = "danty-sdt-uppercut.png";

const sdtDivekickSprite = new Image();
sdtDivekickSprite.src = "danty-sdt-divekick.png";

const sdtJumpSprite = new Image();
sdtJumpSprite.src = "danty-sdt-jump.png";

const sdtFallSprite = new Image();
sdtFallSprite.src = "danty-sdt-fall.png";

const characterSprites = {
  gold: {
    idle: { src: "gold-idle.png", frames: 5, w: 50, h: 50, speed: 13 },
    walk: { src: "gold-walk.png", frames: 10, w: 50, h: 50, speed: 4 },
    jump: { src: "gold-jump.png", frames: 3, w: 50, h: 50, speed: 6 },
    fall: { src: "gold-fall.png", frames: 1, w: 50, h: 50, speed: 7 },
    attack: { src: "gold-attack.png", frames: 3, w: 38, h: 38, speed: 2 },
    attack_air: { src: "gold-attack-air.png", frames: 2, w: 38, h: 38, speed: 2 },
    block: { src: "gold-block.png", frames: 2, w: 38, h: 38, speed: 6 },
    hit: { src: "gold-hit.png", frames: 2, w: 38, h: 38, speed: 8 },
    dizzy: { src: "gold-dizzy.png", frames: 3, w: 38, h: 38, speed: 8 },
    dash: { src: "gold-dash.png", frames: 2, w: 50, h: 50, speed: 3 },
    defeat: { src: "gold-defeat.png", frames: 1, w: 38, h: 38, speed: 10 },
    victory: { src: "gold-victory.png", frames: 6, w: 38, h: 38, speed: 6 }
  },
  chicken: {
    idle: { src: "chicken-idle.png", frames: 5, w: 50, h: 50, speed: 13 },
    walk: { src: "chicken-walk.png", frames: 7, w: 50, h: 50, speed: 4 },
    jump: { src: "chicken-jump.png", frames: 4, w: 50, h: 50, speed: 6 },
    fall: { src: "chicken-fall.png", frames: 3, w: 50, h: 50, speed: 15 },
    attack: { src: "chicken-attack.png", frames: 3, w: 38, h: 38, speed: 2 },
    attack_air: { src: "chicken-attack-air.png", frames: 2, w: 38, h: 38, speed: 2 },
    block: { src: "chicken-block.png", frames: 2, w: 50, h: 50, speed: 11 },
    hit: { src: "chicken-hit.png", frames: 3, w: 50, h: 50, speed: 8 },
    dizzy: { src: "chicken-dizzy.png", frames: 3, w: 38, h: 38, speed: 8 },
    dash: { src: "chicken-dash.png", frames: 3, w: 50, h: 50, speed: 4 },
    defeat: { src: "chicken-defeat.png", frames: 1, w: 38, h: 38, speed: 10 },
    victory: { src: "chicken-victory.png", frames: 6, w: 38, h: 38, speed: 6 }
  },
  vergil: {
    // Yamato sprites
    idle: { src: "vergil-idle.png", frames: 8, w: 100, h: 100, speed: 12 },
    dash: { src: "vergil-dash.png", frames: 3, w: 100, h: 100, speed: 4 },
    walk: { src: "vergil-walk.png", frames: 3, w: 100, h: 100, speed: 6 },
    block: { src: "vergil-block.png", frames: 4, w: 100, h: 100, speed: 6 },
    blocking: { src: "vergil-blocking.png", frames: 3, w: 100, h: 100, speed: 8 },
    jump: { src: "vergil-idle.png", frames: 8, w: 100, h: 100, speed: 12 },
    fall: { src: "vergil-idle.png", frames: 8, w: 100, h: 100, speed: 12 },
    sheathing: { src: "vergil-idle.png", frames: 6, w: 100, h: 100, speed: 8 }, 
    slashing: { src: "vergil-judgment-cut-slashes.png", frames: 10, w: 200, h: 200, speed: 8 },
      'storm-slashes': { src: "vergil-storm-slashes.png", frames: 10, w: 200, h: 200, speed: 10 }, 
    charging: { src: "vergil-idle.png", frames: 8, w: 100, h: 100, speed: 10 },
    // Beowulf sprites
    'beowulf-idle': { src: "vergil-idle.png", frames: 6, w: 100, h: 100, speed: 12 },
    'beowulf-dash': { src: "vergil-beowulf-dash.png", frames: 4, w: 100, h: 100, speed: 3 },
    'beowulf-walk': { src: "vergil-beowulf-walk.png", frames: 4, w: 100, h: 100, speed: 6 },
    'beowulf-block': { src: "vergil-beowulf-block.png", frames: 3, w: 100, h: 100, speed: 6 },
    'beowulf-blocking': { src: "vergil-beowulf-blocking.png", frames: 2, w: 100, h: 100, speed: 8 },
    'beowulf-jump': { src: "vergil-beowulf-idle.png", frames: 6, w: 100, h: 100, speed: 12 },
    'beowulf-fall': { src: "vergil-beowulf-idle.png", frames: 6, w: 100, h: 100, speed: 12 },
    'beowulf-charging': { src: "vergil-beowulf-charging.png", frames: 4, w: 100, h: 100, speed: 8 },
    'beowulf-uppercut': { src: "vergil-beowulf-uppercut.png", frames: 5, w: 100, h: 100, speed: 3 },
    'beowulf-divekick': { src: "vergil-idle.png", frames: 3, w: 100, h: 100, speed: 4 },
    'beowulf-recovery': { src: "vergil-beowulf-recovery.png", frames: 4, w: 100, h: 100, speed: 8 },
    // Mirage Blade sprites
    'mirage-idle': { src: "vergil-mirage-idle.png", frames: 6, w: 100, h: 100, speed: 12 },
    'mirage-dash': { src: "vergil-mirage-dash.png", frames: 4, w: 100, h: 100, speed: 3 },
    'mirage-walk': { src: "vergil-mirage-walk.png", frames: 4, w: 100, h: 100, speed: 6 },
  },
 danty: {
  idle: { src: "danty-idle.png", frames: 5, w: 50, h: 50, speed: 13 },
  walk: { src: "danty-walk.png", frames: 10, w: 50, h: 50, speed: 4 },
  jump: { src: "danty-jump.png", frames: 3, w: 50, h: 50, speed: 6 },
  fall: { src: "danty-fall.png", frames: 1, w: 50, h: 50, speed: 7 },
  attack: { src: "danty-attack.png", frames: 3, w: 38, h: 38, speed: 2 },
  attack_air: { src: "danty-attack-air.png", frames: 2, w: 38, h: 38, speed: 2 },
  block: { src: "danty-block.png", frames: 2, w: 38, h: 38, speed: 6 },
  blocking: { src: "danty-blocking.png", frames: 2, w: 38, h: 38, speed: 8 },
  hit: { src: "danty-hit.png", frames: 2, w: 38, h: 38, speed: 8 },
  dizzy: { src: "danty-dizzy.png", frames: 3, w: 38, h: 38, speed: 8 },
  dash: { src: "danty-dash.png", frames: 2, w: 50, h: 50, speed: 3 },
  defeat: { src: "danty-defeat.png", frames: 1, w: 38, h: 38, speed: 10 },
  victory: { src: "danty-victory.png", frames: 6, w: 38, h: 38, speed: 6 },
  // Balrog sprites
  'balrog-charging': { src: "danty-balrog-charging.png", frames: 4, w: 50, h: 50, speed: 8 },
  'balrog-uppercut': { src: "danty-balrog-uppercut.png", frames: 5, w: 50, h: 50, speed: 3 },
  'balrog-divekick': { src: "danty-balrog-divekick.png", frames: 3, w: 50, h: 50, speed: 4 },
  'balrog-recovery': { src: "danty-balrog-recovery.png", frames: 4, w: 50, h: 50, speed: 8 },
  // SDT EXCLUSIVE SPRITES 
  'sdt-idle': { src: "danty-sdt-idle.png", frames: 8, w: 60, h: 60, speed: 10 },
  'sdt-walk': { src: "danty-sdt-walk.png", frames: 12, w: 60, h: 60, speed: 3 },
  'sdt-dash': { src: "danty-sdt-dash.png", frames: 4, w: 60, h: 60, speed: 2 },
  'sdt-jump': { src: "danty-sdt-jump.png", frames: 4, w: 60, h: 60, speed: 5 },
  'sdt-fall': { src: "danty-sdt-fall.png", frames: 3, w: 60, h: 60, speed: 6 },
  'sdt-uppercut': { src: "danty-sdt-uppercut.png", frames: 6, w: 60, h: 60, speed: 2 },
  'sdt-divekick': { src: "danty-sdt-divekick.png", frames: 5, w: 60, h: 60, speed: 3 },
  'sdt-charging': { src: "danty-sdt-charging.png", frames: 5, w: 60, h: 60, speed: 6 },
    // Spectral Sword control animation
  'controlling-spectral': { src: "danty-controlling-spectral.png", frames: 8, w: 50, h: 50, speed: 8 },
  'transferring-control': { src: "danty-transferring-control.png", frames: 6, w: 50, h: 50, speed: 5 }
},

// SPECTRAL SWORD ENTITY ANIMATIONS 👻⚔️
spectralSword: {
  idle: { src: "danty-spectral-sword-idle.png", frames: 6, w: 40, h: 40, speed: 12 },
  walk: { src: "danty-spectral-sword-move.png", frames: 8, w: 40, h: 40, speed: 6 },
  dash: { src: "danty-spectral-sword-dash.png", frames: 4, w: 40, h: 40, speed: 3 }
},
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

// Player initialization
const players = [
  {
    x: WIDTH/3, y: GROUND-PLAYER_SIZE, vx: 0, vy: 0, w: PLAYER_SIZE, h: PLAYER_SIZE,
    color: "#4a90e2", facing: 1, hp: PLAYER_HP, jumps: 0, dash: 0,
    dashCooldown: 0, onGround: false, jumpHeld: false, alive: true, id: 0, 
    name: "Vergil", charId: "vergil", animState: "idle", animFrame: 0, animTimer: 0,
    justHit: 0, maxBlock: BLOCK_MAX, block: BLOCK_MAX, blocking: false, dizzy: 0, blockGlowTimer: 0,
    blockWasFull: false, judgementCutCooldown: 0, hasDashHit: false, 
    blockAnimationFinished: false, blockStartTime: 0, judgementCutPhase: null, 
    isInvisibleDuringJudgmentCut: false, slashAnimationFrame: 0, slashAnimationTimer: 0, 
    judgmentCutCharging: false, judgmentCutChargeStart: 0, judgmentCutChargeLevel: 0,
    currentWeapon: VERGIL_WEAPONS.YAMATO, bounceEffect: null, isBeingKnockedBack: false,
    sdtSwordY: 0,
sdtSwordX: 0,
sdtExplosionTimer: 0,
// Spectral Sword properties
spectralSword: null, // The floating sword entity
spectralSwordControlling: false, // Is Danty controlling the sword
spectralSwordTransferring: false, // Is control being transferred
spectralSwordTransferTimer: 0, // Transfer animation timer
    hitstun: 0, inHitstun: false, airHitstun: false,
    beowulfCharging: false, beowulfChargeStart: 0, beowulfChargeType: null,
    beowulfDiveKick: false, beowulfDiveDirection: 1, beowulfImpactRadius: 80,
    beowulfRecovering: false, beowulfRecoveryTimer: 0,
    balrogCharging: false, balrogChargeStart: 0, balrogChargeType: null,
    balrogDiveKick: false, balrogDiveDirection: 1, balrogImpactRadius: 80,
    balrogRecovering: false, balrogRecoveryTimer: 0,
    isDiveKicking: false, isUppercutting: false, uppercutPower: 0,
     mirageActive: false, mirageTimer: 0, mirageDuration: MIRAGE_BLADE_CONFIG.DURATION, pauseTimer: 0,
    mirageSlashX: 0, mirageSlashY: 0, mirageSlashW: 0, mirageSlashH: 0, 
    mirageHasHit: false, mirageMaxTimer: 0, teleportTrail: null, isTeleporting: false,
        // STORM SLASHES ABILITY! ⚡⚔️🌩️
    stormSlashesReady: false,
    stormSlashesTimer: 0,
    stormSlashesActive: false,
    stormSlashesAnimationFrame: 0,
    stormSlashesAnimationTimer: 0,
    stormSlashesDuration: 0,
    stormSlashesTarget: null,
    teleportAlpha: 1.0,
 devilSwordGauge: 0,
devilSwordUpgraded: false,
devilSwordUpgradeTimer: 0,
devilSwordActivating: false,
devilSwordActivationStart: 0,
devilSwordComboHits: 0,
devilSwordLastHitTime: 0,
devilSwordPhase: 0,
// Sin Devil Trigger properties
sdtGauge: 0,
sdtActive: false,
sdtTimer: 0,
sdtCharging: false,
sdtChargeStart: 0,
sdtAnimationPhase: null, // 'sword_falling', 'piercing', 'explosion', 'active'
  },
  {
    x: 2*WIDTH/3, y: GROUND-PLAYER_SIZE, vx: 0, vy: 0, w: PLAYER_SIZE, h: PLAYER_SIZE,
    color: "#ef5350", facing: -1, hp: PLAYER_HP, jumps: 0, dash: 0,
    dashCooldown: 0, onGround: false, jumpHeld: false, alive: true, id: 1,
    name: "Danty", charId: "danty", animState: "idle", animFrame: 0, animTimer: 0,
    justHit: 0, maxBlock: BLOCK_MAX * 0.7, block: BLOCK_MAX * 0.7, blocking: false, dizzy: 0, blockGlowTimer: 0,
    blockWasFull: false, judgementCutCooldown: 0, hasDashHit: false,
    blockAnimationFinished: false, blockStartTime: 0, judgementCutPhase: null,
    isInvisibleDuringJudgmentCut: false, slashAnimationFrame: 0, slashAnimationTimer: 0,
    judgmentCutCharging: false, judgmentCutChargeStart: 0, judgmentCutChargeLevel: 0,
    currentWeapon: DANTY_WEAPONS.DEVIL_SWORD, bounceEffect: null, isBeingKnockedBack: false,
        // STORM SLASHES ABILITY! ⚡⚔️🌩️
    stormSlashesReady: false,
    stormSlashesTimer: 0,
    stormSlashesActive: false,
    stormSlashesAnimationFrame: 0,
    stormSlashesAnimationTimer: 0,
    stormSlashesDuration: 0,
    stormSlashesTarget: null,
devilSwordGauge: 0,
devilSwordUpgraded: false,
devilSwordUpgradeTimer: 0,
devilSwordActivating: false,
devilSwordActivationStart: 0,
devilSwordComboHits: 0,
devilSwordLastHitTime: 0,
devilSwordPhase: 0,
// Sin Devil Trigger properties
sdtGauge: 0,
sdtActive: false,
sdtTimer: 0,
sdtCharging: false,
sdtChargeStart: 0,
sdtAnimationPhase: null, // 'sword_falling', 'piercing', 'explosion', 'active'
sdtSwordY: 0,
sdtSwordX: 0,
sdtExplosionTimer: 0,
// Spectral Sword properties
spectralSword: null, // The floating sword entity
spectralSwordControlling: false, // Is Danty controlling the sword
spectralSwordTransferring: false, // Is control being transferred
spectralSwordTransferTimer: 0, // Transfer animation timer
    hitstun: 0, inHitstun: false, airHitstun: false,
    beowulfCharging: false, beowulfChargeStart: 0, beowulfChargeType: null,
    beowulfDiveKick: false, beowulfDiveDirection: 1, beowulfImpactRadius: 80,
    beowulfRecovering: false, beowulfRecoveryTimer: 0,
    balrogCharging: false, balrogChargeStart: 0, balrogChargeType: null,
    balrogDiveKick: false, balrogDiveDirection: 1, balrogImpactRadius: 80,
    balrogRecovering: false, balrogRecoveryTimer: 0,
    isDiveKicking: false, isUppercutting: false, uppercutPower: 0,
    mirageActive: false, mirageTimer: 0, mirageDuration: MIRAGE_BLADE_CONFIG.DURATION, pauseTimer: 0,
    mirageSlashX: 0, mirageSlashY: 0, mirageSlashW: 0, mirageSlashH: 0, 
    mirageHasHit: false, mirageMaxTimer: 0, teleportTrail: null, isTeleporting: false,
    teleportAlpha: 1.0
  }
];
let winner = null;
let rangeWarningText = { show: false, timer: 0 };

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function draw() {
  const camera = getCamera();
  
  let applyBWEffect = false;
  for (let player of players) {
    if (player.charId === 'vergil' && player.judgementCutPhase === VERGIL_JUDGMENT_CUT_PHASES.SLASHING) {
      applyBWEffect = true;
    }
    
    if (player.judgementCutEffect && 
        (player.judgementCutEffect.phase === 'lines' || 
         player.judgementCutEffect.phase === 'preparing' ||
         player.judgementCutEffect.phase === 'slide')) {
      applyBWEffect = true;
    }
  }
  
  ctx.save();
  if (applyBWEffect) {
    ctx.filter = "grayscale(100%) contrast(105%) brightness(1.1) sepia(100%) hue-rotate(160deg)";
  }
  ctx.clearRect(0,0,WIDTH,HEIGHT);
  ctx.translate(WIDTH/2, HEIGHT/2);
  ctx.scale(camera.zoom, camera.zoom);
  ctx.translate(-camera.cx, -camera.cy);

  // Background
  if (bgImg.complete && bgImg.naturalWidth > 0) {
    ctx.drawImage(bgImg, 0, 0, WIDTH, HEIGHT);
  } else {
    ctx.fillStyle = "#181c24";
    ctx.fillRect(0,0,WIDTH,HEIGHT);
  }

  ctx.fillStyle = "#6d4c41";
  ctx.fillRect(0, FLOOR_HEIGHT, WIDTH, HEIGHT-FLOOR_HEIGHT);
  
  drawParticles(ctx);

  // Blue overlay during special phases
  let showBlueOverlay = false;
  for (let player of players) {
    if (player.charId === 'vergil' && player.judgementCutPhase === VERGIL_JUDGMENT_CUT_PHASES.SLASHING) {
      showBlueOverlay = true;
    }
    
    if (player.judgementCutEffect && player.judgementCutEffect.phase === 'lines') {
      showBlueOverlay = true;
    }
  }

  if (showBlueOverlay) {
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.restore();
  }

         // Draw slashing animation - MASSIVE SCALE! 💥⚔️
  for (let player of players) {
        if (player.charId === 'vergil' && 
      (player.judgementCutPhase === VERGIL_JUDGMENT_CUT_PHASES.SLASHING || 
       (player.judgementCutEffect && player.judgementCutEffect.phase === 'lines'))) {
      // Show slashes DURING both slashing phase AND lines phase! ⚔️✨
      ctx.save();
      
      if (vergilSlashingSprite.complete && vergilSlashingSprite.naturalWidth > 0) {
        const slashAnim = characterSprites.vergil.slashing;
        if (slashAnim) {
          const frameWidth = vergilSlashingSprite.naturalWidth / slashAnim.frames;
          const frameHeight = vergilSlashingSprite.naturalHeight;
          
          // EPIC SCALING! 🔥💥
          const massiveScale = PLAYER_SIZE * 8; // Was 5, now 12! MUCH BIGGER! 💥
          const spriteWidth = massiveScale;
          const spriteHeight = massiveScale;
          
          const spriteX = player.x + player.w/2 - spriteWidth/2;
          const spriteY = player.y + player.h/2 - spriteHeight/2;
          
          ctx.drawImage(
            vergilSlashingSprite, 
            frameWidth * player.slashAnimationFrame, 0, 
            frameWidth, frameHeight, 
            spriteX, spriteY, 
            spriteWidth, spriteHeight
          );

        }
      }
      
      ctx.restore();
    }
  }

 
  for (let player of players) {
    if (player.charId === 'vergil' && player.stormSlashesActive) {
      ctx.save();
      
      if (vergilStormSlashesSprite.complete && vergilStormSlashesSprite.naturalWidth > 0) {
        const stormAnim = characterSprites.vergil['storm-slashes'];
        if (stormAnim) {
          const frameWidth = vergilStormSlashesSprite.naturalWidth / stormAnim.frames;
          const frameHeight = vergilStormSlashesSprite.naturalHeight;

          const stormScale = PLAYER_SIZE * 3; 
          const spriteWidth = stormScale;
          const spriteHeight = stormScale;
          
          const spriteX = player.x + player.w/2 - spriteWidth/2;
          const spriteY = player.y + player.h/2 - spriteHeight/2;
          
          ctx.drawImage(
            vergilStormSlashesSprite, 
            frameWidth * player.stormSlashesAnimationFrame, 0, 
            frameWidth, frameHeight, 
            spriteX, spriteY, 
            spriteWidth, spriteHeight
          );
          
   
        }
      } 
      
      ctx.restore();
    }
  }

  // Draw players
  for(let i=0; i<players.length; i++) {
    let p = players[i];
    if(!p.alive && getAnimForPlayer(p) && p.animState !== "defeat") continue;

    if (p.charId === 'vergil' && p.isInvisibleDuringJudgmentCut) {
      continue;
    }

    // Draw teleport trail
    if (p.charId === 'vergil' && p.teleportTrail && p.teleportTrail.duration > 0) {
      ctx.save();
      ctx.globalAlpha = p.teleportTrail.alpha;
      
      if (vergilTeleportTrailSprite.complete && vergilTeleportTrailSprite.naturalWidth > 0) {
        ctx.drawImage(vergilTeleportTrailSprite, p.teleportTrail.x, p.teleportTrail.y, p.w, p.h);
      } else {
        ctx.fillStyle = "#1a1a2e";
        ctx.fillRect(p.teleportTrail.x, p.teleportTrail.y, p.w, p.h);
        ctx.strokeStyle = "#4a90e2";
        ctx.lineWidth = 2;
        ctx.strokeRect(p.teleportTrail.x, p.teleportTrail.y, p.w, p.h);
      }
      
      ctx.restore();
    }

    // Draw arrow above player
    ctx.save();
    ctx.beginPath();
    let arrowCenterX = p.x + p.w/2;
    let arrowTipY = p.y - 12;
    let arrowHeight = 8, arrowWidth = 16;
    ctx.moveTo(arrowCenterX, arrowTipY);
    ctx.lineTo(arrowCenterX - arrowWidth/2, arrowTipY - arrowHeight);
    ctx.lineTo(arrowCenterX + arrowWidth/2, arrowTipY - arrowHeight);
    ctx.closePath();
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = i === 0 ? "#42a5f5" : "#ef5350";
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1;
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

    // Draw block effect
    if (p.blocking && p.block > 0) {
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = "#b0bec5";
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.roundRect(p.x-4, p.y-4, p.w+8, p.h+8, 18);
      ctx.stroke();
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
      ctx.restore();
    }

    let anim = getAnimForPlayer(p);
    let spritesheet = anim && spritesheetCache[anim.src];
    
    ctx.save();
    
    // Apply teleport transparency
    if (p.charId === 'vergil' && p.teleportAlpha < 1.0) {
      ctx.globalAlpha = p.teleportAlpha;
    }
    
    // Red damage flicker
    if (p.justHit > 0 || p.inHitstun) {
      const flickerIntensity = Math.sin(performance.now() / 100) > 0 ? 1 : 0;
      if (flickerIntensity > 0) {
        ctx.filter = "saturate(0) sepia(1) saturate(5) hue-rotate(315deg) brightness(1.1)";
      }
    }
    
    if (anim && spritesheet && spritesheet.complete && spritesheet.naturalWidth > 0) {
      const scaleX = p.w / anim.w;
      const scaleY = p.h / anim.h;
      
      if (p.facing === 1) {
        ctx.save();
        ctx.translate(p.x + p.w/2, p.y + p.h/2);
        ctx.scale(-scaleX, scaleY);
        ctx.translate(-anim.w/2, -anim.h/2);
        ctx.drawImage(spritesheet, anim.w * p.animFrame, 0, anim.w, anim.h, 0, 0, anim.w, anim.h);
        ctx.restore();
      } else {
        ctx.drawImage(spritesheet, anim.w * p.animFrame, 0, anim.w, anim.h, p.x, p.y, p.w, p.h);
      }
    } else {
      // Fallback colored rectangle
      if (p.justHit > 0 || p.inHitstun) {
        const flickerIntensity = Math.sin(performance.now() / 80) > 0 ? 1 : 0;
        ctx.fillStyle = flickerIntensity > 0 ? "#ff4444" : p.color;
      } else {
        ctx.fillStyle = p.color;
      }
      
      ctx.strokeStyle = PLAYER_OUTLINE;
      ctx.lineWidth = 3;
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.strokeRect(p.x, p.y, p.w, p.h);
    }
    
    // Teleport effect particles
    if (p.charId === 'vergil' && p.isTeleporting && p.dash > 0) {
      for (let j = 0; j < 4; j++) {
        const offsetX = (Math.random() - 0.5) * 25;
        const offsetY = (Math.random() - 0.5) * 25;
        ctx.globalAlpha = 0.4 * Math.random();
        ctx.fillStyle = "#1a1a2e";
        ctx.fillRect(p.x + offsetX, p.y + offsetY, 6, 6);
      }
    }
    
    ctx.restore();

    // Draw bounce effect
    if (p.bounceEffect) {
      ctx.save();
      ctx.globalAlpha = p.bounceEffect.alpha * 0.6;
      
      for (let i = 0; i < 3; i++) {
        const waveRadius = (p.bounceEffect.intensity + i * 8) * (1 - p.bounceEffect.duration / 25);
        ctx.strokeStyle = i === 0 ? "#ffeb3b" : i === 1 ? "#ff9800" : "#f44336";
        ctx.lineWidth = 3 - i;
        ctx.beginPath();
        ctx.arc(p.x + p.w/2, p.y + p.h/2, waveRadius, 0, 2 * Math.PI);
        ctx.stroke();
      }
      
      ctx.restore();
    }
    
       // Draw player name and weapon indicator
    if (p.name) {
      ctx.save();
      
      // DEVIL TRIGGER BAR (above name)
      if (p.charId === 'danty') {
        const devilBarWidth = p.w;
        const devilBarHeight = 6;
        const devilBarX = p.x;
        const devilBarY = p.y - 45; // Above the name
        const devilGaugeRatio = p.devilSwordGauge / DEVIL_SWORD_GAUGE.MAX;
        
        // Background
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = "#000";
        ctx.fillRect(devilBarX, devilBarY, devilBarWidth, devilBarHeight);
        
        // Gauge fill
        ctx.globalAlpha = 0.9;
        if (p.devilSwordUpgraded) {
          // Active Devil Trigger - pulsing red/orange
          const pulse = 0.8 + 0.2 * Math.sin(performance.now() / 100);
          ctx.fillStyle = `rgba(255, ${Math.floor(69 * pulse)}, 0, ${pulse})`;
        } else if (p.devilSwordActivating) {
          // Activating - pulsing yellow
          const pulse = 0.6 + 0.4 * Math.sin(performance.now() / 80);
          ctx.fillStyle = `rgba(255, 255, 0, ${pulse})`;
        } else {
          // Normal - dark red
          ctx.fillStyle = "#8b0000";
        }
        ctx.fillRect(devilBarX, devilBarY, devilBarWidth * devilGaugeRatio, devilBarHeight);
        
        // Border
        ctx.globalAlpha = 1;
        ctx.strokeStyle = p.devilSwordUpgraded ? "#ff4500" : (p.devilSwordActivating ? "#ffff00" : "#666");
        ctx.lineWidth = 1;
        ctx.strokeRect(devilBarX, devilBarY, devilBarWidth, devilBarHeight);
        
        // Devil Trigger label
        if (p.devilSwordUpgraded) {
          ctx.font = "bold 8px Arial";
          ctx.textAlign = "center";
          ctx.fillStyle = "#ff4500";
          ctx.strokeStyle = "#000";
          ctx.lineWidth = 1;
          ctx.strokeText("SIN DEVIL SWORD", p.x + p.w/2, devilBarY - 2);
          ctx.fillText("SIN DEVIL SWORD", p.x + p.w/2, devilBarY - 2);
        } else if (p.devilSwordActivating) {
          ctx.font = "bold 8px Arial";
          ctx.textAlign = "center";
          ctx.fillStyle = "#ffff00";
          ctx.strokeStyle = "#000";
          ctx.lineWidth = 1;
          ctx.strokeText("ACTIVATING...", p.x + p.w/2, devilBarY - 2);
          ctx.fillText("ACTIVATING...", p.x + p.w/2, devilBarY - 2);
               }
        
        // SDT GAUGE BAR (above Devil Trigger bar)
        if (p.devilSwordUpgraded || p.sdtGauge > 0) {
          const sdtBarWidth = p.w;
          const sdtBarHeight = 4;
          const sdtBarX = p.x;
          const sdtBarY = p.y - 55; // Above the Devil Trigger bar
          const sdtGaugeRatio = p.sdtGauge / SIN_DEVIL_TRIGGER.GAUGE_MAX;
          
          // Background
          ctx.globalAlpha = 0.8;
          ctx.fillStyle = "#000";
          ctx.fillRect(sdtBarX, sdtBarY, sdtBarWidth, sdtBarHeight);
          
          // Gauge fill
          ctx.globalAlpha = 1.0;
          if (p.sdtActive) {
            // Active SDT - pulsing purple/red
            const pulse = 0.9 + 0.1 * Math.sin(performance.now() / 80);
            ctx.fillStyle = `rgba(139, 0, 139, ${pulse})`;
          } else if (p.sdtCharging) {
            // Charging SDT - pulsing dark red
            const pulse = 0.7 + 0.3 * Math.sin(performance.now() / 60);
            ctx.fillStyle = `rgba(75, 0, 130, ${pulse})`;
          } else {
            // Normal - dark purple
            ctx.fillStyle = "#4b0082";
          }
          ctx.fillRect(sdtBarX, sdtBarY, sdtBarWidth * sdtGaugeRatio, sdtBarHeight);
          
          // Border
          ctx.strokeStyle = p.sdtActive ? "#8b008b" : (p.sdtCharging ? "#4b0082" : "#333");
          ctx.lineWidth = 1;
          ctx.strokeRect(sdtBarX, sdtBarY, sdtBarWidth, sdtBarHeight);
          
          // SDT label
          if (p.sdtActive) {
            ctx.font = "bold 7px Arial";
            ctx.textAlign = "center";
            ctx.fillStyle = "#8b008b";
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 1;
            ctx.strokeText("SIN DEVIL TRIGGER", p.x + p.w/2, sdtBarY - 2);
            ctx.fillText("SIN DEVIL TRIGGER", p.x + p.w/2, sdtBarY - 2);
          } else if (p.sdtCharging) {
            ctx.font = "bold 7px Arial";
            ctx.textAlign = "center";
            ctx.fillStyle = "#4b0082";
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 1;
            ctx.strokeText("CHARGING SDT...", p.x + p.w/2, sdtBarY - 2);
            ctx.fillText("CHARGING SDT...", p.x + p.w/2, sdtBarY - 2);
          }
        }
      }
      
      // Player name
      ctx.font = "bold 15px Arial";
      ctx.textAlign = "center";
      ctx.strokeStyle = "#23243a";
      ctx.lineWidth = 3;
      ctx.strokeText(p.name, p.x + p.w/2, p.y - 28);
      ctx.fillStyle = p.color;
      ctx.fillText(p.name, p.x + p.w/2, p.y - 28);
      
      // Weapon indicator for Vergil
      if (p.charId === 'vergil') {
        let weaponText = "⚔️"; // Default Yamato
        if (p.currentWeapon === VERGIL_WEAPONS.BEOWULF) {
          weaponText = "👊";
        } else if (p.currentWeapon === VERGIL_WEAPONS.MIRAGE_BLADE) {
          weaponText = "🗡️";
        }
        
        ctx.font = "12px Arial";
        ctx.strokeText(weaponText, p.x + p.w/2, p.y - 12);
        ctx.fillStyle = "#fff";
        ctx.fillText(weaponText, p.x + p.w/2, p.y - 12);
      }

// Weapon indicator for Danty
else if (p.charId === 'danty') {
  let weaponText = "🗡️"; // Default Devil Sword
  if (p.currentWeapon === DANTY_WEAPONS.BALROG) {
    weaponText = "👊";
  } else if (p.currentWeapon === DANTY_WEAPONS.SPECTRAL_SWORD) {
    weaponText = "👻⚔️";
  }
  
  ctx.font = "12px Arial";
  ctx.strokeText(weaponText, p.x + p.w/2, p.y - 12);
  ctx.fillStyle = "#fff";
  ctx.fillText(weaponText, p.x + p.w/2, p.y - 12);

  if (p.currentWeapon === DANTY_WEAPONS.DEVIL_SWORD && p.devilSwordComboHits > 0) {
    ctx.font = "bold 10px Arial";
    let comboText = "";
    let comboColor = "#fff";
    
    if (p.devilSwordPhase === 1) {
      comboText = "★ PHASE 1";
      comboColor = "#ffeb3b";
    } else if (p.devilSwordPhase === 2) {
      comboText = "★★ PHASE 2";
      comboColor = "#ff9800";
    } else if (p.devilSwordPhase === 3) {
      comboText = "★★★ PENETRATE";
      comboColor = "#f44336";
    }
    
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.strokeText(comboText, p.x + p.w/2, p.y + 5);
    ctx.fillStyle = comboColor;
    ctx.fillText(comboText, p.x + p.w/2, p.y + 5);
  }
}
      
      ctx.restore();
    }

    // Draw block bar
    const barWidth = p.w;
    const barHeight = 10;
    const barX = p.x;
    const barY = p.y + p.h + 8;
    const blockRatio = Math.max(0, p.block) / p.maxBlock;

    ctx.save();
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = "#222";
    ctx.fillRect(barX, barY, barWidth, barHeight);

    ctx.globalAlpha = 0.95;
    ctx.fillStyle = "#bbb";
    ctx.fillRect(barX, barY, barWidth * blockRatio, barHeight);

    if (blockBarBorderImg.complete && blockBarBorderImg.naturalWidth > 0) {
      ctx.globalAlpha = 1;
      ctx.drawImage(blockBarBorderImg, barX-2, barY-2, barWidth+4, barHeight+4);
    } else {
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "#bbb";
      ctx.lineWidth = 2.5;
      ctx.strokeRect(barX, barY, barWidth, barHeight);
    }

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

    // Block label
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "#bbb";
    ctx.globalAlpha = 0.84;
    ctx.fillText("Block", barX + barWidth/2, barY + barHeight + 12);
  ctx.globalAlpha = 1;
ctx.restore();

  }
  
   // Draw Mirage Blade slash - WITH FADE EFFECT! ✨
  for (let p of players) {
    if (p.charId === 'vergil' && p.mirageActive) {
      ctx.save();
      
      const img = mirageSlashSprite;
      const slashW = p.mirageSlashW || MIRAGE_BLADE_CONFIG.WIDTH;
      const slashH = p.mirageSlashH || MIRAGE_BLADE_CONFIG.HEIGHT;
      
      // Calculate fade effect based on remaining time
      const timeProgress = 1 - (p.mirageTimer / (p.mirageMaxTimer || MIRAGE_BLADE_CONFIG.DURATION));
      
      // Alpha fade: starts strong, fades to weak
      const alpha = MIRAGE_BLADE_CONFIG.ALPHA_START + 
                   (MIRAGE_BLADE_CONFIG.ALPHA_END - MIRAGE_BLADE_CONFIG.ALPHA_START) * timeProgress;
      
      // Scale effect: starts normal, grows slightly
      const scale = MIRAGE_BLADE_CONFIG.SCALE_START + 
                   (MIRAGE_BLADE_CONFIG.SCALE_END - MIRAGE_BLADE_CONFIG.SCALE_START) * timeProgress;
      
      ctx.globalAlpha = alpha;
      
      // Apply scaling from center
      const centerX = p.mirageSlashX + slashW/2;
      const centerY = p.mirageSlashY + slashH/2;
      const scaledW = slashW * scale;
      const scaledH = slashH * scale;
      const scaledX = centerX - scaledW/2;
      const scaledY = centerY - scaledH/2;
      
      ctx.drawImage(img, scaledX, scaledY, scaledW, scaledH);
      
      // Add glow effect for extra epicness! 🌟
      if (timeProgress < 0.3) { // Only glow during first 30% of lifetime
        ctx.globalAlpha = 0.3;
        ctx.shadowColor = "#00ffff";
        ctx.shadowBlur = 20;
        ctx.drawImage(img, scaledX, scaledY, scaledW, scaledH);
      }
      
      ctx.restore();
    }
  }

  // Draw Spectral Swords 👻⚔️
  for (let p of players) {
    if (p.spectralSword && p.charId === 'danty') {
      const sword = p.spectralSword;
      
      ctx.save();
      
      // Draw spectral sword aura/glow
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = p.sdtActive ? "#8b008b" : "#4b0082";
      ctx.beginPath();
      ctx.arc(sword.x + sword.w/2, sword.y + sword.h/2, sword.w/2 + 5, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw spectral sword main body
      ctx.globalAlpha = 0.9;
      if (sword.dash > 0) {
        // Dashing - brighter and larger
        ctx.fillStyle = p.sdtActive ? "#ff00ff" : "#6a0dad";
        ctx.globalAlpha = 1.0;
        const dashScale = 1.2;
        const scaledW = sword.w * dashScale;
        const scaledH = sword.h * dashScale;
        ctx.fillRect(sword.x - (scaledW - sword.w)/2, sword.y - (scaledH - sword.h)/2, scaledW, scaledH);
      } else {
        // Normal - floating
        ctx.fillStyle = p.sdtActive ? "#da70d6" : "#8a2be2";
        ctx.fillRect(sword.x, sword.y, sword.w, sword.h);
      }
      
           // Draw spectral sword with proper animation 👻⚔️
      const swordAnim = getSpectralSwordAnim(sword);
      const swordSpritesheet = swordAnim && spritesheetCache[swordAnim.src];
      
      if (swordAnim && swordSpritesheet && swordSpritesheet.complete && swordSpritesheet.naturalWidth > 0) {
        ctx.globalAlpha = 1.0;
        
        // Add floating effect to rendered position
        const floatOffset = Math.sin(sword.floatTimer * 0.1) * 3;
        const renderY = sword.y + floatOffset;
        
        if (sword.facing === 1) {
          ctx.save();
          ctx.translate(sword.x + sword.w/2, renderY + sword.h/2);
          ctx.scale(-1, 1);
          ctx.translate(-sword.w/2, -sword.h/2);
          ctx.drawImage(swordSpritesheet, swordAnim.w * sword.animFrame, 0, swordAnim.w, swordAnim.h, 0, 0, sword.w, sword.h);
          ctx.restore();
        } else {
          ctx.drawImage(swordSpritesheet, swordAnim.w * sword.animFrame, 0, swordAnim.w, swordAnim.h, sword.x, renderY, sword.w, sword.h);
        }
      } else {
        // Fallback rendering - just use the colored rectangles
        const floatOffset = Math.sin(sword.floatTimer * 0.1) * 3;
        const renderY = sword.y + floatOffset;
        
        if (sword.dash > 0) {
          ctx.fillStyle = p.sdtActive ? "#ff00ff" : "#6a0dad";
          ctx.globalAlpha = 1.0;
          const dashScale = 1.2;
          const scaledW = sword.w * dashScale;
          const scaledH = sword.h * dashScale;
          ctx.fillRect(sword.x - (scaledW - sword.w)/2, renderY - (scaledH - sword.h)/2, scaledW, scaledH);
        } else {
          ctx.fillStyle = p.sdtActive ? "#da70d6" : "#8a2be2";
          ctx.fillRect(sword.x, renderY, sword.w, sword.h);
        }
      }
      
      // Draw energy trail if moving
      if (Math.abs(sword.vx) > 1 || Math.abs(sword.vy) > 1) {
        ctx.globalAlpha = 0.4;
        for (let i = 1; i <= 3; i++) {
          ctx.fillStyle = p.sdtActive ? "#8b008b" : "#4b0082";
          const trailX = sword.x - sword.vx * i * 2;
          const trailY = sword.y - sword.vy * i * 2;
          const trailSize = sword.w * (1 - i * 0.2);
          ctx.fillRect(trailX + (sword.w - trailSize)/2, trailY + (sword.h - trailSize)/2, trailSize, trailSize);
        }
      }
      
      ctx.restore();
    }
  }

  drawImpactEffects(ctx);

  // Draw SDT sword falling animation
  for (let p of players) {
    if (p.charId === 'danty' && (p.sdtAnimationPhase === 'sword_falling' || p.sdtAnimationPhase === 'piercing')) {
      ctx.save();
      
      if (p.sdtAnimationPhase === 'sword_falling') {
        // Draw falling sword
        ctx.globalAlpha = 0.9;
        if (sdtSwordSprite.complete && sdtSwordSprite.naturalWidth > 0) {
          const swordWidth = 60;
          const swordHeight = 120;
          ctx.drawImage(sdtSwordSprite, p.sdtSwordX - swordWidth/2, p.sdtSwordY, swordWidth, swordHeight);
        } else {
          // Fallback sword
          ctx.fillStyle = "#4b0082";
          ctx.fillRect(p.sdtSwordX - 15, p.sdtSwordY, 30, 80);
          ctx.fillStyle = "#8b008b";
          ctx.fillRect(p.sdtSwordX - 5, p.sdtSwordY, 10, 80);
        }
        
        // Sword trail effect
        for (let i = 1; i <= 5; i++) {
          ctx.globalAlpha = 0.3 - (i * 0.05);
          ctx.fillStyle = "#8b008b";
          ctx.fillRect(p.sdtSwordX - 5, p.sdtSwordY - (i * 20), 10, 40);
        }
      } else if (p.sdtAnimationPhase === 'piercing') {
        // Draw explosion effect
        const explosionIntensity = 1 - (p.sdtExplosionTimer / SIN_DEVIL_TRIGGER.EXPLOSION_DURATION);
        const explosionSize = 100 * explosionIntensity;
        
        // Multiple explosion rings
        for (let i = 0; i < 3; i++) {
          ctx.globalAlpha = 0.6 - (i * 0.15) - (explosionIntensity * 0.3);
          ctx.strokeStyle = i === 0 ? "#8b008b" : i === 1 ? "#4b0082" : "#000";
          ctx.lineWidth = 8 - (i * 2);
          ctx.beginPath();
          ctx.arc(p.x + p.w/2, p.y + p.h/2, explosionSize + (i * 20), 0, 2 * Math.PI);
          ctx.stroke();
        }
        
        // Center flash
        ctx.globalAlpha = 0.8 - explosionIntensity;
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(p.x + p.w/2, p.y + p.h/2, explosionSize * 0.3, 0, 2 * Math.PI);
        ctx.fill();
      }
      
      ctx.restore();
    }
  }

  // Draw Judgment Cut lines
  for (let p of players) {
    if (p.judgementCutEffect && p.judgementCutEffect.phase === 'lines') {
      const effect = p.judgementCutEffect;
      
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2.5;
      ctx.shadowColor = "#3EB7FA";
      ctx.shadowBlur = 10; 
      
      ctx.beginPath();
      
      for (let i = 0; i < Math.min(effect.visibleLines, effect.lines.length); i++) {
        const line = effect.lines[i];
        const [x1, y1, x2, y2] = line;
        const worldX1 = effect.cameraX + x1;
        const worldY1 = effect.cameraY + y1;
        const worldX2 = effect.cameraX + x2;
        const worldY2 = effect.cameraY + y2;
        
        ctx.moveTo(worldX1, worldY1);
        ctx.lineTo(worldX2, worldY2);
      }
      
      ctx.stroke();
      
      if (effect.visibleLines > 5) {
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = "#3EB7FA";
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.restore();
      }
      
      ctx.restore();
    }
  }

  // Draw Judgment Cut shards
  for (let p of players) {
    if (p.judgementCutEffect && p.effectCtx) {
      const effect = p.judgementCutEffect;
      const effectCtx = p.effectCtx;
      effectCtx.clearRect(0, 0, effect.viewWidth, effect.viewHeight);
      for (let s of effect.shards) {
        effectCtx.save();
        let cx=0, cy=0;
        for (let pt of s.poly) { cx+=pt[0]; cy+=pt[1]; }
        cx/=s.poly.length; cy/=s.poly.length;     
        effectCtx.translate(cx + s.x, cy + s.y);
        effectCtx.rotate(s.angle);
        effectCtx.translate(-cx, -cy);
        effectCtx.beginPath();
        effectCtx.moveTo(s.poly[0][0], s.poly[0][1]);
        for (let j=1; j<s.poly.length; ++j) {
          effectCtx.lineTo(s.poly[j][0], s.poly[j][1]);
        }
        effectCtx.closePath();
        effectCtx.clip();
        effectCtx.drawImage(p.snapCanvas, 0, 0);
        effectCtx.fillStyle = "rgba(0, 0, 0, 0.2)";
        effectCtx.fill();
        effectCtx.strokeStyle = "rgb(0, 0, 0)";
        effectCtx.lineWidth = 0.1;
        effectCtx.globalAlpha = 0.4;
        effectCtx.stroke();
        effectCtx.restore();
      }
      ctx.globalAlpha = 1;
      ctx.drawImage(p.effectCanvas, effect.cameraX, effect.cameraY);
      ctx.globalAlpha = 1;
    }
  }
  
  ctx.restore();

  // Draw sheathing Vergil on top
  ctx.save();
  ctx.translate(WIDTH/2, HEIGHT/2);
  ctx.scale(camera.zoom, camera.zoom);
  ctx.translate(-camera.cx, -camera.cy);

  for(let i=0; i<players.length; i++) {
    let p = players[i];
    
    if (p.charId === 'vergil' && p.judgementCutPhase === VERGIL_JUDGMENT_CUT_PHASES.SHEATHING) {
      let anim = getAnimForPlayer(p);
      let spritesheet = anim && spritesheetCache[anim.src];
      
      if (anim && spritesheet && spritesheet.complete && spritesheet.naturalWidth > 0) {
        const scaleX = p.w / anim.w;
        const scaleY = p.h / anim.h;
        
        ctx.save();
        ctx.filter = "grayscale(100%) contrast(105%) brightness(1.1) sepia(100%) hue-rotate(160deg)"; 
        
        if (p.facing === 1) {
          ctx.save();
          ctx.translate(p.x + p.w/2, p.y + p.h/2);
          ctx.scale(-scaleX, scaleY);
          ctx.translate(-anim.w/2, -anim.h/2);
          ctx.drawImage(spritesheet, anim.w * p.animFrame, 0, anim.w, anim.h, 0, 0, anim.w, anim.h);
          ctx.restore();
        } else {
          ctx.drawImage(spritesheet, anim.w * p.animFrame, 0, anim.w, anim.h, p.x, p.y, p.w, p.h);
        }
        
        ctx.restore();
      }
    }
  }

  ctx.restore();

  // Draw winner text
  if(winner !== null) {
    ctx.font = "44px Arial";
    ctx.textAlign = "center";
    
    if (winner === "draw") {
      ctx.fillStyle = "#ff6b6b";
      ctx.strokeStyle = "#2c2c2c";
      ctx.lineWidth = 3;
      ctx.strokeText("DRAW!", WIDTH/2, HEIGHT/2 - 20);
      ctx.fillText("DRAW!", WIDTH/2, HEIGHT/2 - 20);
      
      ctx.font = "28px Arial";
      ctx.fillStyle = "#ffeb3b";
      ctx.strokeText("Both Players Defeated!", WIDTH/2, HEIGHT/2 + 20);
      ctx.fillText("Both Players Defeated!", WIDTH/2, HEIGHT/2 + 20);
    } else {
      ctx.fillStyle = "#ffeb3b";
      ctx.fillText(`${players[winner].name || `Player ${winner+1}`} Wins!`, WIDTH/2, HEIGHT/2);
    }
  }
}

function gameLoop() {
  updateCameraZoomEffect();
  
        // Update Vergil's JUDGMENT CUT slashing animation! ⚔️✨
  for (let i = 0; i < players.length; ++i) {
    const p = players[i];
    if (p.charId === 'vergil' && 
        (p.judgementCutPhase === VERGIL_JUDGMENT_CUT_PHASES.SLASHING || 
         (p.judgementCutEffect && p.judgementCutEffect.phase === 'lines'))) {
      p.slashAnimationTimer++;
      if (p.slashAnimationTimer >= 1) {
        p.slashAnimationTimer = 0;
        p.slashAnimationFrame++;
      }
    }
    
    // Update STORM SLASHES animation separately! ⚡🌩️
    if (p.charId === 'vergil' && p.stormSlashesActive) {
      p.stormSlashesAnimationTimer++;
      if (p.stormSlashesAnimationTimer >= 4) { // Faster animation for Storm Slashes!
        p.stormSlashesAnimationTimer = 0;
        p.stormSlashesAnimationFrame++;
        const stormAnim = characterSprites.vergil['storm-slashes'];
        if (stormAnim && p.stormSlashesAnimationFrame >= stormAnim.frames) {
          p.stormSlashesAnimationFrame = 0; // Loop the storm slashes!
        }
      }
    }
  }
  
   if (!gameState.paused) {
    for (let i = 0; i < players.length; ++i) {
      const p = players[i];
      if (p.justHit > 0) p.justHit--;
      updatePlayer(p, i);
      updatePlayerAnimState(p, i);
      updateAnimation(p);

if (p.block >= p.maxBlock - 0.1 && !p.blockWasFull) {
  p.blockGlowTimer = 30;
}
p.blockWasFull = p.block >= p.maxBlock - 0.1;
      if (p.blockGlowTimer > 0) p.blockGlowTimer--;
    }
    handleSpectralSwordAttack(); // Add this line! 👻⚔️
    handleDashAttack();
    handleDiveKickAttack();
    handleDantyDiveKickAttack();
    handleMirageBladeAttack();
    updateImpactEffects();
    updateDynamicMusic();
  }
  
  updateUI();
  updateParticles();
  draw();
  requestAnimationFrame(gameLoop);
}

// Character selection
document.addEventListener("keydown", function(e) {
  // Initialize audio on first keypress (required for autoplay policy)
  initializeAudio();
  
  if (e.key === "1") {
    const p = players[0];
    p.charId = "vergil";
    p.name = "Vergil";
    p.color = "#4a90e2";
    p.judgementCutCooldown = 0;
    console.log("Player 1 is now Vergil! Q=Switch Weapon, E=Judgment Cut(Yamato)");
  }
   if (e.key === "2") {
    const p = players[0];
    p.charId = "danty";
    p.name = "Danty";
   p.color = "#ef5350"; 
    p.judgementCutCooldown = 0;
  }
  
  if (e.key === "3") {
    const p = players[1];
    p.charId = "vergil";
    p.name = "Vergil";
    p.color = "#4a90e2";
    p.judgementCutCooldown = 0;
  }
   if (e.key === "4") {
    const p = players[1];
    p.charId = "chicken";
    p.name = "Danty";
   p.color = "#ef5350"; 
    p.judgementCutCooldown = 0;
  }
});

gameLoop();
