import * as THREE from 'three';
import { Fx, FxProps } from './Fx';
import Game from '../../../../Game';
import Scene from '../../../../Scene';
import { Time } from '../../../../../datatypes';

export default class Rotate implements Fx {
    private node: THREE.Mesh;
    private euler = new THREE.Euler();
    private speed: number;
    private axis: 'x' | 'z';

    constructor(_props: FxProps) {}

    init(node: THREE.Mesh) {
        this.node = node;
        this.euler.setFromQuaternion(node.quaternion, 'YXZ');
        this.speed = node.userData.rotate_speed;
        this.axis = node.userData.rotate_axis;
    }

    update(_game: Game, _scene: Scene, time: Time) {
        this.euler[this.axis] = time.elapsed * this.speed;
        this.node.quaternion.setFromEuler(this.euler);
    }
}
