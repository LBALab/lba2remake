import * as THREE from 'three';
import { each } from 'lodash';
import { createScreen } from './vrScreen';
import { createHands, handlePicking } from './vrHands';
import { createTeleportMenu, updateTeleportMenu } from './vrTeleportMenu';
import ControllerScreens from './data/controllerScreens';
import { drawFrame } from './vrUtils';

let menuNode = null;
let teleportMenu = null;
let mainMenu = null;
let controllerInfo = null;
let resume = null;

export function createMenu(menuTexts, renderer, light) {
    menuNode = new THREE.Object3D();

    mainMenu = new THREE.Object3D();
    menuNode.add(mainMenu);
    resume = createMenuItem({
        // Resume Game
        text: menuTexts[70].value,
        y: 150,
        callback: ({game}) => {
            const audioMenuManager = game.getAudioMenuManager();
            audioMenuManager.getMusicSource().stop();
            game.resume();
            game.setUiState({ showMenu: false });
        }
    });
    mainMenu.add(resume);
    mainMenu.add(createMenuItem({
        // New Game
        text: menuTexts[71].value,
        y: 0,
        callback: ({game, sceneManager}) => {
            game.resume();
            game.resetState();
            sceneManager.hideMenuAndGoto(0, false);
        }
    }));
    mainMenu.add(createMenuItem({
        text: 'Teleport',
        y: -150,
        callback: ({game}) => {
            game.setUiState({ teleportMenu: true });
        }
    }));

    const hands = createHands(renderer);
    menuNode.add(hands);

    teleportMenu = createTeleportMenu(light);
    menuNode.add(teleportMenu);

    return menuNode;
}

export function updateMenu(game, sceneManager) {
    const { controlsState } = game;
    const { showMenu, teleportMenu: showTeleportMenu, inGameMenu } = game.getUiState();
    menuNode.visible = showMenu;
    mainMenu.visible = !showTeleportMenu;
    resume.visible = inGameMenu;
    teleportMenu.visible = showTeleportMenu;
    if (showMenu) {
        if (showTeleportMenu) {
            updateTeleportMenu(game, sceneManager);
            if (controlsState.backButton) {
                game.setUiState({teleportMenu: false});
            }
        } else {
            handlePicking(mainMenu.children, {game, sceneManager});
        }
    } else if (controlsState.backButton) {
        game.pause();
        const audioMenuManager = game.getAudioMenuManager();
        audioMenuManager.getMusicSource().load(6, () => {
            audioMenuManager.getMusicSource().play();
        });
        game.setUiState({showMenu: true, teleportMenu: false, inGameMenu: true});
    }
    if (!controllerInfo && controlsState.controllerType) {
        controllerInfo = createControllerInfo(controlsState.controllerType);
        menuNode.add(controllerInfo);
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
    drawFrame(ctx, 0, 0, width, height, true);
    ctx.font = '50px LBA';
    ctx.fillStyle = 'white';
    ctx.shadowColor = 'black';
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, width / 2, height / 2);
    mesh.material.map.needsUpdate = true;
    mesh.visible = true;
    mesh.userData = { callback };

    return mesh;
}

function createControllerInfo(type) {
    const info = ControllerScreens[type];
    const {ctx, mesh} = createScreen({
        width: info.width,
        height: info.height,
        angle: info.angle,
        x: info.x,
        z: info.z
    });

    const icon = new Image(info.width, info.height);
    icon.src = `images/vr_controllers/${type}.png`;

    function draw() {
        drawFrame(ctx, 0, 0, info.width, info.height, false);
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'white';
        ctx.shadowColor = 'black';
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.drawImage(icon, 0, 0, info.width, info.height);
        each(info.labels, (label) => {
            ctx.textAlign = label.textAlign;
            ctx.font = `${label.fontSize}px LBA`;
            const lines = label.text.split('\n');
            each(lines, (line, idx) => {
                ctx.fillText(line, label.x, label.y + (idx * label.fontSize));
            });
        });
        mesh.material.map.needsUpdate = true;
    }

    icon.onload = () => draw();

    return mesh;
}
