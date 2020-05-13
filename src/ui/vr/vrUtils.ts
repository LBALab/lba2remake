export function drawFrame(ctx, x, y, w, h, selected = true, radius = 20, lineWidth = 4) {
    ctx.clearRect(x, y, w, h);
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'black';
    ctx.fillStyle = selected ? 'rgb(32, 162, 255)' : 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = lineWidth;
    drawRoundRect(ctx, x + 2, y + 2, w - 4, h - 4, radius);
    ctx.fill();
    ctx.stroke();
}

function drawRoundRect(ctx, x, y, w, h, radius) {
    if (w < 2 * radius) radius = w / 2;
    if (h < 2 * radius) radius = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
}
