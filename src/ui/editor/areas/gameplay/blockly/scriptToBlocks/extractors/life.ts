import { newBlock } from './blockUtils';

export function COMPORTEMENT(workspace, cmd, connection, extractCommands) {
    const num = cmd.data.section;
    const type = num === 1
        ? 'lba_behaviour_init'
        : 'lba_behaviour';
    const block = newBlock(workspace, type, cmd);
    if (num === 2) {
        block.setFieldValue('NORMAL', 'name');
    } else if (num > 2) {
        block.setFieldValue(`BEHAVIOUR ${num}`, 'name');
    }
    const statementsConnection = block.getInput('statements').connection;
    const last = extractCommands(
        cmd.next,
        statementsConnection,
        data => data.op.command === 'END_COMPORTEMENT'
    );
    return {
        connection,
        next: last.next
    };
}

function IF_GENERIC(type, workspace, cmd, connection, extractCommands) {
    const block = newBlock(workspace, type, cmd);
    connection.connect(block.previousConnection);
    const thenConnection = block.getInput('then_statements').connection;
    let last = extractCommands(
        cmd.next,
        thenConnection,
        data => data.op.command === 'ENDIF' || data.op.command === 'ELSE'
    );
    if (last.data.op.command === 'ELSE') {
        block.enableElseBlock();
        const elseConnection = block.getInput('else_statements').connection;
        last = extractCommands(
            last.next,
            elseConnection,
            data => data.op.command === 'ENDIF'
        );
    }
    return {
        connection: block.nextConnection,
        next: last.next
    };
}

export const IF = IF_GENERIC.bind(null, 'lba_if');
export const SWIF = IF_GENERIC.bind(null, 'lba_swif');
export const ONEIF = IF_GENERIC.bind(null, 'lba_oneif');

export function SET_COMPORTEMENT(workspace, cmd, connection) {
    const block = newBlock(workspace, 'lba_set_behaviour', cmd);
    connection.connect(block.previousConnection);
    return { connection: block.nextConnection };
}

export function SET_COMPORTEMENT_OBJ(workspace, cmd, connection) {
    const block = newBlock(workspace, 'lba_set_behaviour_obj', cmd);
    connection.connect(block.previousConnection);
    return { connection: block.nextConnection };
}

export function SET_VAR_CUBE(workspace, cmd, connection) {
    const block = newBlock(workspace, 'lba_set_varscene', cmd);
    connection.connect(block.previousConnection);
    return { connection: block.nextConnection };
}

export function SET_VAR_GAME(workspace, cmd, connection) {
    const block = newBlock(workspace, 'lba_set_vargame', cmd);
    connection.connect(block.previousConnection);
    return { connection: block.nextConnection };
}

export function ANIM(workspace, cmd, connection) {
    const block = newBlock(workspace, 'lba_set_anim', cmd);
    connection.connect(block.previousConnection);
    return { connection: block.nextConnection };
}

export function ANIM_OBJ(workspace, cmd, connection) {
    const block = newBlock(workspace, 'lba_set_anim_obj', cmd);
    connection.connect(block.previousConnection);
    return { connection: block.nextConnection };
}
