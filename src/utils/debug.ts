import * as THREE from 'three';

export const makePure = (fct) => {
    fct.__pure_function = true;
};

export function createGizmo() {
    const axesHelper = new THREE.AxesHelper(1.2);
    axesHelper.name = 'Axes';
    const geometry = new THREE.SphereGeometry(0.1, 32, 32);
    const material = new THREE.MeshBasicMaterial({color: 0xffff00});
    const sphere = new THREE.Mesh(geometry, material);
    sphere.name = 'Sphere';
    const gizmo = new THREE.Object3D();
    gizmo.name = 'DebugGizmo';
    gizmo.add(sphere);
    gizmo.add(axesHelper);
    return gizmo;
}
