import * as THREE from 'three';

export enum ControlActiveType {
    KEYBOARD = 0,
    TOUCH = 1,
    VRCONTROLS = 2,
    GAMEPAD = 3,
}

export interface ControlsState {
    activeType: number;
    controlVector: THREE.Vector2;
    altControlVector: THREE.Vector2;
    cameraSpeed: THREE.Vector3;
    cameraLerp: THREE.Vector3;
    cameraLookAtLerp: THREE.Vector3;
    cameraOrientation: THREE.Quaternion;
    cameraHeadOrientation: THREE.Quaternion;
    camZone?: THREE.Vector3;
    freeCamera: boolean;
    relativeToCam: boolean;
    firstPerson: boolean;
    action: number;
    jump: number;
    cancelJump: boolean;
    fight: number;
    crouch: number;
    sideStep: number;
    weapon: number;
    up: number;
    down: number;
    left: number;
    right: number;
    control: number;
    shift: number;
    home: number;
    vrPointerTransform: THREE.Matrix4;
    vrTriggerButton: boolean;
    vrControllerPositions: THREE.Vector3[];
    vrControllerVelocities: number[];
    vrWeaponControllerIndex: number;
    skipListener?: Function;
}

export function initControlsState(vr: boolean): ControlsState {
    return {
        activeType: ControlActiveType.KEYBOARD,
        controlVector: new THREE.Vector2(),
        altControlVector: new THREE.Vector2(),
        cameraSpeed: new THREE.Vector3(),
        cameraLerp: new THREE.Vector3(),
        cameraLookAtLerp: new THREE.Vector3(),
        cameraOrientation: new THREE.Quaternion(),
        cameraHeadOrientation: new THREE.Quaternion(),
        camZone: null,
        freeCamera: false,
        relativeToCam: vr,
        firstPerson: vr && getSavedVRFirstPersonMode(),
        action: 0,
        jump: 0,
        cancelJump: false,
        fight: 0,
        crouch: 0,
        weapon: 0,
        sideStep: 0,
        up: 0,
        down: 0,
        left: 0,
        right: 0,
        control: 0,
        shift: 0,
        home: 0,
        vrPointerTransform: new THREE.Matrix4(),
        vrTriggerButton: false,
        vrControllerPositions: [],
        vrControllerVelocities: [],
        vrWeaponControllerIndex: -1
    };
}

function getSavedVRFirstPersonMode() {
    const firstPerson = localStorage.getItem('vrFirstPerson');
    if (firstPerson !== null && firstPerson !== undefined) {
        return JSON.parse(firstPerson);
    }
    return false;
}
