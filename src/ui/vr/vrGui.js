import { createVRCube } from './vrCube';
import { createFPSCounter } from './vrFPS';
import { createMenu, updateMenu } from './vrMenu';

let gui = null;

export function addVRGuiNode(renderer, controlNode, light) {
    if (!renderer.vr)
        return;

    if (!gui) {
        gui = createVRGui(renderer, light);
    }

    controlNode.add(gui.cube);
}

export function updateVRGui(presenting, game, sceneManager) {
    if (!gui)
        return;

    gui.cube.visible = presenting;
    updateMenu(game, sceneManager);
}

function createVRGui(renderer, light) {
    const cube = createVRCube();
    const fps = createFPSCounter(renderer);
    const menu = createMenu(renderer, light);
    cube.add(fps);
    cube.add(menu);
    return {
        cube,
        fps
    };
}
