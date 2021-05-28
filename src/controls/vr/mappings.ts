import { MotionController } from '@webxr-input-profiles/motion-controllers';
import { BehaviourMode } from '../../game/loop/hero';
import Game from '../../game/Game';
import { getParams } from '../../params';
import { LBA1Items, LBA2Items } from '../../game/data/inventory';
import { switchStats } from '../../renderer/stats';

interface BtnMapping {
    btn: string;
    handler: (component: any) => any;
}

export interface Mappings {
    action: BtnMapping;
    behaviourAction: BtnMapping;
    move: BtnMapping;
    prevBehaviour: BtnMapping;
    nextBehaviour: BtnMapping;
    weaponLeft: BtnMapping;
    weaponRight: BtnMapping;
    centerCam: BtnMapping;
    menu: BtnMapping;
    fpsToggle: BtnMapping;
    fpTurn: BtnMapping;
    fpMove: BtnMapping;
}

export function getControllerMappings(
    motionController: MotionController,
    numControllers: number
) : Mappings {
    const { components, xrInputSource } = motionController;
    const handedness = (xrInputSource as any).handedness;

    let behaviourAction: BtnMapping = null;
    let action: BtnMapping = null;
    let move: BtnMapping = null;
    let prevBehaviour: BtnMapping = null;
    let nextBehaviour: BtnMapping = null;
    let weaponLeft: BtnMapping = null;
    let weaponRight: BtnMapping = null;
    let centerCam: BtnMapping = null;
    let menu: BtnMapping = null;
    let fpsToggle: BtnMapping = null;
    let fpMove: BtnMapping = null;
    let fpTurn: BtnMapping = null;

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
    if ('xr-standard-squeeze' in components) {
        if (numControllers === 1 || handedness === 'left') {
            weaponLeft = {
                btn: 'xr-standard-squeeze',
                handler: handlePressed
            };
        } else if (handedness === 'right') {
            weaponRight = {
                btn: 'xr-standard-squeeze',
                handler: handlePressed
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
    if ('x-button' in components) {
        prevBehaviour = {
            btn: 'x-button',
            handler: handleTapped.bind({})
        };
    }
    if ('a-button' in components) {
        nextBehaviour = {
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
    if ('y-button' in components) {
        centerCam = {
            btn: 'y-button',
            handler: handleTapped.bind({})
        };
        fpsToggle = {
            btn: 'y-button',
            handler: handleLongPress.bind({})
        };
    }

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
        behaviourAction,
        action,
        move,
        prevBehaviour,
        nextBehaviour,
        weaponLeft,
        weaponRight,
        centerCam,
        menu,
        fpsToggle,
        fpMove,
        fpTurn
    };
}

interface Context {
    game: Game;
    camera: any;
    scene: any;
}

const isLBA1 = getParams().game === 'lba1';

export function applyMappings(
    motionController: MotionController,
    mappings: Mappings,
    ctx: Context,
    controllerIndex
) {
    if (!mappings) {
        return;
    }

    const { game, camera, scene } = ctx;
    const { controlsState } = game;
    const { components } = motionController;

    const listBehaviours = [
        BehaviourMode.NORMAL,
        BehaviourMode.ATHLETIC,
        BehaviourMode.AGGRESSIVE,
        BehaviourMode.DISCRETE,
    ];
    let hasProtoPack = !isLBA1 && game.getState().flags.quest[LBA2Items.PROTO_PACK];
    hasProtoPack |= isLBA1 && game.getState().flags.quest[LBA1Items.PROTO_PACK];
    const hasJetpack = !isLBA1 && game.getState().flags.quest[LBA2Items.PROTO_PACK] === 2;
    const hasHorn = !isLBA1 && game.getState().flags.quest[LBA2Items.HORN];

    if (hasProtoPack) {
        listBehaviours.push(BehaviourMode.PROTOPACK);
    }
    if (!isLBA1 && hasJetpack) {
        listBehaviours.push(BehaviourMode.JETPACK);
    }
    if (!isLBA1 && hasHorn) {
        listBehaviours.push(BehaviourMode.HORN);
    }

    applyMapping(components, mappings, 'action', (enabled) => {
        if (enabled) {
            controlsState.action = 1;
        }
    });
    applyMapping(components, mappings, 'behaviourAction', (enabled) => {
        if (enabled) {
            switch (game.getState().hero.behaviour) {
                case BehaviourMode.NORMAL:
                    controlsState.action = 1;
                    break;
                case BehaviourMode.ATHLETIC:
                    controlsState.jump = 1;
                    break;
                case BehaviourMode.AGGRESSIVE:
                    controlsState.fight = 1;
                    break;
                case BehaviourMode.DISCRETE:
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
            const behaviour = game.getState().hero.behaviour;
            const index = listBehaviours.findIndex(b => b === behaviour);
            const newBehaviour = listBehaviours[Math.max(index - 1, 0)];
            setBehaviour(game, newBehaviour);
        }
    });
    applyMapping(components, mappings, 'nextBehaviour', (enabled) => {
        if (enabled) {
            const behaviour = game.getState().hero.behaviour;
            const index = listBehaviours.findIndex(b => b === behaviour);
            const newBehaviour = listBehaviours[Math.min(index + 1, listBehaviours.length - 1)];
            setBehaviour(game, newBehaviour);
        }
    });
    applyMapping(components, mappings, 'weaponLeft', (enabled) => {
        if (enabled) {
            controlsState.weapon = 1;
            controlsState.vrWeaponControllerIndex = controllerIndex;
        }
    });
    applyMapping(components, mappings, 'weaponRight', (enabled) => {
        if (enabled) {
            controlsState.weapon = 1;
            controlsState.vrWeaponControllerIndex = controllerIndex;
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
    applyMapping(components, mappings, 'fpsToggle', (enabled) => {
        if (enabled) {
            switchStats();
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
    const textIndex = behaviour + (getParams().game === 'lba2' ? 80 : 0);
    game.setUiState({
        infoBubble: game.menuTexts[textIndex].value
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

function handleLongPress(component) {
    let value = false;
    const now = Date.now();
    if (component.values.state === 'pressed' && this.state !== 'pressed') {
        this.start = now;
        this.toggled = false;
    }
    this.state = component.values.state;
    if (this.state === 'pressed' && !this.toggled && now - this.start > 1000) {
        value = true;
        this.toggled = true;
    }
    return value;
}
