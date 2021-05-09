import { Resource } from '../load';
import { makeNewBox, AnimAction } from './entity2';
import { WORLD_SCALE } from '../../utils/lba';

const ACTIONTYPE = {
    NOP                 : 0,
    BODY                : 1,
    BODP                : 2,
    ANIM                : 3,
    ANIP                : 4,
    HIT                 : 5,
    SAMPLE              : 6,
    SAMPLE_RND          : 7,
    THROW               : 8,
    THROW_MAGIC         : 9,
    SAMPLE_REPEAT       : 10,
    THROW_SEARCH        : 11,
    THROW_ALPHA         : 12,
    SAMPLE_STOP         : 13,
    ZV                  : 14,
    LEFT_STEP           : 15,
    RIGHT_STEP          : 16,
    HIT_HERO            : 17,
    THROW_3D            : 18,
    THROW_3D_ALPHA      : 19,
    THROW_3D_SEARCH     : 20,
};

export const parseEntityLBA1 = (resource: Resource) => {
    const entities = [];
    for (let i = 0; i < resource.length; i += 1) {
        const buffer = resource.getEntry(i);
        const entity = loadEntityEntry(buffer, 0, i);
        entities.push(entity);
    }
    return entities;
};

const loadEntityEntry = (buffer, dataOffset, index) => {
    const data = new DataView(buffer, dataOffset);
    let offset = 0;
    const entity = {
        index,
        bodies: [],
        anims: []
    };
    let opcode = 0;
    do {
        opcode = data.getUint8(offset);
        offset += 1;

        switch (opcode) {
            case 1: { // body
                const body = loadEntityBody(data, offset);
                entity.bodies.push(body);
                offset += body.offset;
            }
                break;
            case 3: { // anim
                const anim = loadEntityAnim(data, offset);
                entity.anims.push(anim);
                offset += anim.offset;
            }
                break;
            /* default:
                offset += 1;
                offset += data.getUint8(offset);
            break; */
        }
    } while (opcode !== 0xFF);

    return entity;
};

const loadEntityBody = (data, offset) => {
    const body = {
        index: 0,
        offset: 0,
        bodyIndex: 0,
        hasCollisionBox: false,
        box: makeNewBox()
    };

    body.index = data.getUint8(offset, true);
    body.offset = data.getUint8(offset + 1, true);
    offset += 2;
    if (body.offset > 0) {
        body.offset += 1; // to add the previous byte
    }
    body.bodyIndex = data.getInt16(offset, true);
    offset += 2;

    const hasCollisionBox = data.getUint8(offset, true);
    offset += 1;

    if (hasCollisionBox === 1) {
        body.hasCollisionBox = true;
        const box = {
            xMin: 0,
            yMin: 0,
            zMin: 0,
            xMax: 0,
            yMax: 0,
            zMax: 0
        };

        const actionType = data.getUint8(offset, true);
        offset += 1;
        if (actionType === ACTIONTYPE.ZV) {
            box.xMin = data.getInt16(offset, true);
            box.yMin = data.getInt16(offset + 2, true);
            box.zMin = data.getInt16(offset + 4, true);
            box.xMax = data.getInt16(offset + 6, true);
            box.yMax = data.getInt16(offset + 8, true);
            box.zMax = data.getInt16(offset + 10, true);
        }
        body.box = box;
    }
    return body;
};

