import {processPhysicsFrame} from './physics';

export function mainGameLoop(renderer, scene, hero) {
    renderer.stats.begin();
    if (scene && scene.data) {
        processPhysicsFrame(scene.data.physics, renderer.camera, hero.physics);
        renderer.render(scene.data.threeScene);
    }
    renderer.stats.end();
}
