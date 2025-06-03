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