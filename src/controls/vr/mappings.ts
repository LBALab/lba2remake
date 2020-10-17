import { MotionController } from '@webxr-input-profiles/motion-controllers';
import { BehaviourMode } from '../../game/loop/hero';
import { Game } from '../../game/Game';

interface BtnMapping {
    btn: string;
    handler: (component: any) => any;
}

interface MainGameControls {
    action: BtnMapping;
    behaviourAction: BtnMapping;
    move: BtnMapping;
    prevBehaviour: BtnMapping;
    nextBehaviour: BtnMapping;
}

interface ExtraControls {
    centerCam: BtnMapping;
    menu: BtnMapping;
}

interface FirstPersonMappings {
    fpTurn?: BtnMapping;
    fpMove?: BtnMapping;
}

export interface Mappings
    extends MainGameControls,
            ExtraControls,
            FirstPersonMappings
            {}

export function getControllerMappings(
    motionController: MotionController,
    numControllers: number
) : Mappings {
    const mainGameControls = mapMainGameControls(motionController, numControllers);
    const extraControls = mapExtraControls(motionController, numControllers);
    const firstPersonMovements = mapFirstPersonMovements(motionController, numControllers);
    return {
        ...mainGameControls,
        ...firstPersonMovements,
        ...extraControls
    };
}

interface Context {
    game: Game;
    camera: any;
    scene: any;
}

export function applyMappings(
    motionController: MotionController,
    mappings: Mappings,
    ctx: Context
) {
    if (!mappings) {
        return;
    }

    const { game, camera, scene } = ctx;
    const { controlsState } = game;
    const { components } = motionController;
    applyMapping(components, mappings, 'action', (enabled) => {
        if (enabled) {
            controlsState.action = 1;
        }
    });
    applyMapping(components, mappings, 'behaviourAction', (enabled) => {
        if (enabled) {
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
        } else {
            controlsState.jump = 0;
            controlsState.fight = 0;
            controlsState.crouch = 0;
        }
    });
    applyMapping(components, mappings, 'prevBehaviour', (enabled) => {
        if (enabled) {
            let newBehaviour = Math.max(game.getState().hero.behaviour - 1, 0);
            if (game.getState().hero.behaviour === BehaviourMode.JETPACK) {
                newBehaviour = BehaviourMode.PROTOPACK;
            }
            setBehaviour(game, newBehaviour);
        }
    });
    applyMapping(components, mappings, 'nextBehaviour', (enabled) => {
        if (enabled) {
            if (game.getState().hero.behaviour === BehaviourMode.PROTOPACK ||
                game.getState().hero.behaviour === BehaviourMode.JETPACK) {
                setBehaviour(game, BehaviourMode.JETPACK);
            } else {
                setBehaviour(game, Math.min(game.getState().hero.behaviour + 1, 4));
            }
        }
    });
    if (controlsState.firstPerson) {
        applyMapping(components, mappings, 'fpMove', (value) => {
            controlsState.controlVector.y = value;
        });
        applyMapping(components, mappings, 'fpTurn', (value) => {
            controlsState.altControlVector.x = value;
        });
    } else {
        applyMapping(components, mappings, 'move', (value) => {
            controlsState.controlVector.set(value.x, value.y);
        });
    }
    applyMapping(components, mappings, 'centerCam', (enabled) => {
        if (enabled && camera && camera.center && scene) {
            camera.center(scene);
        }
    });
    applyMapping(components, mappings, 'menu', (enabled) => {
        if (enabled) {
           history.back();
        }
    });
}

function applyMapping(
    components: { [key: string]: any },
    mappings: Mappings,
    key: string,
    callback: (values) => void
) {
    const mapping = mappings[key];
    if (mapping) {
        const component = components[mapping.btn];
        if (component) {
            const value = mapping.handler(component);
            callback(value);
        }
    }
}

let bubbleTimeout = null;

function setBehaviour(game, behaviour) {
    game.getState().hero.behaviour = behaviour;
    game.setUiState({
        infoBubble: game.menuTexts[80 + behaviour].value
    });
    if (bubbleTimeout) {
        clearTimeout(bubbleTimeout);
    }
    bubbleTimeout = setTimeout(() => {
        game.setUiState({ infoBubble: null });
    }, 1000);
}

