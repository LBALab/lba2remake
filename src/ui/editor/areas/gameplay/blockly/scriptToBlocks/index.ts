import { each } from 'lodash';
import extractors from './extractors';

export function fillWorkspace(workspace) {
    extractCommands(workspace, 'life');
    extractCommands(workspace, 'move');
}

function extractCommands(workspace, type) {
    const commands = workspace.actor.scripts[type].commands;
    const tExtractors = extractors[type];
    const ctx = { connection: null };
    each(commands, (data, index) => {
        let newCtx = {};
        const cmdName = data.op.command;
        if (cmdName in tExtractors) {
            const extractor = tExtractors[cmdName];
            newCtx = extractor(workspace, {data, index, type}, ctx);
        }
        Object.assign(ctx, newCtx);
    });
}
