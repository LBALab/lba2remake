// @flow

type Action = {
    type: number,
    animFrame: number,
    sampleId: number,
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
    spriteId: number,
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
    bX: number,
    bY: number,
    bZ: number,
    tX: number,
    tY: number,
    tZ: number
}

type Body = {
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

const ACTIONTYPE = {
    NONE              : 0,
    UNKNOWN_1         : 1,
    UNKNOWN_2         : 2,
    UNKNOWN_3         : 3,
    UNKNOWN_4         : 4,
    HITTING           : 5,
	SAMPLE            : 6,
    SAMPLE_FREQ       : 7,
    THROW_EXTRA_BONUS : 8,
	THROW_MAGIC_BALL  : 9,
	SAMPLE_REPEAT     : 10,
	EXTRA_AIMING      : 11,
	EXTRA_THROW       : 12,
	SAMPLE_STOP       : 13,
	UNKNOWN_14        : 14, // unused
	SAMPLE_BRICK_1    : 15,
	SAMPLE_BRICK_2    : 16,
	HERO_HITTING      : 17,
	EXTRA_THROW_2     : 18,
	EXTRA_THROW_3     : 19,
	EXTRA_AIMING_2    : 20,
    UNKNOWN_29        : 29,
    UNKNOWN_39        : 39
};

export function loadEntity(buffer: ArrayBuffer) {
    let entities = [];
    const data = new DataView(buffer);
    const offset = data.getUint32(0, true);
    const numEntries = (offset / 4) - 1;
    let offsets = [];
    for (let i = 0; i < numEntries; ++i) {
        offsets.push(data.getUint32(i * 4, true));
    }
    for (let i = 0; i < numEntries; ++i) {
        const entity = loadEntityEntry(buffer, offsets[i], i);
        entities.push(entity);
    }
    return entities;
}

function loadEntityEntry(buffer, dataOffset, index) {
    const data = new DataView(buffer, dataOffset);
    let offset = 0;
    let entity = {
        index: index,
        bodies: [],
        anims: []
    };
    let opcode = 0;
    do {
        opcode = data.getUint8(offset++);

        switch(opcode) {
            case 1: { // body
                let body = loadEntityBody(data, offset);
                entity.bodies.push(body);
                offset += body.offset;
            }
            break;
            case 3: { // anim
                let anim = loadEntityAnim(data, offset);
                entity.anims.push(anim);
                offset += anim.offset;
            }
            break;
        }
    } while(opcode != 0xFF);

    return entity;
}

function loadEntityBody(data, offset) {
    let body = {
        index: 0,
        offset: 0,
        bodyIndex: 0,
        hasCollisionBox: false,
        box: makeNewBox()
    };

    body.index = data.getUint8(offset++, true);
    body.offset = data.getUint8(offset++, true);
    if (body.offset > 0) {
        body.offset += 1; // to add the previous byte
    }
    body.bodyIndex = data.getUint16(offset, true);
    offset += 2;

    const hasCollisionBox = data.getUint8(offset++, true);

    if (hasCollisionBox == 1) {
        body.hasCollisionBox = true;
        let box = {
            bX: 0, bY: 0, bZ: 0,
            tX: 0, tY: 0, tZ: 0
        };
        
        const innerOffset = data.getUint8(offset++, true);

        box.bX = data.getUint16(offset);
        box.bY = data.getUint16(offset + 2);
        box.bZ = data.getUint16(offset + 4);
        box.tX = data.getUint16(offset + 6);
        box.tY = data.getUint16(offset + 8);
        box.tZ = data.getUint16(offset + 10);

        body.box = box;
    }
    return body;
}

function loadEntityAnim(data, offset) {
    let anim = {
        index: 0,
        offset: 0,
        animIndex: 0,
        actions: []
    };

    anim.index = data.getUint8(offset++, true);
    anim.offset = data.getUint8(offset++, true);
    if (anim.offset > 0) {
        anim.offset += 1; // to add the previous byte
    }
    if (anim.offset == 0) {
        anim.offset += 5;
    }
    const actionBytes = data.getUint8(offset++, true);
    anim.animIndex = data.getUint16(offset, true);
    offset += 2;

    if (actionBytes > 0) {
        anim.offset += actionBytes - 3;

        let innerOffset = 0;
        let prevInnerOffset = 0;

        const numActions = data.getUint8(innerOffset + offset, true);
        ++innerOffset;

        for (let i = 0; i < numActions; ++i) {
            let action = {
                type: data.getUint8(innerOffset + offset, true),
                animFrame: data.getUint8(innerOffset + offset + 1, true),
                sampleId: -1,
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
                spriteId: -1,
                repeat: -1,
                targetActor: -1
            };
            switch(action.type) {
                case ACTIONTYPE.HITTING:
                    action.strength = data.getUint8(innerOffset + offset + 2, true); 
                    ++innerOffset;
                break;
                case ACTIONTYPE.SAMPLE: 
                    action.sampleId = data.getUint16(innerOffset + offset + 2, true);
                    innerOffset += 2;
                break;
                case ACTIONTYPE.SAMPLE_FREQ: 
                    action.sampleId = data.getUint16(innerOffset + offset + 2, true);
                    action.frequency = data.getUint16(innerOffset + offset + 4, true);
                    innerOffset += 4;
                break;
                case ACTIONTYPE.THROW_EXTRA_BONUS: 
                    action.yHeight = data.getUint16(innerOffset + offset + 2, true);
                    action.spriteId = data.getUint8(innerOffset + offset + 4, true);
                    action.unk1 = data.getUint16(innerOffset + offset + 5, true);
                    action.unk2 = data.getUint16(innerOffset + offset + 7, true);
                    action.unk3 = data.getUint16(innerOffset + offset + 9, true);
                    action.unk4 = data.getUint8(innerOffset + offset + 11, true);
                    action.unk5 = data.getUint8(innerOffset + offset + 12, true);
                    innerOffset += 11;
                break;
                case ACTIONTYPE.THROW_MAGIC_BALL: 
                    action.unk1 = data.getUint16(innerOffset + offset + 2, true);
                    action.unk2 = data.getUint16(innerOffset + offset + 4, true);
                    action.unk3 = data.getUint16(innerOffset + offset + 6, true);
                    action.unk4 = data.getUint8(innerOffset + offset + 8, true);
                    innerOffset += 7;
                break;
                case ACTIONTYPE.SAMPLE_REPEAT: 
                    action.sampleId = data.getUint16(innerOffset + offset + 2, true);
                    action.repeat = data.getUint16(innerOffset + offset + 4, true);
                    innerOffset += 4;
                break;
                case ACTIONTYPE.EXTRA_AIMING: 
                    action.yHeight = data.getUint16(innerOffset + offset + 2, true);
                    action.unk1 = data.getUint8(innerOffset + offset + 4, true);
                    action.unk2 = data.getUint8(innerOffset + offset + 5, true);
                    action.unk3 = data.getUint16(innerOffset + offset + 7, true);
                    action.unk4 = data.getUint8(innerOffset + offset + 8, true);
                    innerOffset += 5;
                break;
                case ACTIONTYPE.EXTRA_THROW: 
                    action.yHeight = data.getUint16(innerOffset + offset + 2, true);
                    action.spriteId = data.getUint8(innerOffset + offset + 4, true);
                    action.unk1 = data.getUint16(innerOffset + offset + 5, true);
                    action.unk2 = data.getUint16(innerOffset + offset + 7, true);
                    action.unk3 = data.getUint16(innerOffset + offset + 9, true);
                    action.unk4 = data.getUint8(innerOffset + offset + 11, true);
                    action.unk5 = data.getUint8(innerOffset + offset + 12, true);
                    innerOffset += 11;
                break;
                case ACTIONTYPE.SAMPLE_STOP: 
                    action.sampleId = data.getUint16(innerOffset + offset + 2, true);
                    innerOffset += 2;
                break;
                //case ACTIONTYPE.UNKNOWN_9: // unused
                //break;
                case ACTIONTYPE.SAMPLE_BRICK_1: // only required animFrame
                case ACTIONTYPE.SAMPLE_BRICK_2: 
                break;
                case ACTIONTYPE.HERO_HITTING: 
                    action.animFrame -= 1;
                break;
                case ACTIONTYPE.EXTRA_THROW_2: 
                    action.distanceX = data.getUint16(innerOffset + offset + 2, true);
                    action.distanceY = data.getUint16(innerOffset + offset + 4, true);
                    action.distanceZ = data.getUint16(innerOffset + offset + 6, true);
                    action.spriteId = data.getUint8(innerOffset + offset + 8, true);
                    action.unk1 = data.getUint16(innerOffset + offset + 7, true);
                    action.unk2 = data.getUint16(innerOffset + offset + 9, true);
                    action.unk3 = data.getUint16(innerOffset + offset + 11, true);
                    action.unk4 = data.getUint8(innerOffset + offset + 11, true);
                    action.strength = data.getUint8(innerOffset + offset + 12, true);
                    innerOffset += 15;
                break;
                case ACTIONTYPE.EXTRA_THROW_3: 
                    action.distanceX = data.getUint16(innerOffset + offset + 2, true);
                    action.distanceY = data.getUint16(innerOffset + offset + 4, true);
                    action.distanceZ = data.getUint16(innerOffset + offset + 6, true);
                    action.spriteId = data.getUint8(innerOffset + offset + 8, true);
                    action.unk1 = data.getUint16(innerOffset + offset + 9, true);
                    action.unk2 = data.getUint16(innerOffset + offset + 11, true);
                    action.unk3 = data.getUint16(innerOffset + offset + 13, true);
                    action.unk4 = data.getUint8(innerOffset + offset + 14, true);
                    action.strength = data.getUint8(innerOffset + offset + 15, true);
                    innerOffset += 15;
                break;
                case ACTIONTYPE.EXTRA_AIMING_2: 
                    action.distanceX = data.getUint16(innerOffset + offset + 2, true);
                    action.distanceY = data.getUint16(innerOffset + offset + 4, true);
                    action.distanceZ = data.getUint16(innerOffset + offset + 6, true);
                    action.spriteId = data.getUint8(innerOffset + offset + 8, true);
                    action.targetActor = data.getUint8(innerOffset + offset + 9, true);
                    action.unk1 = data.getUint16(innerOffset + offset + 10, true);
                    action.unk2 = data.getUint8(innerOffset + offset + 12, true);
                    innerOffset += 11;
                break;
                case ACTIONTYPE.UNKNOWN_29: // sound perhaps
                    innerOffset += 3;
                break;
                case ACTIONTYPE.UNKNOWN_39: // sound perhaps
                    innerOffset += 7;
                break;
            }
            innerOffset += 2;
            anim.actions.push(action);
            prevInnerOffset = innerOffset;
        }
    }
    return anim;
}

export function getBodyIndex(entity: Entity, index: number) {
    if (!entity) {
        return 0;
    }
    for (let i = 0; i < entity.bodies.length; ++i) {
        if (entity.bodies[i].index == index) {
            return entity.bodies[i].bodyIndex;
        }
    }
    return 0;
}

export function getAnimIndex(entity: Entity, index: number) {
    if (!entity) {
        return 0;
    }
    for (let i = 0; i < entity.anims.length; ++i) {
        if (entity.anims[i].index == index) {
            return entity.anims[i].animIndex;
        }
    }
    return 0;
}

function makeNewBox() {
    return {
        bX: -1,
        bY: -1,
        bZ: -1,
        tX: -1,
        tY: -1,
        tZ: -1
    }
}