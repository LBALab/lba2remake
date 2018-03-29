// @flow

type Action = {
    type: number,
    animFrame: number,
    sampleIndex: number,
    frequency: number,
    unk1: number,
    unk2: number,
    unk3: number,
    unk4: number,
    unk5: number,
    strength: number,
    distanceX: number,
    distanceY: number,
    distanceZ: number,
    yHeight: number,
    spriteIndex: number,
    repeat: number,
    targetActor: number
}

type Anim = {
    index: number,
    animIndex: number,
    actions: Action[],
    offset: number
}

type Box = {
    xMin: number,
    yMin: number,
    zMin: number,
    xMax: number,
    yMax: number,
    zMax: number
}

export type Body = {
    bodyIndex: number,
    index: number,
    offset: number,
    hasCollisionBox: boolean,
    box: Box
}

export type Entity = {
    anims: Anim[],
    bodies: Body[]
}

/* eslint-disable key-spacing */
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
    THROW_3D_MAGIC      : 21,
    SUPER_HIT           : 22,
    THROW_OBJ_3D        : 23,
    PATH                : 24,
    FLOW                : 25,
    FLOW_3D             : 26,
    THROW_DART          : 27,
    SHIELD              : 28,
    SAMPLE_MAGIC        : 29,
    THROW_3D_CONQUE     : 30,
    ZV_ANIMIT           : 31,
    IMPACT              : 32,
    RENVOIE             : 33,
    RENVOYABLE          : 34,
    TRANSPARENT         : 35,
    SCALE               : 36,
    LEFT_JUMP           : 37,
    RIGHT_JUMP          : 38,
    NEW_SAMPLE          : 39,
    IMPACT_3D           : 40,
    THROW_MAGIC_EXTRA   : 41,
    THROW_FOUDRE        : 42,
};
/* eslint-enable key-spacing */

const entities = [];

export function loadEntity(buffer: ArrayBuffer) {
    if (entities.length === 0) {
        const data = new DataView(buffer);
        const offset = data.getUint32(0, true);
        const numEntries = (offset / 4) - 1;
        const offsets = [];
        for (let i = 0; i < numEntries; i += 1) {
            offsets.push(data.getUint32(i * 4, true));
        }
        for (let i = 0; i < numEntries; i += 1) {
            const entity = loadEntityEntry(buffer, offsets[i], i);
            entities.push(entity);
        }
    }
    return entities;
}

function loadEntityEntry(buffer, dataOffset, index) {
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
}

function loadEntityBody(data, offset) {
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
}

