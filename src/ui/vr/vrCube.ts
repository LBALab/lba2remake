import THREE from 'three';

export function createVRCube() {
    const geometry = new THREE.BoxBufferGeometry(6, 6, 6);
    const material = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0,
        side: THREE.BackSide,
        depthTest: false
    });
    const cube = new THREE.Mesh(geometry, material);
    cube.name = 'VRGuiCube';
    cube.renderOrder = 1;
    return cube;
}
