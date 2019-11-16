import { createScreen } from './vrScreen';

export function createFPSCounter(renderer) {
    const width = 240;
    const height = 30;
    const {ctx, mesh} = createScreen({
        width,
        height,
        y: -200,
        noDepth: true
    });

    ctx.font = '25px LBA';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, width, height);

    setInterval(() => {
        const stats = renderer.stats.getStats();
        if (stats) {
            ctx.clearRect(0, 0, width, height);
            ctx.textAlign = 'center';
            ctx.shadowColor = 'transparent';
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = 'white';
            ctx.shadowColor = 'black';
            ctx.shadowOffsetX = 4;
            ctx.shadowOffsetY = 4;
            ctx.fillText(`fps: ${stats.fps} | ms: ${stats.ms}`, width / 2, 25);
            (mesh.material as THREE.MeshBasicMaterial).map.needsUpdate = true;
            mesh.visible = true;
        } else {
            mesh.visible = false;
        }
    }, 250);

    return mesh;
}
