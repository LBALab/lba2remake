import * as THREE from 'three';
import {cloneDeep} from 'lodash';
import {getObjectName} from '../ui/editor/DebugData';
import {createBoundingBox} from '../utils/rendering';
import { getParams } from '../params';

export const ZONE_TYPE = [
    'TELEPORT',
    'CAMERA',
    'SCENERIC',
    'FRAGMENT',
    'BONUS',
    'TEXT',
    'LADDER',
    'CONVEYOR',
    'SPIKE',
    'RAIL'
];

const ZONE_TYPE_MATERIAL_COLOR = [
    '#84ff84', // TELEPORT
    '#ff7448', // CAMERA
    '#6495ed', // SCENERIC
    '#ff00ff', // FRAGMENT
    '#e7b5d6', // BONUS
    '#ffb200', // TEXT
    '#5555ff', // LADDER
    '#96c09f', // CONVEYOR
    '#ffc475', // SPIKE
    '#008000', // RAIL
];

export interface ZoneProps {
    sceneIndex: number;
    index: number;
    type: number;
    pos: number[];
    snap: number;
    info0: number;
    info1: number;
    info2: number;
    info3: number;
    box: {
        xMin: number;
        yMin: number;
        zMin: number;
        xMax: number;
        yMax: number;
        zMax: number;
    };
}

export default class Zone {
    readonly type = 'zone';
    readonly zoneType: string;
    readonly props: ZoneProps;
    readonly color: THREE.Color;
    readonly physics: {
        position: THREE.Vector3;
    };
    readonly threeObject: THREE.Object3D;
    readonly boundingBox: THREE.Box3;
    readonly index: number;
    private labelCanvas: HTMLCanvasElement;
    private labelCtx: CanvasRenderingContext2D;
    private labelTexture: THREE.CanvasTexture;
    private icon: HTMLImageElement;
    private name: string;

    constructor(props: ZoneProps, is3DCam: boolean) {
        this.index = props.index;
        this.zoneType = ZONE_TYPE[props.type];
        this.props = cloneDeep(props);
        this.color = new THREE.Color(ZONE_TYPE_MATERIAL_COLOR[props.type]);
        this.physics = {
            position: new THREE.Vector3(props.pos[0], props.pos[1], props.pos[2])
        };

        const {xMin, yMin, zMin, xMax, yMax, zMax} = props.box;
        const bb = new THREE.Box3(
            new THREE.Vector3(xMin, yMin, zMin),
            new THREE.Vector3(xMax, yMax, zMax)
        );
        if (getParams().editor) {
            const bbGeom = createBoundingBox(bb, this.color);
            this.name = getObjectName('zone', props.sceneIndex, props.index);
            bbGeom.name = `zone:${this.name}`;
            bbGeom.visible = false;
            bbGeom.position.copy(this.physics.position);
            bbGeom.matrixAutoUpdate = false;
            this.threeObject = bbGeom;
            const width = bb.max.x - bb.min.x;
            const height = bb.max.y - bb.min.y;
            const depth = bb.max.z - bb.min.z;
            this.boundingBox = new THREE.Box3(
                new THREE.Vector3(-width * 0.5, -height * 0.5, -depth * 0.5),
                new THREE.Vector3(width * 0.5, height * 0.5, depth * 0.5)
            );
            this.createLabel(is3DCam);
        }
    }

    createLabel(is3DCam: boolean) {
        this.labelCanvas = document.createElement('canvas');
        this.labelCanvas.width = 256;
        this.labelCanvas.height = 64;
        this.labelCtx = this.labelCanvas.getContext('2d');
        this.icon = new Image(32, 32);
        this.icon.src = `editor/icons/zones/${this.zoneType}.svg`;
        this.labelTexture = new THREE.CanvasTexture(this.labelCanvas);
        this.labelTexture.encoding = THREE.GammaEncoding;
        this.labelTexture.anisotropy = 16;

        this.icon.onload = () => this.updateLabel();
        const spriteMaterial = new THREE.SpriteMaterial({
            map: this.labelTexture,
            depthTest: false
        });
        // @ts-ignore
        spriteMaterial.sizeAttenuation = false;
        const sprite = new THREE.Sprite(spriteMaterial);
        if (is3DCam) {
            sprite.scale.set(0.3, 0.075, 1);
        } else {
            sprite.scale.set(2, 0.5, 1);
        }
        sprite.renderOrder = 2;
        sprite.name = `label:${this.name}`;
        if (this.threeObject) {
            this.threeObject.add(sprite);
        }
    }

    updateLabel(selected = false) {
        this.labelCtx.clearRect(0, 0, this.labelCanvas.width, this.labelCanvas.height);
        this.labelCtx.font = '16px LBA';
        this.labelCtx.textAlign = 'center';
        const textWidth = Math.min(this.labelCtx.measureText(this.name).width, 256 - 64);
        this.labelCtx.fillStyle = selected ? 'white' : 'black';
        this.labelCtx.fillRect(128 - (textWidth * 0.5) - 18, 16, textWidth + 38, 32);
        this.labelCtx.lineWidth = 2;
        this.labelCtx.strokeStyle = `#${this.color.getHexString()}`;
        this.labelCtx.strokeRect(128 - (textWidth * 0.5) - 18, 16, textWidth + 38, 32);
        this.labelCtx.drawImage(this.icon, 128 - (textWidth * 0.5) - 16, 16, 32, 32);
        this.labelCtx.fillStyle = selected ? 'black' : 'white';
        this.labelCtx.fillText(this.name, 128 + 18, 38, 256 - 64);
        this.labelTexture.needsUpdate = true;
    }
}
