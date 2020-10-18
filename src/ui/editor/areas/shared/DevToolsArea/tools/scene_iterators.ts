import { each } from 'lodash';

import { loadSceneMetaData, getObjectName } from '../../../../DebugData';
import { parseScript } from '../../../../../../scripting/parser';
import { getScene } from '../../../../../../resources';
import Scene from '../../../../../../game/Scene';

export async function forEachScene(callback) {
    for (let idx = 0; idx < 222; idx += 1) {
        const [scene] = await Promise.all([
            getScene(idx),
            loadSceneMetaData(idx)
        ]);
        callback(scene);
    }
}

interface ScriptCallback {
    (script: any, actor: any, scene: Scene, type: string): void;
}

export async function forEachScript(callback: ScriptCallback, type = null) {
    await forEachScene((scene) => {
        each(scene.actors, (actor, idx) => {
            if (!type || type === 'life') {
                const script = parseScript(idx, 'life', actor.lifeScript);
                callback(script, actor, scene, type);
            }
            if (!type || type === 'move') {
                const script = parseScript(idx, 'move', actor.moveScript);
                callback(script, actor, scene, type);
            }
        });
    });
}

function displayResults(scene, actor, script, results) {
    if (results.length > 0) {
        const actorName = getObjectName('actor', scene.index, actor.index);
        // tslint:disable-next-line: no-console
        console.log(`SCENE ${scene.index}, actor=${actorName}, script=${script.type}`);
        each(results, (result) => {
            // tslint:disable-next-line: no-console
            console.log(`  ${result}`);
        });
    }
}

export function findCommand(name, type) {
    forEachScript((script, actor, scene) => {
        const results = [];
        each(script.commands, (cmd, idx) => {
            if (cmd.op.command === name) {
                results.push(`found command ${name} at ${idx}`);
            }
        });
        displayResults(scene, actor, script, results);
    }, type);
}

export function findCondition(name) {
    forEachScript((script, actor, scene) => {
        const results = [];
        each(script.commands, (cmd, idx) => {
            if (cmd.condition && cmd.condition.op.command === name) {
                results.push(`found cond ${name} at ${idx} (cmd=${cmd.op.command})`);
            }
        });
        displayResults(scene, actor, script, results);
    }, 'life');
}

export function findLogicSequence(minLength = 3) {
    forEachScript((script, actor, scene) => {
        let count = 0;
        let start = null;
        const results = [];
        each(script.commands, (cmd, idx) => {
            const name = cmd.op.command;
            if (name === 'OR_IF' || name === 'AND_IF') {
                if (count === 0) {
                    start = idx;
                }
                count += 1;
            } else {
                if (count >= minLength) {
                    results.push(`found ${count} logic operators at ${start}`);
                }
                count = 0;
            }
        });
        displayResults(scene, actor, script, results);
    }, 'life');
}

export function findMixedLogicSequence() {
    forEachScript((script, actor, scene) => {
        let pushed = false;
        let prev = null;
        const results = [];
        each(script.commands, (cmd, idx) => {
            const name = cmd.op.command;
            if (name === 'OR_IF' || name === 'AND_IF') {
                if (prev !== null && name !== prev && !pushed) {
                    results.push(`found mixed logic sequence at ${idx}`);
                    pushed = true;
                }
                prev = name;
            } else {
                prev = null;
                pushed = false;
            }
        });
        displayResults(scene, actor, script, results);
    }, 'life');
}

/*
** This function is for being able to easily
** prototype a new search tool, or implement a
** temporary/throw-away search tool.
*/
export async function findStuff() {
    // Put whatever you want here
}
