import Game from '../game/Game';
import { SceneManager } from '../game/SceneManager';
import { Params } from '../params';
import { BehaviourMode } from '../game/loop/hero';
import { resetCameraOrientation } from './keyboard';
// import { resetCameraOrientation } from './keyboard';

const gamepadEventsFound = 'ongamepadconnected' in window;

const enum Button {
    A = 0,
    B = 1,
    X = 2,
    Y = 3,
    LeftTrigger = 4,
    RightTrigger = 5,
    LeftShoulder = 6,
    RightShoulder = 7,
    LeftSelect = 8,
    RightSelect = 9,
    LeftStick = 10,
    RightStick = 11,
    DpadUp = 12,
    DpadDown = 13,
    DpadLeft = 14,
    DpadRight = 15,
    Home = 16
}

export default class GamepadControls {
    ctx: any;
    controllers: {
        [key: number]: Gamepad,
    };

    constructor(params: Params, sceneManager: SceneManager, game: Game) {
        this.ctx = {
            sceneManager,
            game,
            params,
            state: {
                startTime: Date.now(),
            }
        };
        this.controllers = {};
        this.initHandlers();
    }

    dispose() {}

    update() {
        const { game, state } = this.ctx;
        if (!gamepadEventsFound) {
            this.pollGamepads();
        }

        for (const index in this.controllers) {
            const controller = this.controllers[index];
            if (!controller.connected) {
                continue;
            }

            this.resetButtonState();

            const endTime = Date.now();
            const elapsed = endTime - state.startTime;
            if (elapsed > 100) {
                state.startTime = Date.now();
                for (let i = 0; i < controller.buttons.length; i += 1) {
                    const button = controller.buttons[i];
                    const pressed = button.pressed || button.value > 0;
                    if (pressed) {
                        this.buttonMappings(i);
                    }
                }
            }

            this.axesMappings(controller.axes);
        }

        game.setUiState({ controlState: { ...game.controlState } });
    }

    resetButtonState() {
        const { game } = this.ctx;
        const { controlsState } = game;
        controlsState.action = 0;
        controlsState.jump = 0;
        controlsState.fight = 0;
        controlsState.crouch = 0;
        controlsState.cameraSpeed.x = 0;
        controlsState.cameraSpeed.z = 0;
        controlsState.control = 0;
        controlsState.up = 0;
        controlsState.down = 0;
        controlsState.left = 0;
        controlsState.right = 0;
    }

    buttonMappings(index: number) {
        const { game, camera, sceneManager, params } = this.ctx;
        const scene = sceneManager.getScene();
        const { controlsState } = game;
        switch (index) {
            case Button.A:
                if (controlsState.action === 0 && game.controlsState.skipListener) {
                    game.controlsState.skipListener();
                } else {
                    controlsState.action = 1;
                }
                break;
            case Button.B:
                if (game.controlsState.skipListener) {
                    game.controlsState.skipListener();
                }
                break;
            case Button.X:
                switch (game.getState().hero.behaviour) {
                    case 0:
                        controlsState.action = 1;
                        break;
                    case 1:
                        controlsState.jump = 1;
                        break;
                    case 2:
                        controlsState.fight = 1;
                        break;
                    case 3:
                        controlsState.crouch = 1;
                        break;
                }
                break;
            case Button.Y:
                break;
            case Button.LeftTrigger:
            case Button.RightTrigger:
                let newBehaviour = game.getState().hero.behaviour + ((index === 4) ? -1 : 1);
                if (newBehaviour < BehaviourMode.NORMAL)
                    newBehaviour = BehaviourMode.NORMAL;
                if (newBehaviour > BehaviourMode.PROTOPACK)
                    newBehaviour = BehaviourMode.PROTOPACK;
                if (index === 4 && game.getState().hero.behaviour === BehaviourMode.JETPACK) {
                    newBehaviour = BehaviourMode.PROTOPACK;
                }
                if (index === 5 && game.getState().hero.behaviour === BehaviourMode.PROTOPACK) {
                    newBehaviour = BehaviourMode.JETPACK;
                }
                game.getState().hero.behaviour = newBehaviour;
                break;
            case Button.LeftShoulder:
                break;
            case Button.RightShoulder:
                break;
            case Button.LeftSelect:
                controlsState.control = 1;
                break;
            case Button.RightSelect:
                game.togglePause();
                break;
            case Button.LeftStick:
                if (params.editor) {
                    controlsState.freeCamera = !controlsState.freeCamera;
                    if (controlsState.freeCamera) {
                        resetCameraOrientation(game, scene);
                    }
                } else {
                    // open inventory
                }
                break;
            case Button.RightStick:
                if (camera && camera.center && scene) {
                    camera.center(scene);
                }
                break;
            case Button.DpadUp:
                controlsState.up = 1;
                break;
            case Button.DpadDown:
                controlsState.down = 1;
                break;
            case Button.DpadLeft:
                controlsState.left = 1;
                break;
            case Button.DpadRight:
                controlsState.right = 1;
                break;
            case Button.Home:
                history.back();
                break;
        }
    }

    axesMappings(axes: any) {
        const { game, params } = this.ctx;
        const { controlsState } = game;

        if (controlsState.firstPerson) {
            controlsState.altControlVector.x = axes[0];
            controlsState.controlVector.y = -axes[1];
        } else {
            if (axes[0] < 0.2 || axes[0] > 0.2) { // to avoid drifting
                controlsState.controlVector.x = axes[0];
            }
            if (axes[1] < 0.2 || axes[1] > 0.2) { // to avoid drifting
                controlsState.controlVector.y = -Math.floor(axes[1]);
            }
        }

        if (params.editor && game.controlsState.freeCamera) {
            if (axes[2] < 0.2 || axes[2] > 0.2) { // to avoid drifting
                controlsState.cameraSpeed.z = axes[3];
            }
            if (axes[3] < 0.2 || axes[3] > 0.2) { // to avoid drifting
                controlsState.cameraSpeed.x = -Math.floor(axes[3]);
            }
        }
    }

    pollGamepads() {
        const gamepads = navigator.getGamepads
            ? navigator.getGamepads()
            // @ts-ignore
            : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
        for (let i = 0; i < gamepads.length; i += 1) {
            if (gamepads[i] && gamepads[i].connected) {
                this.controllers[gamepads[i].index] = gamepads[i];
            }
        }
    }

    initHandlers() {
        window.addEventListener('gamepadconnected', (e) => {
            // @ts-ignore
            const gamepad = e.gamepad;
            this.controllers[gamepad.index] = gamepad;
        });

        window.addEventListener('gamepaddisconnected', (e) => {
            // @ts-ignore
            delete this.controllers[e.gamepad.index];
        });

        if (!gamepadEventsFound) {
            this.pollGamepads();
        }
    }
}
