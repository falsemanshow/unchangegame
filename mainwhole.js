// Handles blocking, block depletion, block recovery, and dizzy state
function updateBlocking(p, pid) {
  const controls = pid === 0 ?
    {down: 's'} :
    {down: 'l'};
  if (p._wasBlocking === undefined) p._wasBlocking = false;
  
  if (p.onGround && !p.dizzy && keys[controls.down]) {
    if (!p._wasBlocking && p.block < BLOCK_MAX) {
      p.blocking = false;
      p.blockAnimationFinished = false; // NEW: Reset animation state
    } else if (p.block > 0) {
      if (!p.blocking) {
        // NEW: Just started blocking
        p.blocking = true;
        p.blockStartTime = performance.now();
        p.blockAnimationFinished = false;
      }
      p.block -= BLOCK_DEPLETION;
      if (p.block < 0) p.block = 0;
    } else {
      p.blocking = false;
      p.blockAnimationFinished = false; // NEW: Reset when block depleted
    }
  } else {
    p.blocking = false;
    p.blockAnimationFinished = false; // NEW: Reset when not blocking
  }
  
  if (!p.blocking && p.block < BLOCK_MAX) {
    p.block += BLOCK_RECOVERY;
    if (p.block > BLOCK_MAX) p.block = BLOCK_MAX;
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
    SLASHING: 'slashing', // NEW: When everything is blue and Vergil is invisible
    LINES: 'lines',
    SLIDE: 'slide',
    FALL: 'fall',
    SHEATHING: 'sheathing' // NEW: When Vergil reappears and sheaths sword
};
// NEW: Judgment Cut Charge System
const JUDGMENT_CUT_CHARGE = {
    MIN_CHARGE_TIME: 1000, // 1 second minimum charge
    MAX_CHARGE_TIME: 3000, // 3 seconds for full charge
};

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
const DASH_DAMAGE = 10;
const SLOW_FALL_MULTIPLIER = 0.16;
const BLOCK_MAX = 100;
const BLOCK_DEPLETION = 1.8;
const BLOCK_RECOVERY = 0.8;
const DIZZY_FRAMES = 38;
const DIZZY_KNOCKBACK_X = 16, DIZZY_KNOCKBACK_Y = -9;
const BLOCK_PUSHBACK_X = 9, BLOCK_PUSHBACK_Y = -4;

// NEW: Judgment Cut Constants
const JUDGEMENT_CUT_CONSTANTS = {
    SLIDE_DURATION: 5000,
    SLIDE_SPEED: 1,
    FALL_INITIAL_VY: -7,
    FALL_VX_RANGE: 3,
    LINE_DISPLAY_DURATION: 1100,
    LINE_APPEAR_INTERVAL: 50,
    FIRST_THREE_INTERVAL: 50,
    REMAINING_LINES_DELAY: 200
};

// NEW: Game State for pause/resume functionality
let gameState = {
    paused: false,
    pauseReason: null,
    pauseStartTime: 0
};

// NEW: Camera Zoom Effect for Judgment Cut
let cameraZoomEffect = {
    active: false,
    startZoom: 1,
    targetZoom: 1.5,
    currentZoom: 1,
    phase: 'idle',
    startTime: 0,
    duration: {
        zoomIn: 6300,
        hold: 400,
        zoomOut: 700
    }
};

// --- Impact Effects System ---
const impactEffects = [];

// Impact effect definitions for each character
const characterImpactEffects = {
  vergil: {
    dash: {
      sprite: "vergil-slash-impact.png", // Your custom slash sprite
      frames: 1,
      w: 100,
      h: 100,
      speed: 3,
      duration: 18, // Total frames the effect lasts
      offset: { x: -15, y: -40 }, // Offset from hit position
      sound: "slash_impact.wav", // Optional sound effect
      directionalOffset: { x: 8, y: 0 }
    },
    // You can add more attack types later
    // special: { sprite: "vergil-judgement-impact.png", ... }
  },
  gold: {
    dash: {
      sprite: "gold-punch-impact.png",
      frames: 4,
      w: 60,
      h: 60,
      speed: 2,
      duration: 12,
      offset: { x: -10, y: -10 },
      sound: "punch_impact.wav"
    }
  },
  chicken: {
    dash: {
      sprite: "chicken-peck-impact.png", 
      frames: 5,
      w: 50,
      h: 50,
      speed: 2,
      duration: 15,
      offset: { x: -5, y: -10 },
      sound: "peck_impact.wav"
    }
  }
};

// Load impact effect sprites
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

// Function to create an impact effect
function createImpactEffect(attacker, target, attackType = 'dash') {
  const effectData = characterImpactEffects[attacker.charId]?.[attackType];
  if (!effectData) return;
  
  // Calculate proper impact position based on attack direction
  let impactX, impactY;
  
  if (attacker.x < target.x) {
    // Attacking from left - impact on target's left side
    impactX = target.x + effectData.offset.x;
  } else {
    // Attacking from right - impact on target's right side  
    impactX = target.x + target.w - effectData.w + effectData.offset.x;
  }
  
  // Y position stays centered on target
  impactY = target.y + target.h/2 - effectData.h/2 + effectData.offset.y;
  
  const effect = {
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
    scale: effectData.baseScale || 1.0,
    alpha: 1.0,
    facingDirection: attacker.facing || 1
  };
  
  impactEffects.push(effect);
  console.log(`${attacker.name}'s ${attackType} creates impact effect on ${target.name}!`);
}

// Update impact effects
function updateImpactEffects() {
  for (let i = impactEffects.length - 1; i >= 0; i--) {
    const effect = impactEffects[i];
    
    // Update animation
    effect.frameTimer++;
    if (effect.frameTimer >= effect.speed) {
      effect.frameTimer = 0;
      effect.currentFrame++;
      if (effect.currentFrame >= effect.frames) {
        effect.currentFrame = effect.frames - 1; // Hold on last frame
      }
    }
    
    // Update life and effects
    effect.life--;
    
    // Add some dynamic scaling and fading
    if (effect.life > effect.frames * effect.speed) {
      // Growing phase
      effect.scale = Math.min(1.2, effect.scale + 0.1);
    } else {
      // Fading phase
      effect.alpha = effect.life / (effect.frames * effect.speed);
      effect.scale = Math.max(0.8, effect.scale - 0.02);
    }
    
    // Remove when finished
    if (effect.life <= 0) {
      impactEffects.splice(i, 1);
    }
  }
}

// Draw impact effects
function drawImpactEffects(ctx) {
  for (const effect of impactEffects) {
    const spritesheet = impactSpritesheetCache[effect.sprite];
    
    if (spritesheet && spritesheet.complete && spritesheet.naturalWidth > 0) {
      ctx.save();
      
      // Apply transformations with directional flipping
      ctx.globalAlpha = effect.alpha;
      ctx.translate(effect.x + effect.w/2, effect.y + effect.h/2);
      
      // NEW: Apply horizontal flip based on attacker's facing direction
      ctx.scale(effect.scale * effect.facingDirection, effect.scale);
      
      ctx.translate(-effect.w/2, -effect.h/2);
      
      // Draw the sprite frame
      ctx.drawImage(
        spritesheet,
        effect.w * effect.currentFrame, 0, effect.w, effect.h,
        0, 0, effect.w, effect.h
      );
      
      ctx.restore();
    } else {
      // Fallback effect - also respects direction
      ctx.save();
      ctx.globalAlpha = effect.alpha * 0.7;
      ctx.fillStyle = effect.attackerColor;
      ctx.beginPath();
      ctx.arc(effect.x + effect.w/2, effect.y + effect.h/2, 20 * effect.scale, 0, 2 * Math.PI);
      ctx.fill();
      
      // NEW: Add directional lines for fallback effect
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 3;
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI/2);
        const length = 15 * effect.scale;
        const startX = effect.x + effect.w/2;
        const startY = effect.y + effect.h/2;
        
        // Apply directional offset to lines
        const directionOffset = effect.facingDirection * 10;
        const endX = startX + Math.cos(angle) * length + directionOffset;
        const endY = startY + Math.sin(angle) * length;
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }
      
      ctx.restore();
    }
  }
}

