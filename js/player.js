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