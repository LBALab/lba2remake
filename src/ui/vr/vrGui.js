import { createVRCube } from './vrCube';
import { createFPSCounter } from './vrFPS';
import { createMenu, updateMenu } from './vrMenu';

let gui = null;

export function addVRGuiNode(renderer, controlNode) {
    if (!renderer.vr)
        return;

    if (!gui) {
        gui = createVRGui(renderer);
    }

    controlNode.add(gui.cube);
}

export function updateVRGui(presenting, game, sceneManager) {
    if (!gui)
        return;

    gui.cube.visible = presenting;
    updateMenu(game, sceneManager);
}

function createVRGui(renderer) {
    const cube = createVRCube();
    const fps = createFPSCounter(renderer);
    const menu = createMenu(renderer);
    cube.add(fps);
    cube.add(menu);
    return {
        cube,
        fps
    };
}
