import * as THREE from 'three';
import { createScreen } from './vrScreen';

export function createMainMenu() {
    const newGame = createMenuItem({text: 'New Game', y: 75});
    const teleport = createMenuItem({text: 'Teleport', y: -75});
    const menu = new THREE.Object3D();
    const skybox = createSkybox();
    menu.add(skybox);
    menu.add(newGame);
    menu.add(teleport);
    return menu;
}

function createMenuItem({x, y, text}) {
    const width = 800;
    const height = 100;
    const {ctx, mesh} = createScreen({
        width,
        height,
        x,
        y,
    });

    ctx.font = '48px LBA';
    ctx.clearRect(0, 0, width, height);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'rgba(97, 206, 206, 0.8)';
    ctx.fillStyle = 'rgba(32, 162, 255, 0.5)';
    ctx.lineWidth = 4;
    roundRect(ctx, 2, 2, width - 4, height - 4, 20);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'white';
    ctx.shadowColor = 'black';
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;
    ctx.fillText(text, width / 2, height / 2);
    mesh.material.map.needsUpdate = true;
    mesh.visible = true;

    return mesh;
}

function roundRect(ctx, x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.strokeStyle = 'rgb(65,174,174)';
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

function createSkybox() {
    const geometry = new THREE.BoxBufferGeometry(4, 4, 4);
    const material = new THREE.MeshBasicMaterial({
        color: 0x1E3F43,
        transparent: true,
        side: THREE.BackSide,
    });
    return new THREE.Mesh(geometry, material);
}
