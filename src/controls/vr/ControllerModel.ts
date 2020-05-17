import { each, first } from 'lodash';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { MotionController } from '@webxr-input-profiles/motion-controllers';
import { drawFrame } from '../../ui/vr/vrUtils';
import { tr } from '../../lang';

const loader = new GLTFLoader();

const CENTER = new THREE.Vector3(0, -0.03, -0.02);
const RADIUS = 0.08;

const keys1stPerson = ['fpMove', 'fpTurn'];
const keys3rdPerson = ['move', 'centerCam'];

export default class ControllerModel {
    motionController: MotionController;
    threeObject: THREE.Object3D;
    vrControllerMesh: THREE.Object3D;
    handMesh: THREE.Object3D;
    labels: THREE.Object3D;
    labels1stPerson: THREE.Object3D;
    labels3rdPerson: THREE.Object3D;
    labelsCommon: THREE.Object3D;

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
        // Update all matrices for correct label placement
        this.vrControllerMesh.traverse((node) => {
            node.updateMatrix();
            node.updateMatrixWorld(true);
        });
        // this.mesh.add(makeRootDebugSphere());
        return this;
    }

    update(ctx) {
        const { game } = ctx;
        const { controlsState } = game;
        this.labels1stPerson.visible = !!controlsState.firstPerson;
        this.labels3rdPerson.visible = !controlsState.firstPerson;
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

    loadLabels(mappings) {
        if (this.labels) {
            this.vrControllerMesh.remove(this.labels);
        }
        this.labels = new THREE.Object3D();
        this.labels1stPerson = new THREE.Object3D();
        this.labels3rdPerson = new THREE.Object3D();
        this.labelsCommon = new THREE.Object3D();
        this.labels.add(this.labels1stPerson);
        this.labels.add(this.labels3rdPerson);
        this.labels.add(this.labelsCommon);
        this.vrControllerMesh.add(this.labels);
        const { components } = this.motionController;
        each(mappings, (mapping, key) => {
            const component = mapping && components[mapping.btn];
            if (!component) {
                return;
            }

            let cmpModel = null;
            const visualResponse = first(Object.values(component.visualResponses)) as any;
            if (visualResponse) {
                cmpModel = this.vrControllerMesh.getObjectByName(visualResponse.valueNodeName);
            }
            if (cmpModel) {
                const position = new THREE.Vector3();
                position.applyMatrix4(cmpModel.matrixWorld);
                const label = makeLabel(CENTER, position, RADIUS, tr(`vrButton_${key}`));
                if (keys1stPerson.includes(key)) {
                    this.labels1stPerson.add(label);
                } else if (keys3rdPerson.includes(key)) {
                    this.labels3rdPerson.add(label);
                } else {
                    this.labelsCommon.add(label);
                }
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
    const width = 256;
    const height = 32;
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.canvas.width = width;
    ctx.canvas.height = height;

    const applyTextProps = () => {
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.font = '14px LBA';
        ctx.fillStyle = 'white';
        ctx.shadowColor = 'black';
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
    };
    applyTextProps();
    const metrics = ctx.measureText(name);
    const textWidth = Math.min(metrics.width + 16, width);
    const x = Math.floor((width - textWidth) * 0.5);
    drawFrame(ctx, x, 0, textWidth, height, false, 5, 2);

    applyTextProps();
    ctx.translate(Math.round(width * 0.5), Math.round(height * 0.5));
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