// NEW: Pause/Resume functions
function pauseGame(reason) {
    gameState.paused = true;
    gameState.pauseReason = reason;
    gameState.pauseStartTime = performance.now();
    console.log("Game paused for " + reason);
}

function resumeGame() {
    gameState.paused = false;
    gameState.pauseReason = null;
    console.log("Game resumed");
}

// NEW: Camera zoom functions
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

// NEW: Execute Judgment Cut function
function executeJudgmentCut(character) {
  pauseGame('judgement_cut');
  
  // Get current camera state
  const { cx, cy, zoom } = getCamera();
  
  // Calculate camera view dimensions
  const viewW = canvas.width / zoom;
  const viewH = canvas.height / zoom;
  
  // Create snapshot canvas to match the camera view size
  if (!character.snapCanvas) {
      character.snapCanvas = document.createElement('canvas');
      character.snapCtx = character.snapCanvas.getContext('2d');
  }
  
  // Set snapshot canvas to camera view size
  character.snapCanvas.width = viewW;
  character.snapCanvas.height = viewH;
  
  // Calculate what area of the world is visible
  const viewLeft = cx - viewW / 2;
  const viewTop = cy - viewH / 2;
  
  // Take snapshot of only the visible camera area
  character.snapCtx.clearRect(0, 0, viewW, viewH);
  character.snapCtx.save();
  
  // Translate to show only the camera view area
  character.snapCtx.translate(-viewLeft, -viewTop);
  
  // BACKGROUND
  if (bgImg.complete && bgImg.naturalWidth > 0) {
    character.snapCtx.drawImage(bgImg, 0, 0, WIDTH, HEIGHT);
  } else {
    character.snapCtx.fillStyle = "#181c24";
    character.snapCtx.fillRect(0, 0, WIDTH, HEIGHT);
  }
  character.snapCtx.fillStyle = "#6d4c41";
  character.snapCtx.fillRect(0, FLOOR_HEIGHT, WIDTH, HEIGHT - FLOOR_HEIGHT);

  // PLATFORMS
  platforms.forEach(plat => {
      character.snapCtx.fillStyle = PLATFORM_COLOR;
      character.snapCtx.fillRect(plat.x, plat.y, plat.w, PLATFORM_HEIGHT);
      character.snapCtx.strokeStyle = PLATFORM_EDGE;
      character.snapCtx.lineWidth = 3;
      character.snapCtx.strokeRect(plat.x, plat.y, plat.w, PLATFORM_HEIGHT);
  });

  // PLAYERS - Draw all players with proper scaling
  for (let player of players) {
      if (!player.alive) continue;
      
      // Draw shadow
      character.snapCtx.globalAlpha = 0.18;
      character.snapCtx.beginPath();
      character.snapCtx.ellipse(player.x + player.w / 2, player.y + player.h - 4, player.w / 2.5, 7, 0, 0, 2 * Math.PI);
      character.snapCtx.fillStyle = "#000";
      character.snapCtx.fill();
      character.snapCtx.globalAlpha = 1;
      
      // ENHANCED: Draw actual sprite with scaling
      let anim = getAnimForPlayer(player);
      let spritesheet = anim && spritesheetCache[anim.src];
      
      if (anim && spritesheet && spritesheet.complete && spritesheet.naturalWidth > 0) {
        // Calculate scale factors
        const scaleX = player.w / anim.w;
        const scaleY = player.h / anim.h;
        
        if (player.facing === 1) {
          character.snapCtx.save();
          character.snapCtx.translate(player.x + player.w/2, player.y + player.h/2);
          character.snapCtx.scale(-scaleX, scaleY);
          character.snapCtx.translate(-anim.w/2, -anim.h/2);
          character.snapCtx.drawImage(
            spritesheet,
            anim.w * player.animFrame, 0, anim.w, anim.h,
            0, 0, anim.w, anim.h
          );
          character.snapCtx.restore();
        } else {
          // Scale sprite to fit player's collision box
          character.snapCtx.drawImage(
            spritesheet,
            anim.w * player.animFrame, 0, anim.w, anim.h,
            player.x, player.y, player.w, player.h
          );
        }
      } else {
        // Fallback to colored rectangle
        character.snapCtx.fillStyle = player.color;
        character.snapCtx.strokeStyle = "#fff";
        character.snapCtx.lineWidth = 3;
        character.snapCtx.fillRect(player.x, player.y, player.w, player.h);
        character.snapCtx.strokeRect(player.x, player.y, player.w, player.h);
      }
      
      // Draw blocking/dizzy effects if present
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
  
  // Trigger the effect after 2 seconds
  setTimeout(() => {
      AbilityLibrary.judgementCut(character);
  }, 2000);
  
  setTimeout(() => {
      // Resume the game when shards start falling
      resumeGame();
  }, 9000);
}

// NEW: Update snapshot with current Vergil state
function updateSnapshotWithVergil(character) {
    if (!character.snapCanvas || !character.snapCtx) return;
    
    const { cx, cy, zoom } = getCamera();
    const viewW = character.snapCanvas.width;
    const viewH = character.snapCanvas.height;
    const viewLeft = cx - viewW / 2;
    const viewTop = cy - viewH / 2;
    
    // Clear and redraw the entire snapshot
    character.snapCtx.clearRect(0, 0, viewW, viewH);
    character.snapCtx.save();
    character.snapCtx.translate(-viewLeft, -viewTop);
    
    // BACKGROUND
    if (bgImg.complete && bgImg.naturalWidth > 0) {
        character.snapCtx.drawImage(bgImg, 0, 0, WIDTH, HEIGHT);
    } else {
        character.snapCtx.fillStyle = "#181c24";
        character.snapCtx.fillRect(0, 0, WIDTH, HEIGHT);
    }
    character.snapCtx.fillStyle = "#6d4c41";
    character.snapCtx.fillRect(0, FLOOR_HEIGHT, WIDTH, HEIGHT - FLOOR_HEIGHT);

    // PLATFORMS
    platforms.forEach(plat => {
        character.snapCtx.fillStyle = PLATFORM_COLOR;
        character.snapCtx.fillRect(plat.x, plat.y, plat.w, PLATFORM_HEIGHT);
        character.snapCtx.strokeStyle = PLATFORM_EDGE;
        character.snapCtx.lineWidth = 3;
        character.snapCtx.strokeRect(plat.x, plat.y, plat.w, PLATFORM_HEIGHT);
    });

    // PLAYERS - Draw with current animation states
    for (let player of players) {
        if (!player.alive) continue;
        
        // Draw shadow
        character.snapCtx.globalAlpha = 0.18;
        character.snapCtx.beginPath();
        character.snapCtx.ellipse(player.x + player.w / 2, player.y + player.h - 4, player.w / 2.5, 7, 0, 0, 2 * Math.PI);
        character.snapCtx.fillStyle = "#000";
        character.snapCtx.fill();
        character.snapCtx.globalAlpha = 1;
        
        // Draw actual sprite with CURRENT animation frame
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
                character.snapCtx.drawImage(
                    spritesheet,
                    anim.w * player.animFrame, 0, anim.w, anim.h, // Current frame!
                    0, 0, anim.w, anim.h
                );
                character.snapCtx.restore();
            } else {
                character.snapCtx.drawImage(
                    spritesheet,
                    anim.w * player.animFrame, 0, anim.w, anim.h, // Current frame!
                    player.x, player.y, player.w, player.h
                );
            }
        }
    }
    
    character.snapCtx.restore();
}

