import { each } from 'lodash';
import { parseScripts } from './parser';
import { postProcessScripts, cleanUpScripts } from './postprocess';
import { compileScripts } from './compiler';

export function loadScripts(game, scene) {
    each(scene.actors, (actor) => {
        actor.scripts = parseScripts(actor);
    });
    each(scene.actors, (actor) => {
        postProcessScripts(scene, actor);
    });
    each(scene.actors, (actor) => {
        cleanUpScripts(actor);
    });
    each(scene.actors, (actor) => {
        compileScripts(game, scene, actor);
    });
}
