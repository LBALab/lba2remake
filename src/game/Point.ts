import * as THREE from 'three';

const EULER = new THREE.Euler();
const stickMaterial = new THREE.MeshLambertMaterial({
    color: new THREE.Color('#84572e')
});

export interface PointProps {
    index: number;
    pos: number[];
}

export default class Point {
    readonly type = 'point';
    readonly props: PointProps;
    readonly threeObject: THREE.Object3D;
    readonly boundingBox: THREE.Box3;
    readonly physics: {
        position: THREE.Vector3;
    };
    private ctx: CanvasRenderingContext2D;
    private labelTexture: THREE.CanvasTexture;

    constructor(props: PointProps) {
        this.props = props;
        this.physics = {
            position: new THREE.Vector3(props.pos[0], props.pos[1], props.pos[2])
        };
        this.boundingBox = new THREE.Box3(
            new THREE.Vector3(-0.3, -0.2, -0.3),
            new THREE.Vector3(0.3, 0.96, 0.3)
        );

        // For debug purposes
        this.threeObject = this.createFlag();
        this.threeObject.name = `point:${props.index}`;
        this.threeObject.visible = false;
        this.threeObject.position.copy(this.physics.position);

        this.threeObject.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 4);
        this.threeObject.renderOrder = 2;
    }

    update(camera) {
        const controlNode = camera.controlNode;
        if (!controlNode)
            return;

        EULER.setFromQuaternion(controlNode.quaternion, 'YXZ');
        EULER.y += Math.PI;
        EULER.x = 0;
        EULER.z = 0;

        this.threeObject.quaternion.setFromEuler(EULER);
    }

    private createFlag() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        this.ctx = canvas.getContext('2d');
        this.ctx.font = '20px LBA';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.lineWidth = 4;
        this.labelTexture = new THREE.CanvasTexture(canvas);
        this.labelTexture.encoding = THREE.GammaEncoding;
        this.labelTexture.anisotropy = 16;

        this.updateLabel();

        const stickGeom = new THREE.CylinderBufferGeometry(0.036, 0.036, 0.96, 6, 1, false);
        const stick = new THREE.Mesh(stickGeom, stickMaterial);
        stick.position.set(0, 0.48, 0);
        stick.name = 'stick';

        const clothMaterial = new THREE.MeshBasicMaterial({
            map: this.labelTexture,
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

    updateLabel(selected = false) {
        this.ctx.clearRect(0, 0, 64, 64);
        this.ctx.fillStyle = selected ? 'white' : '#1a78c0';
        this.ctx.strokeStyle = selected ? 'black' : 'white';
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(64, 32);
        this.ctx.lineTo(0, 64);
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.fillStyle = selected ? 'black' : 'white';
        this.ctx.fillText(this.props.index.toString(), 20, 32, 32);
        this.labelTexture.needsUpdate = true;
    }
}
