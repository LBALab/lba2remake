import { head, tail } from 'lodash';
import extractors from './extractors';

export function fillWorkspace(workspace, _scene, actor) {
    extractBlocksFromScript(workspace, actor, 'life');
    extractBlocksFromScript(workspace, actor, 'move');
}

function makeList(commands, type, index = 0) {
    if (commands.length === 0)
        return null;

    return {
        index,
        type,
        data: head(commands),
        next: makeList(tail(commands), type, index + 1)
    };
}

const defaultStop = _data => false;

function extractBlocksFromScript(workspace, actor, type) {
    function extractCommands(cmd, connection = null, stopCond = defaultStop, level = 0) {
        while (cmd && !stopCond(cmd.data)) {
            if (cmd.data.op.command in extractors[type]) {
                const extract = extractors[type][cmd.data.op.command];
                const res = extract(workspace, cmd, connection, extractCommands, level);
                cmd = res.next || cmd.next;
                connection = res.connection;
            } else {
                cmd = cmd.next;
            }
        }
        return cmd;
    }
    return extractCommands(makeList(actor.scripts[type].commands, type));
}