function loadEntityAnim(data, offset) {
    const anim = {
        index: 0,
        offset: 0,
        animIndex: 0,
        actions: []
    };

    anim.index = data.getUint16(offset, true);
    offset += 2;
    anim.offset = data.getUint8(offset, true);
    offset += 1;
    if (anim.offset > 0) {
        anim.offset += 2; // to add the previous byte
    }
    if (anim.offset === 0) {
        anim.offset += 5;
    }
    // const actionBytes = data.getUint8(offset++, true);
    anim.animIndex = data.getInt16(offset, true);
    offset += 2;

    const hasAction = data.getUint8(offset, true);

    if (hasAction > 0) {
        // anim.offset += actionBytes - 3;

        let innerOffset = 0;

        const numActions = data.getUint8(innerOffset + offset, true);
        innerOffset += 1;

        for (let i = 0; i < numActions; i += 1) {
            const action = {
                type: data.getUint8(innerOffset + offset, true),
                animFrame: -1,
                sampleIndex: -1,
                frequency: -1,
                unk1: -1,
                unk2: -1,
                unk3: -1,
                unk4: -1,
                unk5: -1,
                strength: -1,
                distanceX: -1,
                distanceY: -1,
                distanceZ: -1,
                yHeight: -1,
                spriteIndex: -1,
                repeat: -1,
                targetActor: -1
            };
            switch (action.type) {
                case ACTIONTYPE.ZV:
                    innerOffset += 12 + 1;
                    break;
                case ACTIONTYPE.ZV_ANIMIT:
                    innerOffset += 1;
                    break;
                case ACTIONTYPE.SUPER_HIT:
                    innerOffset += 9 + 1;
                    break;
                case ACTIONTYPE.HIT:
                    action.animFrame = data.getUint8(innerOffset + offset + 1, true);
                    action.strength = data.getUint8(innerOffset + offset + 2, true);
                    innerOffset += 2;
                    break;
                case ACTIONTYPE.SAMPLE:
                    action.animFrame = data.getUint8(innerOffset + offset + 1, true);
                    action.sampleIndex = data.getUint16(innerOffset + offset + 2, true);
                    action.frequency = data.getUint16(innerOffset + offset + 4, true);
                    innerOffset += 3;
                    break;
                case ACTIONTYPE.NEW_SAMPLE:
                    action.animFrame = data.getUint8(innerOffset + offset + 1, true);
                    action.sampleIndex = data.getUint16(innerOffset + offset + 2, true);
                    action.frequency = data.getUint16(innerOffset + offset + 4, true);
                    innerOffset += 8;
                    break;
                case ACTIONTYPE.SAMPLE_RND:
                    action.animFrame = data.getUint8(innerOffset + offset + 1, true);
                    action.sampleIndex = data.getUint16(innerOffset + offset + 2, true);
                    action.frequency = data.getUint16(innerOffset + offset + 4, true);
                    innerOffset += 5;
                    break;
                case ACTIONTYPE.THROW:
                    action.animFrame = data.getUint8(innerOffset + offset + 1, true);
                    action.yHeight = data.getUint16(innerOffset + offset + 2, true);
                    action.spriteIndex = data.getUint8(innerOffset + offset + 4, true);
                    action.unk1 = data.getUint16(innerOffset + offset + 5, true);
                    action.unk2 = data.getUint16(innerOffset + offset + 7, true);
                    action.unk3 = data.getUint16(innerOffset + offset + 9, true);
                    action.unk4 = data.getUint8(innerOffset + offset + 11, true);
                    action.unk5 = data.getUint8(innerOffset + offset + 12, true);
                    innerOffset += 12;
                    break;
                case ACTIONTYPE.THROW_MAGIC:
                    // check for magic ball 7 not 8
                    action.animFrame = data.getUint8(innerOffset + offset + 1, true);
                    action.unk1 = data.getUint16(innerOffset + offset + 2, true);
                    action.unk2 = data.getUint16(innerOffset + offset + 4, true);
                    action.unk3 = data.getUint16(innerOffset + offset + 6, true);
                    action.unk4 = data.getUint8(innerOffset + offset + 8, true);
                    innerOffset += 8;
                    break;
                case ACTIONTYPE.SAMPLE_REPEAT:
                    action.animFrame = data.getUint8(innerOffset + offset + 1, true);
                    action.sampleIndex = data.getUint16(innerOffset + offset + 2, true);
                    action.repeat = data.getUint16(innerOffset + offset + 4, true);
                    innerOffset += 10;
                    break;
                case ACTIONTYPE.THROW_SEARCH:
                    action.animFrame = data.getUint8(innerOffset + offset + 1, true);
                    action.yHeight = data.getUint16(innerOffset + offset + 2, true);
                    action.unk1 = data.getUint8(innerOffset + offset + 4, true);
                    action.unk2 = data.getUint8(innerOffset + offset + 5, true);
                    action.unk3 = data.getUint16(innerOffset + offset + 7, true);
                    action.unk4 = data.getUint8(innerOffset + offset + 8, true);
                    innerOffset += 8;
                    break;
                case ACTIONTYPE.THROW_ALPHA:
                    action.animFrame = data.getUint8(innerOffset + offset + 1, true);
                    action.yHeight = data.getUint16(innerOffset + offset + 2, true);
                    action.spriteIndex = data.getUint8(innerOffset + offset + 4, true);
                    action.unk1 = data.getUint16(innerOffset + offset + 5, true);
                    action.unk2 = data.getUint16(innerOffset + offset + 7, true);
                    action.unk3 = data.getUint16(innerOffset + offset + 9, true);
                    action.unk4 = data.getUint8(innerOffset + offset + 11, true);
                    action.unk5 = data.getUint8(innerOffset + offset + 12, true);
                    innerOffset += 12;
                    break;
                case ACTIONTYPE.SAMPLE_STOP:
                    action.animFrame = data.getUint8(innerOffset + offset + 1, true);
                    action.sampleIndex = data.getUint16(innerOffset + offset + 2, true);
                    innerOffset += 3;
                    break;
                case ACTIONTYPE.LEFT_STEP: // only required animFrame
                case ACTIONTYPE.RIGHT_STEP:
                    action.animFrame = data.getUint8(innerOffset + offset + 1, true);
                    innerOffset += 1;
                    break;
                case ACTIONTYPE.HIT_HERO:
                    action.animFrame = data.getUint8(innerOffset + offset + 1, true);
                    innerOffset += 1;
                    break;
                case ACTIONTYPE.THROW_3D:
                case ACTIONTYPE.THROW_3D_ALPHA:
                    action.animFrame = data.getUint8(innerOffset + offset + 1, true);
                    action.distanceX = data.getUint16(innerOffset + offset + 2, true);
                    action.distanceY = data.getUint16(innerOffset + offset + 4, true);
                    action.distanceZ = data.getUint16(innerOffset + offset + 6, true);
                    action.spriteIndex = data.getUint8(innerOffset + offset + 8, true);
                    action.unk1 = data.getUint16(innerOffset + offset + 7, true);
                    action.unk2 = data.getUint16(innerOffset + offset + 9, true);
                    action.unk3 = data.getUint16(innerOffset + offset + 11, true);
                    action.unk4 = data.getUint8(innerOffset + offset + 11, true);
                    action.strength = data.getUint8(innerOffset + offset + 12, true);
                    innerOffset += 16;
                    break;
                case ACTIONTYPE.THROW_3D_SEARCH:
                    action.animFrame = data.getUint8(innerOffset + offset + 1, true);
                    action.distanceX = data.getUint16(innerOffset + offset + 2, true);
                    action.distanceY = data.getUint16(innerOffset + offset + 4, true);
                    action.distanceZ = data.getUint16(innerOffset + offset + 6, true);
                    action.spriteIndex = data.getUint8(innerOffset + offset + 8, true);
                    action.targetActor = data.getUint8(innerOffset + offset + 9, true);
                    action.unk1 = data.getUint16(innerOffset + offset + 10, true);
                    action.unk2 = data.getUint8(innerOffset + offset + 12, true);
                    innerOffset += 12;
                    break;
                case ACTIONTYPE.THROW_3D_MAGIC:
                    // check for magic ball 11 not 12
                    innerOffset += 11 + 1;
                    break;
                case ACTIONTYPE.THROW_OBJ_3D:
                    innerOffset += 16 + 1;
                    break;
                case ACTIONTYPE.FLOW_3D:
                    innerOffset += 7 + 1;
                    break;
                case ACTIONTYPE.THROW_DART:
                    innerOffset += 8 + 1;
                    break;
                case ACTIONTYPE.SHIELD:
                    innerOffset += 2;
                    break;
                case ACTIONTYPE.SAMPLE_MAGIC:
                    innerOffset += 1;
                    break;
                case ACTIONTYPE.THROW_3D_CONQUE:
                    innerOffset += 7 + 1;
                    break;
                case ACTIONTYPE.IMPACT:
                    innerOffset += 2;
                    break;
                case ACTIONTYPE.RENVOIE:
                    innerOffset += 1;
                    break;
                case ACTIONTYPE.RENVOYABLE:
                    innerOffset += 1;
                    break;
                case ACTIONTYPE.TRANSPARENT:
                    break;
                case ACTIONTYPE.SCALE:
                    innerOffset += 4;
                    break;
                case ACTIONTYPE.LEFT_JUMP:
                    innerOffset += 1;
                    break;
                case ACTIONTYPE.RIGHT_JUMP:
                    innerOffset += 1;
                    break;
                case ACTIONTYPE.IMPACT_3D:
                    innerOffset += 8 + 1;
                    break;
                case ACTIONTYPE.THROW_MAGIC_EXTRA:
                    innerOffset += 8 + 1;
                    break;
                case ACTIONTYPE.THROW_FOUDRE:
                    innerOffset += 1;
                    break;
            }
            innerOffset += 1;
            anim.actions.push(action);
        }
    }
    return anim;
}

export function getBodyIndex(entity: Entity, index: number) {
    if (!entity) {
        return 0;
    }
    for (let i = 0; i < entity.bodies.length; i += 1) {
        if (entity.bodies[i].index === index) {
            return entity.bodies[i].bodyIndex;
        }
    }
    return 0;
}

export function getAnimIndex(entity: Entity, index: number) {
    if (!entity) {
        return 0;
    }
    for (let i = 0; i < entity.anims.length; i += 1) {
        if (entity.anims[i].index === index) {
            return entity.anims[i].animIndex;
        }
    }
    return 0;
}

export function getAnim(entity: Entity, index: number) {
    if (!entity) {
        return null;
    }
    for (let i = 0; i < entity.anims.length; i += 1) {
        if (entity.anims[i].index === index) {
            return entity.anims[i];
        }
    }
    return null;
}

function makeNewBox() {
    return {
        xMin: -1,
        yMin: -1,
        zMin: -1,
        xMax: -1,
        yMax: -1,
        zMax: -1
    };
}
