import * as THREE from 'three';
import Scene from '../../game/Scene';

let currentFog;

export const setCurrentFog = (fog: boolean) => {
    currentFog = fog;
};

export const setFog = (scene: Scene, fog: boolean) => {
    if (currentFog !== fog) {
        if (scene && scene.scenery &&
            scene.scenery.props && scene.scenery.threeObject) {
            scene.scenery.threeObject.traverse((obj) => {
                if (obj && obj instanceof THREE.Mesh && obj.material &&
                    (obj.material as THREE.RawShaderMaterial).uniforms &&
                    (obj.material as THREE.RawShaderMaterial).uniforms.fogDensity) {
                    (obj.material as THREE.RawShaderMaterial).uniforms.fogDensity.value =
                        fog ? scene.scenery.props.envInfo.fogDensity : 0;
                }
            });
            currentFog = fog;
        }
    }
};