// NEW: Utility functions
function getControls(pid) {
  return pid === 0
    ? { left: 'a', right: 'd', up: 'w', down: 's', special: 'e' }
    : { left: 'k', right: ';', up: 'o', down: 'l', special: 'p' };
}

function knockback(attacker, defender, strengthX, strengthY) {
  defender.vx = (defender.x < attacker.x ? -1 : 1) * Math.abs(strengthX);
  defender.vy = strengthY;
}

// Judgment Cut Ability
const AbilityLibrary = {
    judgementCut: function(character, costPoints = 0) {
        if (character.judgementCutCooldown > 0) return false;
        
        // Start zoom and blue screen effect
        startCameraZoomEffect();
        
        // Get current camera state
        const { cx, cy, zoom } = getCamera();
        const viewW = canvas.width / zoom;
        const viewH = canvas.height / zoom;
        
        // Create effect canvas if it doesn't exist
        if (!character.effectCanvas) {
            character.effectCanvas = document.createElement('canvas');
            character.effectCtx = character.effectCanvas.getContext('2d');
        }
        
        // Set effect canvas to camera view size
        character.effectCanvas.width = viewW;
        character.effectCanvas.height = viewH;
        
        // Set cooldown
        character.judgementCutCooldown = 120;
        
       // NEW: Set Vergil to preparing phase initially
character.judgementCutPhase = VERGIL_JUDGMENT_CUT_PHASES.PREPARING;
// NOTE: Don't change invisibility here - it's already set before this function is called
character.slashAnimationFrame = 0;
character.slashAnimationTimer = 0;
        
        // STEP 1: Show lines immediately
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
            visibleLines: 0
        };
        
        // Store effect in character
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
        
        // STEP 2: After lines display duration, hide lines and prepare shards
        setTimeout(() => {
            if (character.judgementCutEffect) {
                character.judgementCutEffect.phase = 'preparing';
                
                // Generate shards but don't show them yet
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
    
    // shards size, edit size, adjust shards
    const expandedPoly = poly.map(point => {
        const dx = point[0] - cx;
        const dy = point[1] - cy;
        const expandFactor = 1.1; // Make shards 5% bigger
        return [cx + dx * expandFactor, cy + dy * expandFactor];
    });
    
    let dir = Math.random() < 0.5 ? -0.8 : 0.8;
    return {
        poly: expandedPoly, // Use the expanded polygon
x: (Math.random()-0.5) * 10, // Random horizontal offset between -2.5 and +2.5
y: (Math.random()-0.5) * 10, // Random vertical offset between -2.5 and +2.5
        vx: dir * (18 + Math.random()*10),
        vy: (Math.random()-0.5)*10,
        g: 1.10 + Math.random()*0.2,
        angle: (Math.random()-0.5)*0.2,
        vangle: (Math.random()-0.5)*0.12 + (cx-effect.viewWidth/2)*0.0003
    };
});
            }
        }, JUDGEMENT_CUT_CONSTANTS.LINE_DISPLAY_DURATION);
        
        // NEW: End slashing phase and start sheathing
        setTimeout(() => {
            if (character.judgementCutEffect) {
                character.judgementCutPhase = VERGIL_JUDGMENT_CUT_PHASES.SHEATHING;
                character.isInvisibleDuringJudgmentCut = false;
                character.animState = "sheathing";
                character.animFrame = 0;
                character.animTimer = 0;
                character.updateShardsInRealTime = true;
                console.log("Vergil reappears and sheaths his sword!");
            }
        }, JUDGEMENT_CUT_CONSTANTS.LINE_DISPLAY_DURATION + 200);
        
     // Shard animation - when shards start sliding, the blue overlay will disappear
