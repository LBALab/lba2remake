import { each } from 'lodash';
import { WebXRManager } from 'three/src/renderers/webxr/WebXRManager';
import { MotionController } from '@webxr-input-profiles/motion-controllers';
import ControllerModel from './ControllerModel';
import MockXRInputSource from './MockXRInputSource';
import { createMotionController } from './utils';

const vrProfiles = [
    'generic-button',
    'generic-touchpad',
    'generic-trigger-squeeze-thumbstick',
    'generic-trigger-squeeze-touchpad-thumbstick',
    'generic-trigger-squeeze-touchpad',
    'generic-trigger-squeeze',
    'generic-trigger-thumbstick',
    'generic-trigger-touchpad-thumbstick',
    'generic-trigger-touchpad',
    'generic-trigger',
    'google-daydream',
    'htc-vive-cosmos',
    'htc-vive-focus-plus',
    'htc-vive-focus',
    'htc-vive',
    'magicleap-one',
    'microsoft-mixed-reality',
    'oculus-go',
    'oculus-touch-v2',
    'oculus-touch',
    'samsung-gearvr',
    'samsung-odyssey',
    'valve-index'
];

let selectedProfile = -1;

interface Context {
    xr: WebXRManager;
    controllers: {
        [key: number]: {
            info: MotionController;
            model: ControllerModel;
        }
    };
    updateMappings: () => void;
}

export function debugProfiles(ctx: Context) {
    ctx.xr.getController(0).addEventListener('squeezestart', () => {
        switchProfile(ctx);
    });
    window.addEventListener('keydown', (e) => {
        if (e.code === 'KeyC') {
            switchProfile(ctx);
        }
    });
}

function switchProfile(ctx: Context) {
    selectedProfile = (selectedProfile + 1) % vrProfiles.length;
    each(ctx.controllers, async (controller, idx) => {
        const index = Number(idx);
        const controllerGrip = ctx.xr.getControllerGrip(index);
        const xrInputSource = controller.info.xrInputSource as any;
        const inputSource = new MockXRInputSource(
            [vrProfiles[selectedProfile]],
            xrInputSource.gamepad,
            xrInputSource.handedness
        );
        const info = await createMotionController(inputSource);
        const model = await new ControllerModel(info).load();
        controllerGrip.remove(controller.model.threeObject);
        controllerGrip.add(model.threeObject);
        controller.model = model;
        controller.info = info;
        ctx.updateMappings();
    });
}
