import * as THREE from 'three';

const EULER = new THREE.Euler();

export function loadPoint(props) {
    const pos = props.pos;
    const point = {
        type: 'point',
        index: props.index,
        props,
        physics: {
            position: new THREE.Vector3(pos[0], pos[1], pos[2])
        },
        threeObject: null,
        boundingBox: new THREE.Box3(
            new THREE.Vector3(-0.3, -0.2, -0.3),
            new THREE.Vector3(0.3, 0.96, 0.3)
        ),
        update: null
    };

    // For debug purposes
    const texture = createPointLabel(point, props.index);
    const flag = makeFlag(texture);
    flag.name = `point:${props.index}`;
    flag.visible = false;
    flag.position.set(point.physics.position.x, point.physics.position.y, point.physics.position.z);

    point.threeObject = flag;

    flag.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 4);
    flag.renderOrder = 2;

    point.update = (camera) => {
        const controlNode = camera.controlNode;
        if (!controlNode)
            return;

        EULER.setFromQuaternion(controlNode.quaternion, 'YXZ');
        EULER.y += Math.PI;
        EULER.x = 0;
        EULER.z = 0;

        flag.quaternion.setFromEuler(EULER);
    };

    return point;
}

const stickMaterial = new THREE.MeshLambertMaterial({
    color: new THREE.Color('#84572e')
});

function makeFlag(texture) {
    const stickGeom = new THREE.CylinderBufferGeometry(0.036, 0.036, 0.96, 6, 1, false);
    const stick = new THREE.Mesh(stickGeom, stickMaterial);
    stick.position.set(0, 0.48, 0);
    stick.name = 'stick';

    const clothMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true
    });

    const clothGeom = new THREE.PlaneBufferGeometry(0.7, 0.7);
    const cloth = new THREE.Mesh(clothGeom, clothMaterial);
    cloth.position.set(0.35, 0.61, 0);
    cloth.name = 'cloth';

    const flag = new THREE.Object3D();
    flag.add(stick);
    flag.add(cloth);

    return flag;
}

export function createPointLabel(point, index) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.font = '20px LBA';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 4;
    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 16;
    const draw = (selected = false) => {
        ctx.clearRect(0, 0, 64, 64);
        ctx.fillStyle = selected ? 'white' : '#1a78c0';
        ctx.strokeStyle = selected ? 'black' : 'white';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(64, 32);
        ctx.lineTo(0, 64);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = selected ? 'black' : 'white';
        ctx.fillText(index, 20, 32, 32);
        texture.needsUpdate = true;
    };

    draw();

    point.refreshLabel = draw;
    return texture;
}