setTimeout(() => {
    if (character.judgementCutEffect) {
        character.judgementCutEffect.phase = 'slide';
        character.judgementCutEffect.startTime = performance.now();
        console.log("Shards start breaking - blue overlay ends!");
    }
}, JUDGEMENT_CUT_CONSTANTS.LINE_DISPLAY_DURATION + 500);
        
        // NEW: End sheathing animation and return to normal
        setTimeout(() => {
            if (character.judgementCutPhase === VERGIL_JUDGMENT_CUT_PHASES.SHEATHING) {
                character.judgementCutPhase = null;
                character.animState = "idle";
                character.animFrame = 0;
                character.animTimer = 0;
                console.log("Judgment Cut complete!");
            }
        }, JUDGEMENT_CUT_CONSTANTS.LINE_DISPLAY_DURATION + 1500);
        
        // Deal damage to opponents in range (immediate)
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
                    opponent.justHit = 10;
                    knockback(character, opponent, 10, -8);
                    console.log(`${character.name}'s Judgement Cut hit ${opponent.name} for ${damage} damage!`);
                }
            }
        }
        
        return true;
        // NEW: Make Vergil visible again after the effect completes
setTimeout(() => {
    character.isInvisibleDuringJudgmentCut = false;
    console.log("Vergil reappears after Judgment Cut!");
}, 8000); // Adjust timing as needed

return true;
    }
};

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
  let baseZoom = Math.min(zoomW, zoomH);

  // Clamp zoom: not too far in or out
  const minZoom = Math.max(canvas.width / WIDTH, canvas.height / HEIGHT);
  const maxZoom = 1.8; // Allow a bit more zoom-in if you want
  baseZoom = Math.max(minZoom, Math.min(maxZoom, baseZoom));

  // Apply zoom effect if active
  let finalZoom = baseZoom;
  if (cameraZoomEffect.active) {
      finalZoom = baseZoom * cameraZoomEffect.currentZoom;
  }

  // Clamp camera center so the world doesn't show empty space
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
  
