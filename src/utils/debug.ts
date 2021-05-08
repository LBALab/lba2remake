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

/**
 * This formats a Vector3 to be more readable.
 */
export function fvec(vec: THREE.Vector3) {
    return `(${vec.x.toFixed(3)}, ${vec.y.toFixed(3)}, ${vec.z.toFixed(3)})`;
}

/**
 * This formats a Vector3 as a Vector2 (using x and z coordinates)
 * to help inspects ground positions.
 */
export function fvecXZ(vec: THREE.Vector3) {
    return `(${vec.x.toFixed(3)}, ${vec.z.toFixed(3)})`;
}
