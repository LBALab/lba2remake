import Game from '../game/Game';
import { SceneManager } from '../game/SceneManager';
import { Params } from '../params';
import { BehaviourMode } from '../game/loop/hero';
// import { resetCameraOrientation } from './keyboard';

const gamepadEventsFound = 'ongamepadconnected' in window;

export default class GamepadManager {
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
        const { state } = this.ctx;
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
    }

    resetButtonState() {
        const { game } = this.ctx;
        const { controlsState } = game;
        controlsState.action = 0;
        controlsState.jump = 0;
        controlsState.fight = 0;
        controlsState.crouch = 0;
    }

    buttonMappings(index: number) {
        const { game, camera, sceneManager } = this.ctx;
        const scene = sceneManager.getScene();
        const { controlsState } = game;
        switch (index) {
            case 0: // Button 0 - A
                if (controlsState.action === 0 && game.controlsState.skipListener) {
                    game.controlsState.skipListener();
                } else {
                    controlsState.action = 1;
                }
                break;
            case 1: // Button 1 - B
                if (game.controlsState.skipListener) {
                    game.controlsState.skipListener();
                }
                break;
            case 2: // Button 2 - X
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
            case 3: // Button 3 - Y
                break;
            case 4: // Button 4 - Left Trigger
            case 5: // Button 5 - Right Trigger
                let newBehaviour = game.getState().hero.behaviour + ((index === 4) ? -1 : 1);
                if (newBehaviour < 0)
                    newBehaviour = 0;
                if (newBehaviour > 4)
                    newBehaviour = 4;
                if (index === 4 && game.getState().hero.behaviour === BehaviourMode.JETPACK) {
                    newBehaviour = BehaviourMode.PROTOPACK;
                }
                if (index === 5 && game.getState().hero.behaviour === BehaviourMode.PROTOPACK) {
                    newBehaviour = BehaviourMode.JETPACK;
                }
                game.getState().hero.behaviour = newBehaviour;
                break;
            case 6: // Button 6 - Left Shoulder
                break;
            case 7: // Button 7 - Right Shoulder
                break;
            case 8: // Button 8 - Left Select
                // if (params.editor) {
                //     game.controlsState.freeCamera = !game.controlsState.freeCamera;
                //     if (game.controlsState.freeCamera) {
                //         resetCameraOrientation(game, scene);
                //     }
                // }
                break;
            case 9: // Button 9 - Right Select
                game.togglePause();
                break;
            case 10: // Button 10 - Left Stick Button
                break;
            case 11: // Button 11 - Right Stick Button
                if (camera && camera.center && scene) {
                    camera.center(scene);
                }
                break;
            case 12: // Button 12 - Dpad Up
                break;
            case 13: // Button 13 - Dpad Down
                break;
            case 14: // Button 14 - Dpad Left
                break;
            case 15: // Button 15 - Dpad Right
                break;
            case 16: // Button 16 - Home Button
                history.back();
                break;
        }
    }

    axesMappings(axes: any) {
        const { game } = this.ctx;
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

        // if (params.editor) {
        //     if (game.controlsState.freeCamera) {
        //         if (axes[2] < 0.2 || axes[2] > 0.2) { // to avoid drifting
        //             controlsState.cameraSpeed.z = axes[3];
        //         }
        //         if (axes[3] < 0.2 || axes[3] > 0.2) { // to avoid drifting
        //             controlsState.cameraSpeed.x = -Math.floor(axes[3]);
        //         }
        //     }
        // }
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

/**
 * Kishi Controller
 * Axis 0 - Left Stick X
 * Axis 1 - Left Stick Y
 * Axis 2 - Right Stick X
 * Axis 3 - Right Stick Y
 * Button 0 - A
 * Button 1 - B
 * Button 2 - X
 * Button 3 - Y
 * Button 4 - Left Trigger
 * Button 5 - RIght Trigger
 * Button 6 - Left Shoulder
 * Button 7 - Right Shoulder
 * Button 8 - Left Select
 * Button 9 - Right Select
 * Button 10 - Left Stick Button
 * Button 11 - Right Stick Button
 * Button 12 - Dpad Up
 * Button 13 - Dpad Down
 * Button 14 - Dpad Left
 * Button 15 - Dpad Right
 * Button 16 - Home Button
 */
