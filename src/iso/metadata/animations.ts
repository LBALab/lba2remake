import * as THREE from 'three';
import { each } from 'lodash';

export async function applyAnimationUpdaters(threeObject, animations) {
    each(animations, (clip) => {
        each(clip.tracks, (track) => {
            if (track instanceof THREE.QuaternionKeyframeTrack) {
                const binding = new THREE.PropertyBinding(threeObject, track.name);
                binding.node.traverse((node) => {
                    if (node instanceof THREE.Mesh) {
                        const material = node.material as THREE.RawShaderMaterial;
                        const { uNormalMatrix } = material.uniforms;
                        node.onBeforeRender = () => {
                            uNormalMatrix.value.setFromMatrix4(node.matrixWorld);
                        };
                    }
                });
            }
        });
    });
}
