import * as THREE from 'three';

export interface ControlsState {
    controlVector: THREE.Vector2;
    altControlVector: THREE.Vector2;
    cameraSpeed: THREE.Vector3;
    cameraLerp: THREE.Vector3;
    cameraLookAtLerp: THREE.Vector3;
    cameraOrientation: THREE.Quaternion;
    cameraHeadOrientation: THREE.Quaternion;
    freeCamera: boolean;
    relativeToCam: boolean;
    firstPerson: boolean;
    action: number;
    jump: number;
    fight: number;
    crouch: number;
    sideStep: number;
    weapon: number;
    vrPointerTransform: THREE.Matrix4;
    vrTriggerButton: boolean;
    vrControllerPositions: THREE.Vector3[];
    vrControllerVelocities: THREE.Vector3[];
    skipListener?: Function;
}

export function initControlsState(vr: boolean): ControlsState {
    return {
        controlVector: new THREE.Vector2(),
        altControlVector: new THREE.Vector2(),
        cameraSpeed: new THREE.Vector3(),
        cameraLerp: new THREE.Vector3(),
        cameraLookAtLerp: new THREE.Vector3(),
        cameraOrientation: new THREE.Quaternion(),
        cameraHeadOrientation: new THREE.Quaternion(),
        freeCamera: false,
        relativeToCam: vr,
        firstPerson: vr && getSavedVRFirstPersonMode(),
        action: 0,
        jump: 0,
        fight: 0,
        crouch: 0,
        weapon: 0,
        sideStep: 0,
        vrPointerTransform: new THREE.Matrix4(),
        vrTriggerButton: false,
        vrControllerPositions: [],
        vrControllerVelocities: [],
    };
}

function getSavedVRFirstPersonMode() {
    const firstPerson = localStorage.getItem('vrFirstPerson');
    if (firstPerson !== null && firstPerson !== undefined) {
        return JSON.parse(firstPerson);
    }
    return false;
}
