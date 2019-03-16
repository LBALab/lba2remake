import * as THREE from 'three';

export function createScreen(options) {
    const {width, height} = options;
    const x = options.x || 0;
    const y = options.y || 0;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const density = 512;

    const geometry = new THREE.PlaneBufferGeometry(width / density, height / density);
    const material = new THREE.MeshBasicMaterial({
        color: 0xFFFFFF,
        depthTest: false,
        transparent: true,
        opacity: 1,
        map: new THREE.CanvasTexture(canvas)
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
    mesh.position.set(x / density, y / density, 1.5);
    mesh.renderOrder = 2;

    return {
        mesh,
        ctx
    };
}
