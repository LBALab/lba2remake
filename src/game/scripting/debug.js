import THREE from 'three';
import {parseScript} from './parse';
import {DISPLAY_ACTOR_LABELS} from '../../debugFlags';

const scripts_cache = {};
let selectedActor = -1;

export function initDebugForScene(scene) {
    window.dispatchEvent(new CustomEvent('lba_ext_event_out', {
        detail: {
            type: 'setScene',
            index: scene.index, actors: scene.actors.length + 1
        }
    }));
    window.addEventListener('lba_ext_event_in', function(event) {
        const message = event.detail;
        if (message.type == 'selectActor') {
            selectedActor = message.index;
            const actor = message.index == 0 ? {index: 0, props: scene.data.hero} : scene.data.actors[message.index - 1];
            const scripts = parseActorScripts(scene, actor);
            window.dispatchEvent(new CustomEvent('lba_ext_event_out', {
                detail: {
                    type: 'setActorScripts',
                    life: {
                        commands: scripts.life.commands,
                        activeLine: scripts.life.activeLine
                    },
                    move: {
                        commands: scripts.move.commands,
                        activeLine: scripts.move.activeLine
                    }
                }
            }));
        }
    });
}

export function setCursorPosition(scene, actor, scriptType, offset) {
    const scripts = parseActorScripts(scene, actor);
    const line = scripts[scriptType].opMap[offset];
    if (line === undefined)
        return;
    if (scripts[scriptType].activeLine != line && selectedActor == actor.index) {
        window.dispatchEvent(new CustomEvent('lba_ext_event_out', {
            detail: {
                type: 'setCurrentLine',
                scene: scene.index,
                actor: actor.index,
                scriptType: scriptType,
                line: line
            }
        }));
    }
    scripts[scriptType].activeLine = line;
}

export function addActorSprite(actor, isMainScene) {
    if (DISPLAY_ACTOR_LABELS && isMainScene) {
        const main = document.querySelector('#main');
        const sprite = document.createElement('div');
        sprite.id = `actor_sprite_${actor.index}`;
        sprite.classList.add('actorSprite');
        sprite.innerHTML = `<span class="text">${actor.index}</span>`;
        main.appendChild(sprite);
    }
}

export function resetDebugger() {
    const main = document.querySelector('#main');
    document.querySelectorAll('.actorSprite').forEach(function(elem) {
        main.removeChild(elem);
    });
}

const spritePos = new THREE.Vector3();

export function updateActorSprite(scene, renderer, actor) {
    if (!DISPLAY_ACTOR_LABELS || scene.index != actor.scene)
        return;
    const sprite = document.querySelector(`#actor_sprite_${actor.index}`);
    if (sprite) {
        const widthHalf = 0.5 * renderer.domElement.width;
        const heightHalf = 0.5 * renderer.domElement.height;

        actor.threeObject.updateMatrixWorld();
        spritePos.setFromMatrixPosition(actor.threeObject.matrixWorld);
        spritePos.project(renderer.getMainCamera(scene));

        spritePos.x = ( spritePos.x * widthHalf ) + widthHalf;
        spritePos.y = - ( spritePos.y * heightHalf ) + heightHalf;

        if (spritePos.z < 1) {
            sprite.style.left = spritePos.x + 'px';
            sprite.style.top = spritePos.y + 'px';
            sprite.style.display = 'block';
        } else {
            sprite.style.display = 'none';
        }
    }
}

function parseActorScripts(scene, actor) {
    const key = scene.index + '_' + actor.index;
    if (key in scripts_cache) {
        return scripts_cache[key];
    } else {
        const scripts = {
            life: parseScript(actor.index, 'life', actor.props.lifeScript),
            move: parseScript(actor.index, 'move', actor.props.moveScript)
        };
        scripts_cache[key] = scripts;
        return scripts;
    }
}
