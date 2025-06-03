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