import { newBlock } from './blockUtils';

function unkownCond(label, workspace, cmd, { connection }) {
    const block = newBlock(workspace, 'lba_unknown_cond', cmd);
    block.setFieldValue(label, 'label');
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

export function DISTANCE(workspace, cmd, { connection }) {
    const block = newBlock(workspace, 'lba_distance', cmd);
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

export function BODY(workspace, cmd, { connection }) {
    const block = newBlock(workspace, 'lba_body', cmd);
    connection.connect(block.outputConnection);
}

export function BODY_OBJ(workspace, cmd, { connection }) {
    const block = newBlock(workspace, 'lba_body_obj', cmd);
    connection.connect(block.outputConnection);
}

export function ANIM(workspace, cmd, { connection }) {
    const block = newBlock(workspace, 'lba_anim', cmd);
    connection.connect(block.outputConnection);
}

export function ANIM_OBJ(workspace, cmd, { connection }) {
    const block = newBlock(workspace, 'lba_anim_obj', cmd);
    connection.connect(block.outputConnection);
}

export const CURRENT_TRACK = unkownCond.bind(null, 'track');

export const CURRENT_TRACK_OBJ = unkownCond.bind(null, '<actor> track');

export const VAR_GAME = unkownCond.bind(null, 'var game');

export const VAR_CUBE = unkownCond.bind(null, 'var scene');

export const CONE_VIEW = unkownCond.bind(null, 'cone view');

export const HIT_BY = unkownCond.bind(null, 'hit by');

export const ACTION = unkownCond.bind(null, 'action');

export const LIFE_POINT = unkownCond.bind(null, 'life points');

export const LIFE_POINT_OBJ = unkownCond.bind(null, '<actor> life points');

export const KEYS = unkownCond.bind(null, 'keys');

export const MONEY = unkownCond.bind(null, 'money');

export const BEHAVIOUR = unkownCond.bind(null, 'hero behaviour');

export const CHAPTER = unkownCond.bind(null, 'chapter');

export const DISTANCE_3D = unkownCond.bind(null, 'distance 3D');

export const MAGIC_LEVEL = unkownCond.bind(null, 'magic level');

export const MAGIC_POINTS = unkownCond.bind(null, 'magic points');

export const USING_INVENTORY = unkownCond.bind(null, 'using inventory');

export const CHOICE = unkownCond.bind(null, 'choice');

export const FUEL = unkownCond.bind(null, 'fuel');

export const CARRIED_BY = unkownCond.bind(null, 'carried by');

export const CDROM = unkownCond.bind(null, 'cdrom');

export const LADDER = unkownCond.bind(null, 'ladder');

export const RND = unkownCond.bind(null, 'random');

export const RAIL = unkownCond.bind(null, 'rail');

export const BETA = unkownCond.bind(null, 'beta');

export const BETA_OBJ = unkownCond.bind(null, '<actor> beta');

export const CARRIED_OBJ_BY = unkownCond.bind(null, 'carried <actor> by');

export const ANGLE = unkownCond.bind(null, 'angle');

export const DISTANCE_MESSAGE = DISTANCE;

export const HIT_OBJ_BY = unkownCond.bind(null, '<actor> hit by');

export const REAL_ANGLE = unkownCond.bind(null, 'real angle');

export const DEMO = unkownCond.bind(null, 'is demo');

export const COL_DECORS = unkownCond.bind(null, 'collision with decors');

export const COL_DECORS_OBJ = unkownCond.bind(null, '<actor> collision with decors');

export const PROCESSOR = unkownCond.bind(null, 'processor');

export const OBJECT_DISPLAYED = unkownCond.bind(null, 'object displayed');

export const ANGLE_OBJ = unkownCond.bind(null, '<actor> angle');
