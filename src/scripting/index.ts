import { postProcessScripts, cleanUpScripts } from './postprocess';
import { compileScripts } from './compiler';
import Scene from '../game/Scene';
import Game from '../game/Game';

export function loadScripts(game: Game, scene: Scene) {
    for (const actor of scene.actors) {
        postProcessScripts(scene, actor);
    }
    for (const actor of scene.actors) {
        cleanUpScripts(actor);
    }
    for (const actor of scene.actors) {
        compileScripts(game, scene, actor);
    }
}
