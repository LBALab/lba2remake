import { each } from 'lodash';
import { parseScript } from './parser';
import { compileScripts } from './compiler';

export function loadScripts(game, scene) {
    each(scene.actors, (actor) => {
        actor.scripts = {
            life: parseScript(actor.index, 'life', actor.props.lifeScript),
            move: parseScript(actor.index, 'move', actor.props.moveScript)
        };
    });
    each(scene.actors, (actor) => {
        compileScripts(game, scene, actor);
    });
}
