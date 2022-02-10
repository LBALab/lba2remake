import * as THREE from 'three';
import {cloneDeep} from 'lodash';
import {getObjectName} from '../ui/editor/DebugData';
import {createBoundingBox} from '../utils/rendering';
import { getParams } from '../params';
import assert from 'assert';

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

export enum ZoneType {
    TELEPORT = 0,
    CAMERA = 1,
    SCENERIC = 2,
    FRAGMENT = 3,
    BONUS = 4,
    TEXT = 5,
    LADDER = 6,
    CONVEYOR = 7,
    SPIKE = 8,
    RAIL = 9,
}

export interface ZoneProps {
    sceneIndex: number;
    index: number;
    type: ZoneType;
    pos: number[];
    param: number;
    info0: number;      // Camera X. Bonus type. Fragment number. Ladder/rail on/off. Text color.
    info1: number;      // Camera Y. Bonus quantity. Conveyor on/off. Spike damage. Text camera.
    info2: number;      // Camera Z. Fragment on/off. Conveyor dir. Spike rearm time. Text side.
    info3: number;      // Camera alpha. Teleport beta.
    info4: number;      // Camera beta. Teleport destination scene.
    info5: number;      // Camera gamma.
    info6: number;      // Camera distance.
    info7: number;      // Camera on/off/force. Teleport on/off.
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

    protected constructor(props: ZoneProps, is3DCam: boolean) {
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
        this.labelTexture.encoding = THREE.sRGBEncoding;
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

    static create(props: ZoneProps, is3DCam: boolean): Zone {
        switch (props.type)
        {
            case ZoneType.TELEPORT:
                return new TeleportZone(props, is3DCam);

            case ZoneType.CAMERA:
                return new CameraZone(props, is3DCam);

            case ZoneType.SCENERIC:
                return new ScenericZone(props, is3DCam);

            case ZoneType.FRAGMENT:
                return new FragmentZone(props, is3DCam);

            case ZoneType.TEXT:
                return new TextZone(props, is3DCam);

            case ZoneType.BONUS:
                return new BonusZone(props, is3DCam);

            case ZoneType.LADDER:
                return new LadderZone(props, is3DCam);

            case ZoneType.CONVEYOR:
                return new ConveyorZone(props, is3DCam);

            case ZoneType.SPIKE:
                return new SpikeZone(props, is3DCam);

            case ZoneType.RAIL:
                return new RailZone(props, is3DCam);
        }
    }
}

export class TeleportZone extends Zone {
    targetScene: number;
    x: number;
    y: number;
    z: number;
    beta: number;
    id: number;
    enabled: boolean;

    constructor(props: ZoneProps, is3DCam: boolean) {
        assert(props.type === ZoneType.TELEPORT);
        super(props, is3DCam);

        this.targetScene = this.props.param;
        this.x = this.props.info0;
        this.y = this.props.info1;
        this.z = this.props.info2;
        this.beta = this.props.info3;
        this.id = this.props.info4;
        this.enabled = (this.props.info7 & 3) !== 0;
    }
}

export class CameraZone extends Zone {
    id: number;
    x: number;
    y: number;
    z: number;
    alpha: number;
    beta: number;
    gamma: number;
    distance: number;
    enabled: boolean;
    force: boolean;

    constructor(props: ZoneProps, is3DCam: boolean) {
        assert(props.type === ZoneType.CAMERA);
        super(props, is3DCam);

        this.id = this.props.param;
        this.x = this.props.info0;
        this.y = this.props.info1;
        this.z = this.props.info2;
        this.alpha = this.props.info3;
        this.beta = this.props.info4;
        this.gamma = this.props.info5;
        this.distance = this.props.info6;
        this.enabled = (this.props.info7 & 3) !== 0;
        this.force = (this.props.info7 & 8) !== 0;
    }
}

export class ScenericZone extends Zone {
    id: number;

    constructor(props: ZoneProps, is3DCam: boolean) {
        assert(props.type === ZoneType.SCENERIC);
        super(props, is3DCam);

        this.id = this.props.param;
    }
}

export class FragmentZone extends Zone {
    id: number;
    fragment: number;
    enabled: boolean;

    constructor(props: ZoneProps, is3DCam: boolean) {
        assert(props.type === ZoneType.FRAGMENT);
        super(props, is3DCam);

        this.id = this.props.param;
        this.fragment = this.props.info0;
        this.enabled = this.props.info2 !== 0;
    }
}

export class BonusZone extends Zone {
    bonusType: number;
    quantity: number;
    given: boolean;

    constructor(props: ZoneProps, is3DCam: boolean) {
        assert(props.type === ZoneType.BONUS);
        super(props, is3DCam);

        this.bonusType = this.props.info0;
        this.quantity = this.props.info1;
        this.given = false;
    }
}

export class TextZone extends Zone {
    message: number;
    textColor: number;
    camera: number;
    side: number;

    constructor(props: ZoneProps, is3DCam: boolean) {
        assert(props.type === ZoneType.TEXT);
        super(props, is3DCam);

        this.message = this.props.param;
        this.textColor = this.props.info0;
        this.camera = this.props.info1;
        this.side = this.props.info2;
    }
}

export class LadderZone extends Zone {
    id: number;
    enabled: boolean;

    constructor(props: ZoneProps, is3DCam: boolean) {
        assert(props.type === ZoneType.LADDER);
        super(props, is3DCam);

        this.id = this.props.param;
        this.enabled = this.props.info0 !== 0;
    }
}

export class ConveyorZone extends Zone {
    id: number;
    enabled: boolean;
    direction: number;

    constructor(props: ZoneProps, is3DCam: boolean) {
        assert(props.type === ZoneType.CONVEYOR);
        super(props, is3DCam);

        this.id = this.props.param;
        this.enabled = this.props.info1 !== 0;
        this.direction = this.props.info2;
    }
}

export class SpikeZone extends Zone {
    id: number;
    damage: number;
    rearmTime: number;

    constructor(props: ZoneProps, is3DCam: boolean) {
        assert(props.type === ZoneType.SPIKE);
        super(props, is3DCam);

        this.id = this.props.param;
        this.damage = this.props.info1;
        this.rearmTime = this.props.info2;
    }
}

export class RailZone extends Zone {
    id: number;
    enabled: boolean;

    constructor(props: ZoneProps, is3DCam: boolean) {
        assert(props.type === ZoneType.RAIL);
        super(props, is3DCam);

        this.id = this.props.param;
        this.enabled = this.props.info0 !== 0;
    }
}
