import { each, first } from 'lodash';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { MotionController } from '@webxr-input-profiles/motion-controllers';
import { drawFrame } from '../../ui/vr/vrUtils';

const loader = new GLTFLoader();

const CENTER = new THREE.Vector3(0, -0.03, -0.02);
const RADIUS = 0.08;

export default class ControllerModel {
    motionController: MotionController;
    threeObject: THREE.Object3D;
    vrControllerMesh: THREE.Object3D;
    handMesh: THREE.Object3D;

    constructor(motionController) {
        this.motionController = motionController;
    }

    async load() {
        this.threeObject = new THREE.Object3D();
        this.vrControllerMesh = await new Promise<THREE.Object3D>((resolve) => {
            loader.load(this.motionController.assetUrl, (m) => {
                resolve(m.scene);
            });
        });
        const side = (this.motionController.xrInputSource as any).handedness || 'right';
        this.handMesh = await new Promise<THREE.Object3D>((resolve) => {
            loader.load('models/hands.glb', (m) => {
                resolve(m.scene.getObjectByName(`${side}_hand`));
            });
        });
        // this.threeObject.add(this.handMesh);
        this.threeObject.add(this.vrControllerMesh);
        this.addTouchPoints();
        this.loadLabels();
        // this.mesh.add(makeRootDebugSphere());
        return this;
    }

    update() {
        each(this.motionController.components, (component: any) => {
            each(component.visualResponses, (visualResponse) => {
                // Find the topmost node in the visualization
                const valueNode = this.vrControllerMesh
                    .getObjectByName(visualResponse.valueNodeName);

                // Calculate the new properties based on the weight supplied
                if (visualResponse.valueNodeProperty === 'visibility') {
                    valueNode.visible = visualResponse.value;
                } else if (visualResponse.valueNodeProperty === 'transform') {
                    const minNode = this.vrControllerMesh
                        .getObjectByName(visualResponse.minNodeName);
                    const maxNode = this.vrControllerMesh
                        .getObjectByName(visualResponse.maxNodeName);

                    THREE.Quaternion.slerp(
                        minNode.quaternion,
                        maxNode.quaternion,
                        valueNode.quaternion,
                        visualResponse.value
                    );

                    valueNode.position.lerpVectors(
                        minNode.position,
                        maxNode.position,
                        visualResponse.value
                    );
                }
            });
        });
    }

    addTouchPoints() {
        each(this.motionController.components, (component) => {
            if (component.touchPointNodeName) {
                const touchPointRoot = this.vrControllerMesh
                    .getObjectByName(component.touchPointNodeName);
                const sphereGeometry = new THREE.SphereGeometry(0.001);
                const material = new THREE.MeshBasicMaterial({ color: 0x0000FF });
                const touchPointDot = new THREE.Mesh(sphereGeometry, material);
                touchPointRoot.add(touchPointDot);
            }
        });
    }

    loadLabels() {
        // Update all matrices to place labels correctly
        this.vrControllerMesh.traverse((node) => {
            node.updateMatrix();
            node.updateMatrixWorld(true);
        });
        each(this.motionController.components, (component: any) => {
            let cmpModel = null;
            const visualResponse = first(Object.values(component.visualResponses)) as any;
            if (visualResponse) {
                cmpModel = this.vrControllerMesh.getObjectByName(visualResponse.valueNodeName);
            }
            if (cmpModel) {
                const position = new THREE.Vector3();
                position.applyMatrix4(cmpModel.matrixWorld);
                const label = makeLabel(CENTER, position, RADIUS, component.id);
                this.vrControllerMesh.add(label);
            }
        });
    }
}

function makeLabel(center: THREE.Vector3, position: THREE.Vector3, radius: number, name: string) {
    const label = new THREE.Object3D();

    // Sprite
    const canvas = makeLabelCanvas(name);
    const texture = new THREE.CanvasTexture(canvas);
    texture.encoding = THREE.GammaEncoding;
    texture.anisotropy = 16;
    texture.minFilter = THREE.LinearFilter;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    const spriteBaseScale = 0.0004;
    sprite.scale.x = canvas.width  * spriteBaseScale;
    sprite.scale.y = canvas.height * spriteBaseScale;
    sprite.position.z = radius + 0.005;
    label.add(sprite);

    // Line
    const lGeometry = new THREE.BufferGeometry();
    lGeometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, radius], 3)
    );
    lGeometry.setAttribute(
        'color',
        new THREE.Float32BufferAttribute([0.125, 0.635, 1, 0.063, 0.318, 0.5], 3)
    );
    const lMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        blending: THREE.AdditiveBlending
    });
    const line = new THREE.Line(lGeometry, lMaterial);
    label.add(line);

    label.position.copy(position);
    const norm = position.clone();
    norm.sub(center);
    norm.normalize();
    label.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        norm
    );

    return label;
}

function makeLabelCanvas(name) {
    const baseWidth = 180;
    const baseHeight = 26;
    const borderSize = 2;
    const ctx = document.createElement('canvas').getContext('2d');
    const doubleBorderSize = borderSize * 2;
    const width = baseWidth + doubleBorderSize;
    const height = baseHeight + doubleBorderSize;
    ctx.canvas.width = width;
    ctx.canvas.height = height;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    drawFrame(ctx, 0, 0, width, height, true, 5, 2);

    ctx.translate(width / 2, height / 2);
    ctx.font = '14px LBA';
    ctx.fillStyle = 'white';
    ctx.shadowColor = 'black';
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.fillText(name, 0, 0);

    return ctx.canvas;
}

/*
function makeRootDebugSphere() {
    const sGeometry = new THREE.SphereGeometry(0.015, 32, 32);
    const sMaterial = new THREE.MeshBasicMaterial({color: 0xff0000});
    const sphere = new THREE.Mesh(sGeometry, sMaterial);
    sphere.position.copy(CENTER);
    return sphere;
}
*/
