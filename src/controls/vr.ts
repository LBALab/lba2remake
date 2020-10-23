import { each, size } from 'lodash';
import * as THREE from 'three';
import { WebXRManager } from 'three/src/renderers/webxr/WebXRManager';
import { MotionController } from '@webxr-input-profiles/motion-controllers';
import ControllerModel from './vr/ControllerModel';
import { createMotionController } from './vr/utils';
import { debugProfiles, updateDebug } from './vr/debugProfiles';
import { getControllerMappings, applyMappings, Mappings } from './vr/mappings';
import { getParams } from '../params';
import { SceneManager } from '../game/SceneManager';
import Game from '../game/Game';
import Renderer from '../renderer';
import { ControlActiveType } from '../game/ControlsState';

// Time in ms we sample the change is position to determine controller velocity.
const VELOCITY_UPDATE_TIME = 100;

export class VRControls {
    xr: WebXRManager;
    ctx: any;
    controllers: {
        [key: number]: {
            info: MotionController;
            model: ControllerModel;
            lastPosition: THREE.Vector3;
            lastUpdateTime: number;
            mappings?: Mappings;
        }
    };
    pointers: THREE.Mesh[];
    activePointer: number;
    triggered: boolean;
    skipping: boolean;

    constructor(sceneManager: SceneManager, game: Game, renderer: Renderer) {
        this.xr = renderer.threeRenderer.xr;
        this.ctx = {
            sceneManager,
            game,
            params: getParams(),
            state: {}
        };
        this.controllers = {};
        this.pointers = [];
        this.triggered = false;
        this.skipping = false;
        this.activePointer = null;
        this.onInputSourcesChange = this.onInputSourcesChange.bind(this);
        this.initializeVRController(0);
        this.initializeVRController(1);
        if (this.ctx.params.vrCtrlDBG) {
            debugProfiles(this);
        }
    }

    dispose() {}

    update() {
        const { controlsState } = this.ctx.game;
        const { showMenu, video, ask } = this.ctx.game.getUiState();
        const showController = showMenu || !!video;
        const showPointer = showController || !!ask.text;
        const scene = this.ctx.sceneManager.getScene();
        const ctx = {
            ...this.ctx,
            scene,
            camera: scene && scene.camera,
            showController
        };
        controlsState.action = 0;
        each(this.controllers, (controller, i) => {
            if (!(controller.info.xrInputSource as any).gamepad) {
                return;
            }
            this.ctx.game.controlsState.activeType = ControlActiveType.VRCONTROLS;
            controller.info.updateFromGamepad();
            controller.model.update(ctx);
            applyMappings(controller.info, controller.mappings, ctx);

            controller.model.handMesh.getWorldPosition(
                this.ctx.game.controlsState.vrControllerPositions[i]);

            if (performance.now() - controller.lastUpdateTime > VELOCITY_UPDATE_TIME) {
                controller.lastUpdateTime = performance.now();
                let velocity = controller.lastPosition.distanceToSquared(
                    this.ctx.game.controlsState.vrControllerPositions[i]);
                // Make the numbers slightly more manageable.
                velocity *= 10000;
                this.ctx.game.controlsState.vrControllerVelocities[i] = velocity;
                controller.lastPosition.copy(
                    this.ctx.game.controlsState.vrControllerPositions[i]);
            }
        });
        for (let i = 0; i < 2; i += 1) {
            if (this.pointers[i]) {
                this.pointers[i].visible = showPointer && this.activePointer === i;
            }
            if (this.activePointer === i) {
                const vrController = this.xr.getController(i);
                this.ctx.game.controlsState.vrPointerTransform.copy(vrController.matrixWorld);
            }
        }
        if (this.skipping) {
            if (controlsState.action === 0) {
                this.skipping = false;
            } else {
                controlsState.action = 0;
            }
        }
        if (controlsState.skipListener) {
            controlsState.action = 0;
        }
        controlsState.vrTriggerButton = this.triggered;
        this.triggered = false;
        if (this.ctx.params.vrCtrlDBG) {
            updateDebug(this);
        }
    }

    onInputSourcesChange(event) {
        event.added.forEach((xrInputSource) => {
            if ((xrInputSource as any).gamepad) {
                createMotionController(xrInputSource);
            }
        });
    }

    updateMappings() {
        const numControllers = size(this.controllers);
        each(this.controllers, (controller) => {
            const mappings = getControllerMappings(controller.info, numControllers);
            controller.model.loadLabels(mappings, this.ctx.params.vrCtrlDBG);
            controller.mappings = mappings;
        });
    }

    initializeVRController(index) {
        const vrControllerGrip = this.xr.getControllerGrip(index);
        this.ctx.game.controlsState.vrControllerPositions[index] = new THREE.Vector3();

        vrControllerGrip.addEventListener('connected', async (event) => {
            if (!event.data.gamepad) {
                return;
            }
            const info = await createMotionController(event.data);
            const model = await new ControllerModel(info).load();
            model.threeObject.renderOrder = 100;

            vrControllerGrip.add(model.threeObject);
            this.controllers[index] = {
                info,
                model,
                lastPosition: new THREE.Vector3(),
                lastUpdateTime: 0,
            };
            this.updateMappings();
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
            pointer.renderOrder = 100;

            vrController.add(pointer);
            this.pointers[index] = pointer;
            if (this.activePointer === null) {
                this.activePointer = index;
            }
        });

        vrController.addEventListener('disconnected', () => {
            if (vrController.children.length) {
                vrController.remove(this.pointers[index]);
            }
        });

        vrController.addEventListener('selectstart', () => {
            const { ask } = this.ctx.game.getUiState();
            if (this.ctx.game.controlsState.skipListener) {
                this.skipping = true;
                if (!ask.text) {
                    this.ctx.game.controlsState.skipListener();
                    return;
                }
            }
            if (this.activePointer === null) {
                this.activePointer = index;
            }
            if (this.activePointer !== index) {
                this.activePointer = index;
            } else {
                this.triggered = true;
            }
        });
    }
}
