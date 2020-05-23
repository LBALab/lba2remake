import * as THREE from 'three';

export function createScreen(options) {
    const {width, height} = options;
    const x = options.x || 0;
    const y = options.y || 0;
    const z = options.z || 768;
    const angle = options.angle ? THREE.MathUtils.degToRad(180 + options.angle) : Math.PI;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const density = 512;

    const texture = new THREE.CanvasTexture(canvas);
    texture.encoding = THREE.GammaEncoding;
    texture.anisotropy = 16;
    const geometry = new THREE.PlaneBufferGeometry(width / density, height / density);
    const material = new THREE.MeshBasicMaterial({
        color: 0xFFFFFF,
        depthFunc: options.noDepth ? THREE.AlwaysDepth : THREE.LessEqualDepth,
        depthWrite: !options.noDepth,
        transparent: true,
        opacity: 1,
        map: texture
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle);
    mesh.position.set(x / density, y / density, z / density);

    return {
        mesh,
        ctx
    };
}
