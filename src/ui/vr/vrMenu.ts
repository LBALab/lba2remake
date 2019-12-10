import * as THREE from 'three';
import { each } from 'lodash';
import { createScreen } from './vrScreen';
import { getOrCreateHands, handlePicking } from './vrHands';
import { createTeleportMenu, updateTeleportMenu } from './vrTeleportMenu';
import controllerScreens from './data/controllerScreens';
import { drawFrame } from './vrUtils';
import {tr} from '../../lang';
import VideoData from '../../video/data';

let menuNode = null;
let teleportMenu = null;
let mainMenu = null;
let controllerInfo = null;
let resume = null;
let hands = null;

export function createMenu(game, sceneManager, renderer, light) {
    menuNode = new THREE.Object3D();

    mainMenu = new THREE.Object3D();
    menuNode.add(mainMenu);
    resume = createMenuItem({
        // Resume Game
        text: game.menuTexts[70].value,
        y: 150,
        callback: () => {
            const audioMenuManager = game.getAudioMenuManager();
            audioMenuManager.getMusicSource().stop();
            game.resume();
            game.setUiState({ showMenu: false });
            history.pushState({id: 'game'}, '');
        }
    });
    mainMenu.add(resume);
    mainMenu.add(createMenuItem({
        // New Game
        text: game.menuTexts[71].value,
        y: 0,
        callback: () => {
            const audioMenuManager = game.getAudioMenuManager();
            audioMenuManager.getMusicSource().stop();

            const src = VideoData.VIDEO.find(v => v.name === 'INTRO').file;
            const onEnded = () => {
                game.setUiState({video: null});
                game.controlsState.skipListener = null;
                game.resume();
                game.resetState();
                sceneManager.goto(0, false);
            };
            game.controlsState.skipListener = onEnded;
            game.setUiState({
                showMenu: false,
                video: {
                    src,
                    onEnded
                }
            });
            history.pushState({id: 'game'}, '');
        }
    }));
    mainMenu.add(createMenuItem({
        text: tr('teleport'),
        y: -150,
        callback: () => {
            game.setUiState({ teleportMenu: true });
            history.pushState({id: 'teleport'}, '');
        }
    }));

    mainMenu.add(createOptionMenuItem({
        text: tr('Camera'),
        title: true,
        y: 50
    }).mesh);

    async function switchCameraMode(firstPersonMode) {
        game.controlsState.firstPerson = firstPersonMode;
        localStorage.setItem('vrFirstPerson', firstPersonMode.toString());
        firstPerson.draw();
        thirdPerson.draw();
        const scene = sceneManager.getScene();
        if (scene) {
            await sceneManager.goto(scene.index, true, true);
            game.pause();
            game.setUiState({showMenu: true});
            menuNode.add(hands);
            hands.visible = true;
        }
    }
    const firstPerson = createOptionMenuItem({
        text: tr('1stPerson'),
        y: -50,
        selected: () => game.controlsState.firstPerson,
        callback: () => {
            switchCameraMode(true);
        }
    });
    const thirdPerson = createOptionMenuItem({
        text: tr('3rdPerson'),
        y: -150,
        selected: () => !game.controlsState.firstPerson,
        callback: () => {
            switchCameraMode(false);
        }
    });

    mainMenu.add(firstPerson.mesh);
    mainMenu.add(thirdPerson.mesh);

    window.onpopstate = (event) => {
        const {showMenu} = game.getUiState();
        if (!showMenu) {
            menuNode.add(hands);
            hands.visible = true;
            game.pause();
            const audioMenuManager = game.getAudioMenuManager();
            audioMenuManager.getMusicSource().load(6, () => {
                audioMenuManager.getMusicSource().play();
            });
            game.setUiState({inGameMenu: true, video: null});
        }
        game.setUiState({
            showMenu: true,
            teleportMenu: event.state && event.state.id === 'teleport',
            video: null
        });
    };

    history.replaceState({id: 'menu'}, '');

    hands = getOrCreateHands(renderer);
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
        } else {
            handlePicking(mainMenu.children, {game, sceneManager});
        }
    }
    if (!controllerInfo && controlsState.controllerType) {
        controllerInfo = createControllerInfo(controlsState.controllerType);
        menuNode.add(controllerInfo);
    }
}

interface MenuItemParams {
    y?: number;
    text: string;
    callback?: Function;
}

function createMenuItem({y, text, callback}: MenuItemParams) {
    const width = 800;
    const height = 100;
    const {ctx, mesh} = createScreen({
        width,
        height,
        y,
    });
    const draw = (hovering = false) => {
        drawFrame(ctx, 0, 0, width, height, hovering);
        ctx.font = '50px LBA';
        ctx.fillStyle = 'white';
        ctx.shadowColor = 'black';
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 4;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, width / 2, height / 2);
        (mesh.material as THREE.MeshBasicMaterial).map.needsUpdate = true;
    };
    draw();
    mesh.visible = true;
    mesh.userData = {
        callback,
        onEnter: () => draw(true),
        onLeave: () => draw()
    };

    return mesh;
}

interface OptionsMenuItemParams {
    y?: number;
    title?: boolean;
    text: string;
    callback?: Function;
    selected?: Function;
}

function createOptionMenuItem({y, text, title, callback, selected}: OptionsMenuItemParams) {
    const width = 400;
    const height = 75;
    const {ctx, mesh} = createScreen({
        width,
        height,
        x: -1000,
        y,
        z: 700,
        angle: -45,
    });
    const draw = (hovering = false) => {
        const isSelected = title || (selected && selected());
        if (!title) {
            drawFrame(ctx, 0, 0, width, height, isSelected);
        }
        ctx.font = title ? '40px LBA' : '30px LBA';
        ctx.fillStyle = isSelected || hovering ? 'white' : 'grey';
        ctx.shadowColor = 'black';
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 4;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, width / 2, height / 2);
        (mesh.material as THREE.MeshBasicMaterial).map.needsUpdate = true;
    };
    draw();
    mesh.visible = true;

    if (!title) {
        mesh.userData = {
            callback,
            onEnter: () => draw(true),
            onLeave: () => draw()
        };
    }

    return {mesh, draw};
}

function createControllerInfo(type) {
    const info = controllerScreens(type);
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
            each(lines, (line, idx: number) => {
                ctx.fillText(line, label.x, label.y + (idx * label.fontSize));
            });
        });
        (mesh.material as THREE.MeshBasicMaterial).map.needsUpdate = true;
    }

    icon.onload = () => draw();

    return mesh;
}
