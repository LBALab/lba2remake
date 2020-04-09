import { newBlock } from './blockUtils';

export function DISTANCE(workspace, cmd, { connection }) {
    const block = newBlock(workspace, 'lba_distance', cmd);
    connection.connect(block.outputConnection);
}

export function COL(workspace, cmd, { connection }) {
    const block = newBlock(workspace, 'lba_collision', cmd);
    connection.connect(block.outputConnection);
}

export function COL_OBJ(workspace, cmd, { connection }) {
    const block = newBlock(workspace, 'lba_collision_obj', cmd);
    connection.connect(block.outputConnection);
}

export function ZONE(workspace, cmd, { connection }) {
    const block = newBlock(workspace, 'lba_zone', cmd);
    connection.connect(block.outputConnection);
}

export function ZONE_OBJ(workspace, cmd, { connection }) {
    const block = newBlock(workspace, 'lba_zone_obj', cmd);
    connection.connect(block.outputConnection);
}
