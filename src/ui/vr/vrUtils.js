export function drawFrame(ctx, x, y, w, h, selected = true) {
    ctx.clearRect(x, y, w, h);
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'black';
    ctx.fillStyle = selected ? 'rgb(32, 162, 255)' : 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = 4;
    drawRoundRect(ctx, x + 2, y + 2, w - 4, h - 4, 20);
    ctx.fill();
    ctx.stroke();
}

function drawRoundRect(ctx, x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}