const handlePressed = component => component.values.state === 'pressed';

function stickHandler({values}) {
    this.x = values.xAxis;
    this.y = -(values.yAxis);
    return this;
}

function handleTapped(component) {
    let value = false;
    if (component.values.state === 'pressed' && this.state !== 'pressed') {
        value = true;
    }
    this.state = component.values.state;
    return value;
}

function mapMainGameControls(
    motionController: MotionController,
    numControllers: number
) : MainGameControls {
    const { components, xrInputSource } = motionController;
    const handedness = (xrInputSource as any).handedness;
    let behaviourAction: BtnMapping = null;
    let action: BtnMapping = null;
    let move: BtnMapping = null;
    let prevBehaviour: BtnMapping = null;
    let nextBehaviour: BtnMapping = null;
    if ('xr-standard-trigger' in components) {
        if (numControllers === 1 || handedness === 'left') {
            behaviourAction = {
                btn: 'xr-standard-trigger',
                handler: handlePressed
            };
        } else if (handedness === 'right') {
            action = {
                btn: 'xr-standard-trigger',
                handler: handlePressed
            };
        }
    }
    if ('xr-standard-squeeze') {
        if (numControllers === 1 || handedness === 'right') {
            nextBehaviour = {
                btn: 'xr-standard-squeeze',
                handler: handleTapped.bind({})
            };
        } else if (handedness === 'left') {
            prevBehaviour = {
                btn: 'xr-standard-squeeze',
                handler: handleTapped.bind({})
            };
        }
    }
    const useForMove = numControllers === 1 || handedness === 'left';
    if (useForMove) {
        if ('xr-standard-thumbstick' in components) {
            move = {
                btn: 'xr-standard-thumbstick',
                handler: stickHandler.bind({})
            };
        } else if ('xr-standard-touchpad' in components) {
            move = {
                btn: 'xr-standard-touchpad',
                handler: stickHandler.bind({})
            };
        } else if ('touchpad' in components) {
            move = {
                btn: 'touchpad',
                handler: stickHandler.bind({})
            };
        }
    }
    return {
        behaviourAction,
        action,
        move,
        prevBehaviour,
        nextBehaviour
    };
}

function mapExtraControls(
    motionController: MotionController,
    _numControllers: number
) : ExtraControls {
    const { components } = motionController;
    let centerCam: BtnMapping = null;
    let menu: BtnMapping = null;
    if ('a-button' in components) {
        centerCam = {
            btn: 'a-button',
            handler: handleTapped.bind({})
        };
    }
    if ('b-button' in components) {
        menu = {
            btn: 'b-button',
            handler: handleTapped.bind({})
        };
    }
    return {
        centerCam,
        menu,
    };
}

function mapFirstPersonMovements(
    motionController: MotionController,
    _numControllers: number
) : FirstPersonMappings {
    const { components, xrInputSource } = motionController;
    const handedness = (xrInputSource as any).handedness;
    let fpMove: BtnMapping = null;
    let fpTurn: BtnMapping = null;
    if (handedness === 'left') {
        if ('xr-standard-thumbstick' in components) {
            fpMove = {
                btn: 'xr-standard-thumbstick',
                handler: component => -component.values.yAxis
            };
        } else if ('xr-standard-touchpad' in components) {
            fpMove = {
                btn: 'xr-standard-touchpad',
                handler: component => -component.values.yAxis
            };
        } else if ('touchpad' in components) {
            fpMove = {
                btn: 'touchpad',
                handler: component => -component.values.yAxis
            };
        }
    } else if (handedness === 'right') {
        if ('xr-standard-thumbstick' in components) {
            fpTurn = {
                btn: 'xr-standard-thumbstick',
                handler: component => component.values.xAxis
            };
        } else if ('xr-standard-touchpad' in components) {
            fpTurn = {
                btn: 'xr-standard-touchpad',
                handler: component => component.values.xAxis
            };
        } else if ('touchpad' in components) {
            fpTurn = {
                btn: 'touchpad',
                handler: component => component.values.xAxis
            };
        }
    }
    return {
        fpMove,
        fpTurn
    };
}
