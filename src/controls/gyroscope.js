// @flow

import * as THREE from 'three';

export function makeGyroscopeControls(game: any) {
    let screenOrientation = window.orientation || 0;
    let deviceOrientation = {alpha: 0, beta: 0, gamma: 0};

    const onOrientationChange = () => { screenOrientation = window.orientation || 0; };
    const onDeviceOrientation = (event) => { deviceOrientation = event; };

    window.addEventListener('orientationchange', onOrientationChange, false);
    window.addEventListener('deviceorientation', onDeviceOrientation, false);
    return {
        dispose: () => {
            window.removeEventListener('orientationchange', onOrientationChange);
            window.removeEventListener('deviceorientation', onDeviceOrientation);
        },
        update: () => {
            const alpha = THREE.Math.degToRad(deviceOrientation.alpha);
            const beta = THREE.Math.degToRad(deviceOrientation.beta);
            const gamma = THREE.Math.degToRad(deviceOrientation.gamma);
            const orient = THREE.Math.degToRad(screenOrientation);

            game.controlsState.cameraHeadOrientation.copy(
                quaternionFromABGO(alpha, beta, gamma, orient)
            );
        }
    };
}

const quaternionFromABGO = (() => {
    const zee = new THREE.Vector3(0, 0, 1);
    const euler = new THREE.Euler();
    const q0 = new THREE.Quaternion();
    const q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));
    const quaternion = new THREE.Quaternion();

    return (alpha, beta, gamma, orient) => {
        euler.set(beta, alpha, -gamma, 'YXZ');
        quaternion.setFromEuler(euler);
        quaternion.multiply(q1);
        quaternion.multiply(q0.setFromAxisAngle(zee, -orient));
        return quaternion;
    };
})();
