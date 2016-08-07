import {each} from 'lodash';
import {processPhysicsFrame} from './physics';

export function mainGameLoop(renderer, scene, hero, controls) {
    renderer.stats.begin();

    if (scene && scene.data) {
        each(controls, ctrl => { ctrl.update && ctrl.update(); });
        processPhysicsFrame(scene.data.physics, renderer.camera, hero.physics);
        renderer.render(scene.data.threeScene);
    }
    renderer.stats.end();
}
