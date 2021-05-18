import * as THREE from 'three';
import { Fx, FxProps } from './Fx';
import Game from '../../../../Game';
import Scene from '../../../../Scene';
import { Time } from '../../../../../datatypes';
import VERT_TRAIL from './shaders/trail.vert.glsl';
import FRAG_TRAIL from './shaders/trail.frag.glsl';
import Renderer from '../../../../../renderer';
import { compile } from '../../../../../utils/shaders';

export default class RadarTrail implements Fx {
    private uniforms: {
        time: THREE.IUniform;
        light: THREE.IUniform;
    };

    constructor(props: FxProps) {
        this.uniforms = {
            time: { value: 0 },
            light: { value: props.light }
        };
    }

    init(node: THREE.Mesh) {
        node.material = new THREE.RawShaderMaterial({
            vertexShader: compile('vert', VERT_TRAIL),
            fragmentShader: compile('frag', FRAG_TRAIL),
            transparent: true,
            glslVersion: Renderer.getGLSLVersion(),
            uniforms: this.uniforms,
            defines: {
                SHADE: node.userData.trail_shade
            }
        });
    }

    update(_game: Game, _scene: Scene, time: Time) {
        this.uniforms.time.value = time.elapsed;
    }
}
