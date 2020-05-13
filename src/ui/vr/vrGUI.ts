import * as THREE from 'three';
import { each } from 'lodash';
import { getPickingTarget, handlePicking } from './picking';
import { createScreen } from './vrScreen';
import { drawFrame } from './vrUtils';

let choice = null;

export function createVRGUI() {
    const vrGUI = new THREE.Object3D();
    vrGUI.add(getPickingTarget());
    return vrGUI;
}

export function updateVRGUI(game, scene, vrGUI) {
    const {ask} = game.getUiState();
    if (ask.text) {
        if (choice) {
            handlePicking(choice.children, {game, scene});
        } else {
            choice = new THREE.Object3D();
            vrGUI.add(choice);
            let i = 0;
            each(ask.choices, (c) => {
                choice.add(createItem({
                    x: 0,
                    y: -(i * 150) + (ask.choices.length * 75),
                    text: c.text.value,
                    callback: () => {
                        game.setUiState({choice: c.value}, () => {
                            if (game.controlsState.skipListener) {
                                game.controlsState.skipListener();
                            }
                        });
                    }
                }));
                i += 1;
            });
        }
    } else if (choice) {
        vrGUI.remove(choice);
        choice = null;
    } else {
        handlePicking([], {game, scene});
    }
}

function createItem({x, y, text, callback}) {
    const width = 800;
    const height = 100;
    const {ctx, mesh} = createScreen({
        width,
        height,
        x,
        y
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
