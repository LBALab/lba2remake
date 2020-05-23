import * as THREE from 'three';

let currentFog;

export const setCurrentFog = (fog: boolean) => {
    currentFog = fog;
};

export const setFog = (scene, fog: boolean) => {
    if (currentFog !== fog) {
        if (scene && scene.scenery &&
            scene.scenery.props && scene.scenery.threeObject) {
            scene.scenery.threeObject.traverse((obj) => {
                if (obj && obj.material && obj instanceof THREE.Mesh &&
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
