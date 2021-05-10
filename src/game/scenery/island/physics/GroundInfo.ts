import * as THREE from 'three';
import { IslandSection, IslandObjectInfo } from '../IslandLayout';

export default class GroundInfo {
    valid: boolean;
    sound: number;
    collision: boolean;
    liquid: number;
    height: number;
    section: IslandSection;
    readonly points = [
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
    ];

    setDefault() {
        this.height = 0;
        this.sound = null;
        this.collision = false;
        this.liquid = 0;
        this.section = null;
        this.valid = false;
        for (const pt of this.points) {
            pt.set(0, 0, 0);
        }
    }

    setFromIslandObject(section: IslandSection, obj: IslandObjectInfo) {
        this.setDefault();
        this.height = obj.boundingBox.max.y;
        this.sound = obj.soundType;
        this.section = section;
    }
}