const loadEntityAnim = (data, offset) => {
    const anim = {
        index: 0,
        offset: 0,
        animIndex: 0,
        actions: []
    };

    anim.index = data.getUint8(offset, true);
    offset += 1;
    anim.offset = data.getUint8(offset, true);
    offset += 1;
    if (anim.offset > 0) {
        anim.offset += 1; // to add the previous byte
    }
    if (anim.offset === 0) {
        anim.offset += 4;
    }
    anim.animIndex = data.getInt16(offset, true);
    offset += 2;

    const hasAction = data.getUint8(offset, true);

    if (hasAction > 0) {
        let innerOffset = 0;

        const numActions = data.getUint8(innerOffset + offset, true);
        innerOffset += 1;

        for (let i = 0; i < numActions; i += 1) {
            const action: AnimAction = {
                type: data.getInt8(innerOffset + offset, true),
                animFrame: data.getInt8(innerOffset + offset + 1, true),
            };
            switch (action.type) {
                case ACTIONTYPE.ZV:
                    break;
                case ACTIONTYPE.HIT:
                    action.strength = data.getUint8(innerOffset + offset + 2, true);
                    innerOffset += 2;
                    break;
                case ACTIONTYPE.SAMPLE:
                    action.sampleIndex = data.getUint16(innerOffset + offset + 2, true);
                    action.frequency = 0x1000;
                    innerOffset += 2;
                    break;
                case ACTIONTYPE.SAMPLE_RND:
                    action.sampleIndex = data.getUint16(innerOffset + offset + 2, true);
                    action.frequency = data.getUint16(innerOffset + offset + 4, true);
                    innerOffset += 5;
                    break;
                case ACTIONTYPE.THROW:
                    action.yHeight = data.getInt16(innerOffset + offset + 2, true) * WORLD_SCALE;
                    action.spriteIndex = data.getInt8(innerOffset + offset + 4, true);
                    action.alpha = data.getInt16(innerOffset + offset + 5, true) * 0x1000 / 0x400;
                    action.beta = data.getInt16(innerOffset + offset + 7, true) * 0x1000 / 0x400;
                    action.speed = data.getInt16(innerOffset + offset + 9, true);
                    action.weight = data.getInt8(innerOffset + offset + 11, true);
                    action.strength = data.getInt8(innerOffset + offset + 12, true);
                    innerOffset += 12;
                    break;
                case ACTIONTYPE.THROW_MAGIC:
                    action.unk1 = data.getUint16(innerOffset + offset + 2, true);
                    action.unk2 = data.getUint16(innerOffset + offset + 4, true);
                    action.unk3 = data.getUint16(innerOffset + offset + 6, true);
                    action.unk4 = data.getUint8(innerOffset + offset + 8, true);
                    innerOffset += 8;
                    break;
                case ACTIONTYPE.SAMPLE_REPEAT:
                    action.sampleIndex = data.getUint16(innerOffset + offset + 2, true);
                    action.repeat = data.getUint16(innerOffset + offset + 4, true);
                    innerOffset += 5;
                    break;
                case ACTIONTYPE.THROW_SEARCH:
                    action.yHeight = data.getUint16(innerOffset + offset + 2, true) * WORLD_SCALE;
                    action.unk1 = data.getInt8(innerOffset + offset + 4, true);
                    action.unk2 = data.getInt8(innerOffset + offset + 5, true);
                    action.unk3 = data.getInt16(innerOffset + offset + 6, true);
                    // action.unk4 = data.getInt8(innerOffset + offset + 8, true); ???
                    innerOffset += 7;
                    break;
                case ACTIONTYPE.THROW_ALPHA:
                    action.yHeight = data.getInt16(innerOffset + offset + 2, true) * WORLD_SCALE;
                    action.spriteIndex = data.getInt8(innerOffset + offset + 4, true);
                    action.alpha = data.getInt16(innerOffset + offset + 5, true) * 0x1000 / 0x400;
                    action.beta = data.getInt16(innerOffset + offset + 7, true) * 0x1000 / 0x400;
                    action.speed = data.getInt16(innerOffset + offset + 9, true);
                    action.weight = data.getInt8(innerOffset + offset + 11, true);
                    action.strength = data.getInt8(innerOffset + offset + 12, true);
                    innerOffset += 12;
                    break;
                case ACTIONTYPE.SAMPLE_STOP:
                    action.sampleIndex = data.getUint8(innerOffset + offset + 2, true);
                    innerOffset += 3;
                    break;
                case ACTIONTYPE.LEFT_STEP:
                case ACTIONTYPE.RIGHT_STEP:
                    innerOffset += 1;
                    break;
                case ACTIONTYPE.HIT_HERO:
                    innerOffset += 1;
                    break;
                case ACTIONTYPE.THROW_3D:
                case ACTIONTYPE.THROW_3D_ALPHA:
                    action.distanceX = data.getInt16(innerOffset + offset + 2, true) * WORLD_SCALE;
                    action.distanceY = data.getInt16(innerOffset + offset + 4, true) * WORLD_SCALE;
                    action.distanceZ = data.getInt16(innerOffset + offset + 6, true) * WORLD_SCALE;
                    action.spriteIndex = data.getInt8(innerOffset + offset + 8, true);
                    action.alpha = data.getInt16(innerOffset + offset + 9, true) * 0x1000 / 0x400;
                    action.beta = data.getInt16(innerOffset + offset + 11, true) * 0x1000 / 0x400;
                    action.speed = data.getInt16(innerOffset + offset + 13, true);
                    action.weight = data.getInt8(innerOffset + offset + 15, true);
                    action.strength = data.getInt8(innerOffset + offset + 16, true);
                    innerOffset += 16;
                    break;
                case ACTIONTYPE.THROW_3D_SEARCH:
                    action.distanceX = data.getInt16(innerOffset + offset + 2, true) * WORLD_SCALE;
                    action.distanceY = data.getInt16(innerOffset + offset + 4, true) * WORLD_SCALE;
                    action.distanceZ = data.getInt16(innerOffset + offset + 6, true) * WORLD_SCALE;
                    action.spriteIndex = data.getInt8(innerOffset + offset + 8, true);
                    action.targetActor = data.getInt8(innerOffset + offset + 9, true);
                    action.unk1 = data.getInt16(innerOffset + offset + 10, true);
                    action.unk2 = data.getInt8(innerOffset + offset + 12, true);
                    innerOffset += 12;
                    break;
            }
            innerOffset += 1;
            anim.actions.push(action);
        }
    }
    return anim;
};
