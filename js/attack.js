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