// NEW: Handle Vergil's Judgment Cut charge start
for (let pid = 0; pid < 2; pid++) {
  const p = players[pid];
  if (!p.alive) continue;
  
  const controls = getControls(pid);
  if (k === controls.special && p.charId === 'vergil' && !p.judgmentCutCharging && p.judgementCutCooldown === 0) {
    // Start charging
    p.judgmentCutCharging = true;
    p.judgmentCutChargeStart = performance.now();
    p.judgmentCutChargeLevel = 0;
    
    // Set charging animation
    p.animState = "charging";
    p.animFrame = 0;
    p.animTimer = 0;
    
    console.log(`${p.name} begins charging Judgment Cut...`);
  }
}

  // ... rest of the keydown handler code remains the same
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
        // NEW: Vergil teleport dash
        if (p.charId === 'vergil') {
          // Create teleport trail at current position
         // Create teleport trail at current position with sprite data
p.teleportTrail = {
    x: p.x,
    y: p.y,
    duration: 15,
    alpha: 0.8,
    frame: p.animFrame, 
    animState: p.animState, 
    facing: p.facing 
};
          
          // Start teleport effect
          p.isTeleporting = true;
          p.teleportAlpha = 0.3;
          
          // Enhanced dash with teleport distance
          p.vx = -DASH_SPEED * 1.2;
          console.log(`${p.name} teleports through the shadows!`);
        } else {
          p.vx = -DASH_SPEED;
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
    if (k === controls.right && !keys[controls.left] && p.dashCooldown === 0) {
      let now = performance.now();
      if (
        dashTapState[pid].lastTapDir === 'right' &&
        now - dashTapState[pid].lastTapTime < DASH_WINDOW &&
        now - dashTapState[pid].lastReleaseTime.right < DASH_WINDOW
      ) {
        // NEW: Vergil teleport dash
        if (p.charId === 'vergil') {
          // Create teleport trail at current position
         // Create teleport trail at current position with sprite data
p.teleportTrail = {
    x: p.x,
    y: p.y,
    duration: 15,
    alpha: 0.8,
    frame: p.animFrame, 
    animState: p.animState, 
    facing: p.facing
};
          
          // Start teleport effect
          p.isTeleporting = true;
          p.teleportAlpha = 0.3;
          
          // Enhanced dash with teleport distance
          p.vx = DASH_SPEED * 1.2;
          console.log(`${p.name} teleports through the shadows!`);
        } else {
          p.vx = DASH_SPEED;
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
    const controls = pid === 0 ?
      {left:'a', right:'d'} :
      {left:'k', right:';'};
    let now = performance.now();
    if (k === controls.left) dashTapState[pid].lastReleaseTime.left = now;
    if (k === controls.right) dashTapState[pid].lastReleaseTime.right = now;
    
// NEW: Handle Judgment Cut release
const playerControls = getControls(pid);
if (k === playerControls.special) {
  const p = players[pid];
  if (p.charId === 'vergil' && p.judgmentCutCharging) {
    const chargeTime = now - p.judgmentCutChargeStart;
    
if (chargeTime >= JUDGMENT_CUT_CHARGE.MIN_CHARGE_TIME) {
  // NEW: Make Vergil invisible BEFORE executing Judgment Cut
  p.isInvisibleDuringJudgmentCut = true;
  
  // NEW: Start slashing immediately when Vergil becomes invisible
  p.judgementCutPhase = VERGIL_JUDGMENT_CUT_PHASES.SLASHING;
  p.slashAnimationFrame = 0;
  p.slashAnimationTimer = 0;
  
  console.log("Vergil disappears and starts slashing!");
  
  // Execute Judgment Cut
  p.judgmentCutCharging = false;
  p.judgmentCutChargeLevel = 0;
  executeJudgmentCut(p);
  console.log(`${p.name} releases Judgment Cut after ${chargeTime}ms charge!`);
} else {
      // Not charged enough - return to idle
      p.judgmentCutCharging = false;
      p.judgmentCutChargeLevel = 0;
      p.animState = "idle";
      p.animFrame = 0;
      p.animTimer = 0;
      console.log(`${p.name} didn't charge long enough for Judgment Cut.`);
    }
  }
}
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
          
          // NEW: Create block impact effect (you can create a separate block effect)
          createImpactEffect(p, opp, 'block'); // Will fallback gracefully if not defined
          continue;
        }
        if (opp.justHit === 0 && (!opp.blocking || !isBlocking || opp.block <= 0)) {
          opp.hp -= DASH_DAMAGE;
          opp.justHit = 16;
          
          // NEW: Create character-specific impact effect!
          createImpactEffect(p, opp, 'dash');
          
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

  // NEW: Vergil-specific updates
// NEW: Vergil-specific updates
if (p.charId === 'vergil') {
    // Update Vergil's Judgment Cut cooldown
    if (p.judgementCutCooldown > 0) {
        p.judgementCutCooldown--;
    }
    
    // NEW: Handle charging animation and level
    if (p.judgmentCutCharging) {
        const chargeTime = performance.now() - p.judgmentCutChargeStart;
        p.judgmentCutChargeLevel = Math.min(chargeTime / JUDGMENT_CUT_CHARGE.MAX_CHARGE_TIME, 1.0);
    }
    
    // Handle teleport effects
    if (p.teleportTrail && p.teleportTrail.duration > 0) {
        p.teleportTrail.duration--;
        p.teleportTrail.alpha *= 0.92;
        if (p.teleportTrail.duration <= 0) {
            p.teleportTrail = null;
        }
    }
    
    // Handle teleport transparency
    if (p.isTeleporting) {
        if (p.dash > 0) {
            // Still dashing - keep semi-transparent and flickering
            p.teleportAlpha = 0.2 + 0.3 * Math.sin(performance.now() / 50);
        } else {
            // Dash finished - fade back to normal
            p.teleportAlpha += 0.15;
            if (p.teleportAlpha >= 1.0) {
                p.teleportAlpha = 1.0;
                p.isTeleporting = false;
            }
        }
    }

    // Handle Judgment Cut effect animations
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
 // Don't allow movement during Judgment Cut phases or while charging
if (p.charId === 'vergil' && (p.judgementCutPhase === VERGIL_JUDGMENT_CUT_PHASES.SLASHING || 
                              p.judgementCutPhase === VERGIL_JUDGMENT_CUT_PHASES.SHEATHING ||
                              p.judgmentCutCharging)) {
  return; // Skip all movement updates during these phases
}
    
    // Handle teleport effects
    if (p.teleportTrail && p.teleportTrail.duration > 0) {
        p.teleportTrail.duration--;
        p.teleportTrail.alpha *= 0.92;
        if (p.teleportTrail.duration <= 0) {
            p.teleportTrail = null;
        }
    }
    
    // Handle teleport transparency
    if (p.isTeleporting) {
        if (p.dash > 0) {
            // Still dashing - keep semi-transparent and flickering
            p.teleportAlpha = 0.2 + 0.3 * Math.sin(performance.now() / 50);
        } else {
            // Dash finished - fade back to normal
            p.teleportAlpha += 0.15;
            if (p.teleportAlpha >= 1.0) {
                p.teleportAlpha = 1.0;
                p.isTeleporting = false;
            }
        }
    }

    // Handle Judgment Cut effect animations
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
  }

  // --- Controls Mapping ---
  const controls = pid === 0 ?
    {left: 'a', right: 'd', up: 'w', down: 's'} :
    {left: 'k', right: ';', up: 'o', down: 'l'};

  // --- Block Mechanic ---
  if (updateBlocking(p, pid)) return;

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
  
  // NEW: Handle Judgment Cut charging animation
  if (p.charId === 'vergil' && p.judgmentCutCharging) {
    if (p.animState !== "charging") {
      p.animState = "charging";
      p.animFrame = 0;
      p.animTimer = 0;
    }
    return; // Don't change animation state during charging
  }
  
  // NEW: Handle Judgment Cut sheathing animation
  if (p.charId === 'vergil' && p.judgementCutPhase === VERGIL_JUDGMENT_CUT_PHASES.SHEATHING) {
    if (p.animState !== "sheathing") {
      p.animState = "sheathing";
      p.animFrame = 0;
      p.animTimer = 0;
    }
    return; // Don't change animation state during sheathing
  }
  
  if (p.alive && other && !other.alive && getAnimForPlayer({...p, animState:"victory"})) {
    p.animState = "victory"; return;
  }
  if (!p.alive) { p.animState = "defeat"; return; }
  if (p.dizzy > 0) { p.animState = "dizzy"; return; }
  if (p.justHit > 0) { p.animState = "hit"; return; }
  
  // NEW: Updated blocking logic
  if (p.blocking) { 
    // Check if initial block animation has finished
    const blockAnim = getAnimForPlayer({...p, animState: "block"});
    if (blockAnim && p.animState === "block") {
      // Calculate if the block animation should be finished
      const timeSinceBlockStart = performance.now() - p.blockStartTime;
      const blockAnimDuration = blockAnim.frames * blockAnim.speed * (1000/60); // Convert to milliseconds
      
      if (timeSinceBlockStart >= blockAnimDuration) {
        p.blockAnimationFinished = true;
      }
    }
    
    // Choose animation based on whether initial block is done
    if (p.blockAnimationFinished) {
      p.animState = "blocking"; // NEW: Loop the blocking animation
    } else {
      p.animState = "block"; // Play initial block animation
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

function updateAnimation(p) {
  const anim = getAnimForPlayer(p);
  if (!anim) { p.animFrame = 0; p.animTimer = 0; return; }
  
  // Store previous frame count to detect animation changes
  if (!p.prevAnimFrameCount) p.prevAnimFrameCount = anim.frames;
  
  // Reset if animation changed
  if (p.prevAnimFrameCount !== anim.frames) {
    p.animFrame = 0;
    p.animTimer = 0;
    p.prevAnimFrameCount = anim.frames;
  }
  
  // Special handling for initial block animation (play once, hold last frame)
  if (p.animState === "block") {
    p.animTimer++;
    if (p.animTimer >= anim.speed) {
      p.animTimer = 0;
      if (p.animFrame < anim.frames - 1) {
        p.animFrame++;
      }
      // When it reaches the last frame, it stays there and the state will switch to "blocking"
    }
    return;
  }
  
  // NEW: "blocking" animation loops normally while holding block
  if (p.animState === "blocking") {
    p.animTimer++;
    if (p.animTimer >= anim.speed) {
      p.animTimer = 0;
      p.animFrame = (p.animFrame + 1) % anim.frames; // Normal looping
    }
    return;
  }
  
  // Normal animation logic for other states
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

// vergil after image
const vergilTeleportTrailSprite = new Image();
vergilTeleportTrailSprite.src = "vergil-teleport-trail.png";

const vergilSlashingSprite = new Image();
vergilSlashingSprite.src = "vergil-judgment-cut-slashes.png"; 

// Handle sprite, change sprite, images, png file for characters, image handler, sprite handler
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
  },
  vergil: {
    idle:      { src: "vergil-idle.png", frames: 8, w: 100, h: 100, speed: 12 },
      dash:      { src: "vergil-dash.png", frames: 3, w: 100, h: 100, speed: 4 },
       walk:      { src: "vergil-walk.png", frames: 3, w: 100, h: 100, speed: 6 },
        block:     { src: "vergil-block.png", frames: 4, w: 100, h: 100, speed: 6 },
         blocking:  { src: "vergil-blocking.png", frames: 3, w: 100, h: 100, speed: 8 },
         jump:      { src: "vergil-idle.png", frames: 8, w: 100, h: 100, speed: 12 },
         fall:      { src: "vergil-idle.png", frames: 8, w: 100, h: 100, speed: 12 },
    sheathing: { src: "vergil-idle.png", frames: 6, w: 100, h: 100, speed: 8 }, 
    slashing:  { src: "vergil-judgment-cut-slashes.png", frames: 1, w: 100, h: 100, speed: 3 },
     charging:  { src: "vergil-charging.png", frames: 8, w: 100, h: 100, speed: 10 }, 
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

// --- Player State Initialization ---
const players = [
  {
    x: WIDTH/3, y: GROUND-PLAYER_SIZE, vx: 0, vy: 0, w: PLAYER_SIZE, h: PLAYER_SIZE,
    color: "#4a90e2", facing: 1, hp: PLAYER_HP, jumps: 0, dash: 0,
    dashCooldown: 0, canAttack: true, attackTimer: 0, attackBox: null, onGround: false,
    downDropTimer: 0, jumpHeld: false, alive: true, id: 0, name: "Vergil",
    charId: "vergil", animState: "idle", animFrame: 0, animTimer: 0, justHit: 0,
    block: BLOCK_MAX, blocking: false, dizzy: 0, blockGlowTimer: 0, blockWasFull: false,
    judgementCutCooldown: 0, effectCanvas: null, effectCtx: null, snapCanvas: null, 
    snapCtx: null, judgementCutEffect: null, teleportTrail: null, isTeleporting: false, 
    teleportAlpha: 1.0, hasDashHit: false,   block: BLOCK_MAX, 
    blocking: false, 
    dizzy: 0,
    blockAnimationFinished: false,
    blockStartTime: 0,
    judgementCutPhase: null,
isInvisibleDuringJudgmentCut: false,
slashAnimationFrame: 0,
slashAnimationTimer: 0,
judgmentCutCharging: false,
judgmentCutChargeStart: 0,
judgmentCutChargeLevel: 0,
  },
  {
    x: 2*WIDTH/3, y: GROUND-PLAYER_SIZE, vx: 0, vy: 0, w: PLAYER_SIZE, h: PLAYER_SIZE,
    color: "#ef5350", facing: -1, hp: PLAYER_HP, jumps: 0, dash: 0,
    dashCooldown: 0, canAttack: true, attackTimer: 0, attackBox: null, onGround: false,
    downDropTimer: 0, jumpHeld: false, alive: true, id: 1, name: "P2",
    charId: "chicken", animState: "idle", animFrame: 0, animTimer: 0, justHit: 0,
    block: BLOCK_MAX, blocking: false, dizzy: 0, blockGlowTimer: 0, blockWasFull: false,
    hasDashHit: false,   block: BLOCK_MAX, 
    blocking: false, 
    dizzy: 0,
    blockAnimationFinished: false, 
    blockStartTime: 0,
    judgementCutPhase: null,
isInvisibleDuringJudgmentCut: false,
slashAnimationFrame: 0,
slashAnimationTimer: 0,
judgmentCutCharging: false,
judgmentCutChargeStart: 0,
judgmentCutChargeLevel: 0,
  }
];
let winner = null;

// --- Main Draw Function ---
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function draw() {
  const camera = getCamera();
    // NEW: Check if we should apply black and white effect
 // NEW: Check if we should apply black and white effect until shards fall
let applyBWEffect = false;
for (let player of players) {
  // Apply during slashing phase
  if (player.charId === 'vergil' && player.judgementCutPhase === VERGIL_JUDGMENT_CUT_PHASES.SLASHING) {
    applyBWEffect = true;
    break;
  }
  
  // Apply during lines, preparing, and slide phases (until shards start falling)
  if (player.judgementCutEffect && 
      (player.judgementCutEffect.phase === 'lines' || 
       player.judgementCutEffect.phase === 'preparing' ||
       player.judgementCutEffect.phase === 'slide')) {
    applyBWEffect = true;
    break;
  }
}
  ctx.save();
    if (applyBWEffect) {
    ctx.filter = "grayscale(100%) contrast(130%) brightness(1)";
  }
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
// NEW: Blue overlay during slashing and lines phases
// NEW: Blue overlay during entire Judgment Cut sequence
let showBlueOverlay = false;

for (let player of players) {
  // Show blue overlay during slashing phase
  if (player.charId === 'vergil' && player.judgementCutPhase === VERGIL_JUDGMENT_CUT_PHASES.SLASHING) {
    showBlueOverlay = true;
  }
  
  // Show blue overlay during lines phase (the white lines appearing)
  if (player.judgementCutEffect && player.judgementCutEffect.phase === 'lines') {
    showBlueOverlay = true;
  }
}

// Draw blue overlay with consistent intensity
if (showBlueOverlay) {
  ctx.save();
  ctx.globalAlpha = 0.5; // Same blue intensity throughout entire Judgment Cut
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.restore();
}
// NEW: Draw huge slashing animation during slashing phase
for (let player of players) {
if (player.charId === 'vergil' && 
    player.judgementCutPhase === VERGIL_JUDGMENT_CUT_PHASES.SLASHING) {
    
    ctx.save();
    
    if (vergilSlashingSprite.complete && vergilSlashingSprite.naturalWidth > 0) {
      // Draw like a big character sprite at Vergil's position
      const slashAnim = characterSprites.vergil.slashing;
      if (slashAnim) {
        const frameWidth = vergilSlashingSprite.naturalWidth / slashAnim.frames;
        const frameHeight = vergilSlashingSprite.naturalHeight;
        
        // adjust slash size
        const bigSize = PLAYER_SIZE * 5;
        const spriteX = player.x + player.w/2 - bigSize/2; // Center on Vergil's position
        const spriteY = player.y + player.h/2 - bigSize/2; // Center on Vergil's position
        
        // No rotation, just draw it like a character sprite but bigger
        ctx.globalAlpha = 0.9;
        ctx.drawImage(
          vergilSlashingSprite,
          frameWidth * player.slashAnimationFrame, 0, frameWidth, frameHeight, // Source frame
          spriteX, spriteY, bigSize, bigSize // Draw at Vergil's position but much bigger
        );
      }
    }
    
    ctx.restore();
  }
}

  // Draw players with enhanced sprite scaling
  for(let i=0; i<players.length; i++) {
    let p = players[i];
    if(!p.alive && getAnimForPlayer(p) && p.animState !== "defeat") continue;

      // NEW: Skip drawing Vergil if he's invisible during Judgment Cut
  if (p.charId === 'vergil' && p.isInvisibleDuringJudgmentCut) {
    continue; // Don't draw Vergil when he's invisible
  }

    // Draw Vergil's teleport trail first (behind character)
   if (p.charId === 'vergil' && p.teleportTrail && p.teleportTrail.duration > 0) {
  ctx.save();
  ctx.globalAlpha = p.teleportTrail.alpha;
  
  // NEW: Draw custom sprite trail
  if (vergilTeleportTrailSprite.complete && vergilTeleportTrailSprite.naturalWidth > 0) {
    // Option 1: Use a dedicated trail sprite
    ctx.drawImage(vergilTeleportTrailSprite, p.teleportTrail.x, p.teleportTrail.y, p.w, p.h);
  } else {
    // Option 2: Use the same sprite as the character but with effects
    let trailAnim = characterSprites[p.charId][p.teleportTrail.animState];
    let trailSpritesheet = trailAnim && spritesheetCache[trailAnim.src];
    
    if (trailAnim && trailSpritesheet && trailSpritesheet.complete && trailSpritesheet.naturalWidth > 0) {
      // Calculate scale factors
      const scaleX = p.w / trailAnim.w;
      const scaleY = p.h / trailAnim.h;
      
      // Add blue tint and shadow effect
      ctx.shadowColor = "#4a90e2";
      ctx.shadowBlur = 15;
      ctx.filter = "hue-rotate(200deg) brightness(0.7)"; // Blue tint effect
      
      if (p.teleportTrail.facing === 1) {
        // Flipped rendering
        ctx.save();
        ctx.translate(p.teleportTrail.x + p.w/2, p.teleportTrail.y + p.h/2);
        ctx.scale(-scaleX, scaleY);
        ctx.translate(-trailAnim.w/2, -trailAnim.h/2);
        ctx.drawImage(
          trailSpritesheet,
          trailAnim.w * p.teleportTrail.frame, 0, trailAnim.w, trailAnim.h,
          0, 0, trailAnim.w, trailAnim.h
        );
        ctx.restore();
      } else {
        // Normal rendering
        ctx.drawImage(
          trailSpritesheet,
          trailAnim.w * p.teleportTrail.frame, 0, trailAnim.w, trailAnim.h,
          p.teleportTrail.x, p.teleportTrail.y, p.w, p.h
        );
      }
    } else {
      // Fallback to original rectangle effect
      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(p.teleportTrail.x, p.teleportTrail.y, p.w, p.h);
      ctx.strokeStyle = "#4a90e2";
      ctx.lineWidth = 2;
      ctx.strokeRect(p.teleportTrail.x, p.teleportTrail.y, p.w, p.h);
    }
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

    // ENHANCED: Draw player sprite with dynamic scaling
    let anim = getAnimForPlayer(p);
    let spritesheet = anim && spritesheetCache[anim.src];
    
    ctx.save();
    
    // Apply Vergil's teleport transparency
    if (p.charId === 'vergil' && p.teleportAlpha < 1.0) {
      ctx.globalAlpha = p.teleportAlpha;
    }
    
    if (anim && spritesheet && spritesheet.complete && spritesheet.naturalWidth > 0) {
      // Calculate scale factors to fit sprite to player's collision box
      const scaleX = p.w / anim.w;
      const scaleY = p.h / anim.h;
      
      if (p.facing === 1) {
        // Flipped rendering with scaling
        ctx.save();
        ctx.translate(p.x + p.w/2, p.y + p.h/2);
        ctx.scale(-scaleX, scaleY);
        ctx.translate(-anim.w/2, -anim.h/2);
        ctx.drawImage(
          spritesheet,
          anim.w * p.animFrame, 0, anim.w, anim.h,
          0, 0, anim.w, anim.h
        );
        ctx.restore();
      } else {
        // Normal rendering with scaling - fit sprite to player's actual size
        ctx.drawImage(
          spritesheet,
          anim.w * p.animFrame, 0, anim.w, anim.h,
          p.x, p.y, p.w, p.h // Scale to player's collision box size
        );
      }
    } else {
      // Fallback to colored rectangle
      ctx.fillStyle = p.color;
      ctx.strokeStyle = PLAYER_OUTLINE;
      ctx.lineWidth = 3;
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.strokeRect(p.x, p.y, p.w, p.h);
    }
    
    // Add teleport effect particles when teleporting , after image
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
      ctx.font = "bold 15px Arial";
      ctx.textAlign = "center";
      ctx.strokeStyle = "#23243a";
      ctx.lineWidth = 3;
      ctx.strokeText(p.name, p.x + p.w/2, p.y - 28);
      ctx.fillStyle = p.color;
      ctx.fillText(p.name, p.x + p.w/2, p.y - 28);
      ctx.restore();
    }

    // Draw Block Bar Below Player (unchanged), block bar blockbar
    const barWidth = p.w;
    const barHeight = 10;
    const barX = p.x;
    const barY = p.y + p.h + 8;
    const blockRatio = Math.max(0, p.block) / BLOCK_MAX;

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

    // Draw "Block" label
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "#bbb";
    ctx.globalAlpha = 0.84;
    ctx.fillText("Block", barX + barWidth/2, barY + barHeight + 12);
    ctx.globalAlpha = 1;
    ctx.restore();
  }
   drawParticles(ctx);

  // NEW: Draw impact effects (should be drawn after players but before UI elements)
  drawImpactEffects(ctx);


  // NEW: Draw Judgment Cut lines
  for (let p of players) {
    if (p.judgementCutEffect && p.judgementCutEffect.phase === 'lines') {
      const effect = p.judgementCutEffect;
      
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2.5;
      ctx.shadowColor = "#3EB7FA";
      ctx.shadowBlur = 10;

      for (let i = 0; i < Math.min(effect.visibleLines, effect.lines.length); i++) {
        const line = effect.lines[i];
        const [x1, y1, x2, y2] = line;
        const worldX1 = effect.cameraX + x1;
        const worldY1 = effect.cameraY + y1;
        const worldX2 = effect.cameraX + x2;
        const worldY2 = effect.cameraY + y2;
        
        ctx.beginPath();
        ctx.moveTo(worldX1, worldY1);
        ctx.lineTo(worldX2, worldY2);
        ctx.stroke();
      }
      
      ctx.restore();
    }
  }

// NEW: Draw Judgment Cut shards with blue tint
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
      // shards lines and color, shards, lines and shards, shards and lines, shards color
      effectCtx.fillStyle = "rgba(0, 0, 0, 0.2)"; // #4a90e2 with transparency
      effectCtx.fill();
      effectCtx.strokeStyle = "rgb(0, 0, 0)"; // Same blue for border
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

  // Draw winner text
  if(winner !== null) {
    ctx.font = "44px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffeb3b";
    ctx.fillText(`${players[winner].name || `Player ${winner+1}`} Wins!`, WIDTH/2, HEIGHT/2);
  }
}

function gameLoop() {
  updateCameraZoomEffect();
  
  // NEW: Update Vergil's slashing animation even when paused
  for (let i = 0; i < players.length; ++i) {
    const p = players[i];
    if (p.charId === 'vergil' && p.judgementCutPhase === VERGIL_JUDGMENT_CUT_PHASES.SLASHING) {
      p.slashAnimationTimer++;
      if (p.slashAnimationTimer >= 3) {
        p.slashAnimationTimer = 0;
        p.slashAnimationFrame++;
        const slashAnim = characterSprites.vergil.slashing;
        if (slashAnim && p.slashAnimationFrame >= slashAnim.frames) {
          p.slashAnimationFrame = 0; // Loop the animation
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

              // reads sprite sheathing real time on shards
        if (p.updateShardsInRealTime && p.judgementCutPhase === VERGIL_JUDGMENT_CUT_PHASES.SHEATHING) {
            updateSnapshotWithVergil(p);
        }

        // NEW: End sheathing animation and return to normal
setTimeout(() => {
    if (character.judgementCutPhase === VERGIL_JUDGMENT_CUT_PHASES.SHEATHING) {
        character.judgementCutPhase = null;
        character.animState = "idle";
        character.animFrame = 0;
        character.animTimer = 0;
        character.updateShardsInRealTime = false; // NEW: Stop real-time updates
        console.log("Judgment Cut complete!");
    }
}, JUDGEMENT_CUT_CONSTANTS.LINE_DISPLAY_DURATION + 1500);
      if (p.block >= BLOCK_MAX - 0.1 && !p.blockWasFull) {
        p.blockGlowTimer = 30;
      }
      p.blockWasFull = p.block >= BLOCK_MAX - 0.1;
      if (p.blockGlowTimer > 0) p.blockGlowTimer--;
    }
    handleDashAttack();
    
    // NEW: Update impact effects
    updateImpactEffects();
  }
  
  updateUI();
  updateParticles();
  draw();
  requestAnimationFrame(gameLoop);
}

// NEW: Add character selection functionality
// Press '1' to make Player 1 Vergil, Press '2' to make Player 2 Vergil
document.addEventListener("keydown", function(e) {
  if (e.key === "1") {
    // Make Player 1 Vergil
    const p = players[0];
    p.charId = "vergil";
    p.name = "Vergil";
    p.color = "#4a90e2";
    // Initialize Vergil-specific properties
    p.judgementCutCooldown = 0;
    p.effectCanvas = null;
    p.effectCtx = null;
    p.snapCanvas = null;
    p.snapCtx = null;
    p.judgementCutEffect = null;
    p.teleportTrail = null;
    p.isTeleporting = false;
    p.teleportAlpha = 1.0;
    console.log("Player 1 is now Vergil! Press 'E' for Judgment Cut!");
  }
  
  if (e.key === "2") {
    // Make Player 2 Vergil
    const p = players[1];
    p.charId = "vergil";
    p.name = "Vergil";
    p.color = "#4a90e2";
    // Initialize Vergil-specific properties
    p.judgementCutCooldown = 0;
    p.effectCanvas = null;
    p.effectCtx = null;
    p.snapCanvas = null;
    p.snapCtx = null;
    p.judgementCutEffect = null;
    p.teleportTrail = null;
    p.isTeleporting = false;
    p.teleportAlpha = 1.0;
    console.log("Player 2 is now Vergil! Press 'P' for Judgment Cut!");
  }
});

gameLoop();
