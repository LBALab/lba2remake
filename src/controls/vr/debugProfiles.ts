import * as THREE from 'three';
import { each } from 'lodash';
import { WebXRManager } from 'three/src/renderers/webxr/WebXRManager';
import { MotionController } from '@webxr-input-profiles/motion-controllers';
import ControllerModel, { LabelParams } from './ControllerModel';
import MockXRInputSource from './MockXRInputSource';
import { createMotionController } from './utils';
import { Mappings } from './mappings';

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
            mappings?: Mappings;
        }
    };
    updateMappings: () => void;
}

export function debugProfiles(ctx: Context) {
    ctx.xr.getController(0).addEventListener('squeezestart', () => {
        switchProfile(ctx);
    });
    /*
    ctx.xr.getController(1).addEventListener('squeezestart', () => {
        console.log(JSON.stringify(LabelParams, null, 2));
    });
    */
    window.addEventListener('keydown', (e) => {
        if (e.code === 'KeyC') {
            switchProfile(ctx);
        }
    });
}

export function updateDebug(ctx: Context) {
    let update = false;
    each(ctx.controllers, async (controller) => {
        const { components, xrInputSource, id } = controller.info;
        const handedness = (xrInputSource as any).handedness;
        if (handedness === 'left' && 'xr-standard-thumbstick' in components) {
            const values = components['xr-standard-thumbstick'].values;
            if (values.xAxis || values.yAxis) {
                addProfile(id);
                LabelParams[id].center.x += values.xAxis * 0.002;
                LabelParams[id].center.y += values.yAxis * 0.002;
                update = true;
            }
        } else if (handedness === 'right' && 'xr-standard-thumbstick' in components) {
            const values = components['xr-standard-thumbstick'].values;
            if (values.xAxis || values.yAxis) {
                addProfile(id);
                LabelParams[id].center.z += values.yAxis * 0.002;
                LabelParams[id].radius += values.xAxis * 0.002;
                update = true;
            }
        }
    });
    if (update) {
        each(ctx.controllers, async (controller) => {
            controller.model.loadLabels(controller.mappings, true);
        });
    }
}

function addProfile(id) {
    if (!(id in LabelParams)) {
        LabelParams[id] = {
            center: new THREE.Vector3().copy(LabelParams.default.center),
            radius: LabelParams.default.radius
        };
    }
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
