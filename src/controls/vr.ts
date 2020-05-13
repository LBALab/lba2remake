import { each } from 'lodash';
import * as THREE from 'three';
import { WebXRManager } from 'three/src/renderers/webxr/WebXRManager';
import { MotionController } from '@webxr-input-profiles/motion-controllers';
import ControllerModel from './vr/ControllerModel';
import { createMotionController } from './vr/utils';
import { debugProfiles } from './vr/debugProfiles';

export class VRControls {
    xr: WebXRManager;
    ctx: any;
    controllers: {
        [key: number]: {
            specs: MotionController;
            model: ControllerModel;
        }
    };
    pointers: any[];
    activePointer: number;
    triggered: boolean;

    constructor(sceneManager: any, game: any, renderer: any) {
        this.xr = renderer.threeRenderer.xr;
        this.ctx = { sceneManager, game };
        this.controllers = {};
        this.pointers = [];
        this.triggered = false;
        this.activePointer = null;
        this.onInputSourcesChange = this.onInputSourcesChange.bind(this);
        this.initializeVRController(0);
        this.initializeVRController(1);
        debugProfiles(this);
    }

    dispose() {}

    update() {
        each(this.controllers, (controller) => {
            controller.specs.updateFromGamepad();
            controller.model.update();
        });
        for (let i = 0; i < 2; i += 1) {
            if (this.activePointer === i) {
                const vrController = this.xr.getController(i);
                this.ctx.game.controlsState.vrPointerTransform.copy(vrController.matrixWorld);
            }
        }
        this.ctx.game.controlsState.vrTriggered = this.triggered;
        this.triggered = false;
    }

    onInputSourcesChange(event) {
        event.added.forEach((xrInputSource) => {
            createMotionController(xrInputSource);
        });
    }

    initializeVRController(index) {
        const vrControllerGrip = this.xr.getControllerGrip(index);

        vrControllerGrip.addEventListener('connected', async (event) => {
            const specs = await createMotionController(event.data);
            const model = await new ControllerModel(specs).load();
            vrControllerGrip.add(model.threeObject);
            this.controllers[index] = {
                specs,
                model
            };
        });

        vrControllerGrip.addEventListener('disconnected', () => {
            const controller = this.controllers[index];
            if (controller && controller.model) {
                vrControllerGrip.remove(this.controllers[index].model.threeObject);
            }
            delete this.controllers[index];
        });

        const vrController = this.xr.getController(index);

        vrController.addEventListener('connected', () => {
            const pointerGeom = new THREE.ConeGeometry(0.002, 0.4, 4);
            const pointerMaterial = new THREE.MeshBasicMaterial({
                color: 0xFFFFFF,
                transparent: true,
                opacity: 0.5
            });
            const pointer = new THREE.Mesh(pointerGeom, pointerMaterial);
            pointer.position.set(0, 0, -0.2);
            pointer.rotation.x = -Math.PI / 2;
            pointer.rotation.y = Math.PI / 4;
            pointer.visible = false;

            vrController.add(pointer);
            this.pointers[index] = pointer;
            if (this.activePointer === null) {
                this.activatePointer(index);
            }
        });

        vrController.addEventListener('disconnected', () => {
            if (vrController.children.length) {
                vrController.remove(this.pointers[index]);
            }
        });

        vrController.addEventListener('selectstart', () => {
            if (this.activePointer === null) {
                this.activatePointer(index);
            }
            if (this.activePointer !== index) {
                this.activatePointer(index);
            } else {
                this.triggered = true;
            }
        });
    }

    activatePointer(idx) {
        this.activePointer = idx;
        if (this.pointers[1 - idx]) {
            this.pointers[1 - idx].visible = false;
        }
        this.pointers[idx].visible = true;
    }
}
