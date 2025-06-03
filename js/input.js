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