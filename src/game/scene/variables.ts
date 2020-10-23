export function createSceneVariables(actors: any[]) {
    let maxVarCubeIndex = -1;
    for (const actor of actors) {
        const commands = actor.scripts.life.commands;
        for (const cmd of commands) {
            if (cmd.op.command === 'SET_VAR_CUBE') {
                maxVarCubeIndex = Math.max(cmd.args[0].value, maxVarCubeIndex);
            }
            if (cmd.condition && cmd.condition.op.command === 'VAR_CUBE') {
                maxVarCubeIndex = Math.max(cmd.condition.param.value, maxVarCubeIndex);
            }
        }
    }
    const variables = [];
    for (let i = 0; i <= maxVarCubeIndex; i += 1) {
        variables.push(0);
    }
    return variables;
}

export function findUsedVarGames(actors: any[]) {
    const usedVars = [];
    for (const actor of actors) {
        const commands = actor.scripts.life.commands;
        for (const cmd of commands) {
            let value = null;
            if (cmd.op.command === 'SET_VAR_GAME') {
                value = cmd.args[0].value;
            } else if (cmd.condition && cmd.condition.op.command === 'VAR_GAME') {
                value = cmd.condition.param.value;
            }
            if (value !== null && usedVars.indexOf(value) === -1) {
                usedVars.push(value);
            }
        }
    }
    usedVars.sort((a, b) => a - b);
    return usedVars;
}
