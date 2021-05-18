import * as THREE from 'three';
import { times } from 'lodash';
import VERT_OBJECTS_DOME from './shaders/dome.vert.glsl';
import FRAG_OBJECTS_DOME from './shaders/dome.frag.glsl';
import { Fx, FxProps } from './Fx';
import Game from '../../../../Game';
import Scene from '../../../../Scene';
import { Time } from '../../../../../datatypes';

export default class DomeFloor implements Fx {
    private props: FxProps;
    private actorPos: THREE.Vector3[];

    constructor(props: FxProps) {
        this.props = props;
    }

    init(node: THREE.Mesh) {
        this.actorPos = times(this.props.numActors, () => new THREE.Vector3());
        node.material = new THREE.RawShaderMaterial({
            vertexShader: VERT_OBJECTS_DOME,
            fragmentShader: FRAG_OBJECTS_DOME,
            transparent: true,
            side: THREE.DoubleSide,
            defines: {
                NUM_ACTORS: this.props.numActors
            },
            uniforms: {
                actorPos: { value: this.actorPos }
            }
        });
    }

    update(_game: Game, scene: Scene, _time: Time) {
        scene.actors.forEach((actor, idx) => {
            if (actor.threeObject && !actor.state.isDead) {
                this.actorPos[idx].set(0, 0, 0);
                this.actorPos[idx].applyMatrix4(actor.threeObject.matrixWorld);
            } else {
                // Make it far
                this.actorPos[idx].set(-1000, -1000, -1000);
            }
        });
    }
}
