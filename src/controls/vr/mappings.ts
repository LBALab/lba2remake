import { MotionController } from '@webxr-input-profiles/motion-controllers';

interface BtnMapping {
    btn: string;
    handler: (component: any) => any;
}

interface MainGameControls {
    action?: BtnMapping;
    move: BtnMapping;
}

interface ExtraControls {
    centerCam?: BtnMapping;
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
    game: any;
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

    const { game: { controlsState }, camera, scene } = ctx;
    const { components } = motionController;
    applyMapping(components, mappings, 'action', (enabled) => {
        if (enabled) {
            controlsState.action = 1;
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
    let action: BtnMapping = null;
    let move: BtnMapping = null;
    if ('xr-standard-trigger' in components) {
        action = {
            btn: 'xr-standard-trigger',
            handler: handlePressed
        };
    }
    const useForMove = numControllers === 1 || handedness === 'left';
    if (useForMove && 'xr-standard-thumbstick' in components) {
        move = {
            btn: 'xr-standard-thumbstick',
            handler: stickHandler.bind({})
        };
    }
    return {
        action,
        move
    };
}

function mapExtraControls(
    motionController: MotionController,
    _numControllers: number
) : ExtraControls {
    const { components } = motionController;
    let centerCam: BtnMapping = null;
    if ('a-button' in components) {
        centerCam = {
            btn: 'a-button',
            handler: handleTapped.bind({})
        };
    }
    return {
        centerCam
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
        }
    } else if (handedness === 'right') {
        if ('xr-standard-thumbstick' in components) {
            fpTurn = {
                btn: 'xr-standard-thumbstick',
                handler: component => component.values.xAxis
            };
        }
    }
    return {
        fpMove,
        fpTurn
    };
}
