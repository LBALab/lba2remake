import * as THREE from 'three';
import { createScreen } from './vrScreen';
import { createHands, handlePicking } from './vrHands';
import { createTeleportMenu, updateTeleportMenu } from './vrTeleportMenu';

let menuNode = null;
let teleportMenu = null;
let mainMenu = null;

export function createMenu(renderer) {
    menuNode = new THREE.Object3D();

    mainMenu = new THREE.Object3D();
    menuNode.add(mainMenu);
    mainMenu.add(createMenuItem({
        text: 'New Game',
        y: 75,
        callback: ({game, sceneManager}) => {
            game.resume();
            game.resetState();
            sceneManager.hideMenuAndGoto(0, false);
        }
    }));
    mainMenu.add(createMenuItem({
        text: 'Teleport',
        y: -75,
        callback: ({game}) => {
            game.setUiState({ teleportMenu: true });
        }
    }));

    const hands = createHands(renderer);
    menuNode.add(hands);

    teleportMenu = createTeleportMenu();
    menuNode.add(teleportMenu);
    return menuNode;
}

export function updateMenu(game, sceneManager) {
    const { showMenu, teleportMenu: showTeleportMenu } = game.getUiState();
    menuNode.visible = showMenu;
    mainMenu.visible = !showTeleportMenu;
    teleportMenu.visible = showTeleportMenu;
    if (showMenu && !showTeleportMenu) {
        handlePicking(mainMenu.children, {game, sceneManager});
    } else if (showTeleportMenu) {
        updateTeleportMenu(game);
    }
}

function createMenuItem({x, y, text, callback}) {
    const width = 800;
    const height = 100;
    const {ctx, mesh} = createScreen({
        width,
        height,
        x,
        y,
    });

    ctx.font = '50px LBA';
    ctx.clearRect(0, 0, width, height);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'black';
    ctx.fillStyle = 'rgba(32, 162, 255, 0.6)';
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
    mesh.userData = { callback };

    return mesh;
}

function roundRect(ctx, x, y, w, h, r) {
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
