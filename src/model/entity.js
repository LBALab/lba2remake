import _ from 'lodash';

const push = Array.prototype.push;

const ACTIONTYPE = {
    HITTING           : 0,
	SAMPLE            : 1,
    SAMPLE_FREQ       : 2,
    THROW_EXTRA_BONUS : 3,
	THROW_MAGIC_BALL  : 4,
	SAMPLE_REPEAT     : 5,
	EXTRA_AIMING      : 6,
	EXTRA_THROW       : 7,
	SAMPLE_STOP       : 8,
	UNKNOWN_9         : 9, // unused
	SAMPLE_BRICK_1    : 10,
	SAMPLE_BRICK_2    : 11,
	HERO_HITTING      : 12,
	EXTRA_THROW_2     : 13,
	EXTRA_THROW_3     : 14,
	EXTRA_AIMING_2    : 15,
}

export function loadEntity(buffer) {
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
    }
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
        box: {}
    }

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
        }
        
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
        numActions: 0,
        actions: []
    }

    anim.index = data.getUint8(offset++, true);
    anim.offset = data.getUint8(offset++, true);
    if (anim.offset > 0) {
        anim.offset += 1; // to add the previous byte
    }
    if (anim.offset == 0) {
        anim.offset += 5;
    }
    anim.numActions = data.getUint8(offset++, true);
    if (anim.numActions > 0) {
        anim.offset += anim.numActions - 3;
    }
    anim.animIndex = data.getUint16(offset, true);
    offset += 2;

    for (let i = 0; i < anim.numActions; ++i) {
        let action = {
            type: data.getUint8(offset, true),
            animFrame: data.getUint8(offset + 1, true)
        }
        switch(action.type - 5) {
            case ACTIONTYPE.HITTING: 
                action.strength = data.getUint8(offset + 2, true);
            break;
            case ACTIONTYPE.SAMPLE: 
                action.sampleId = data.getUint16(offset + 2, true);
            break;
            case ACTIONTYPE.SAMPLE_FREQ: 
                action.sampleId = data.getUint16(offset + 2, true);
                action.frequency = data.getUint8(offset + 4, true);
            break;
            case ACTIONTYPE.THROW_EXTRA_BONUS: 
                action.yHeight = data.getUint16(offset + 2, true);
                action.spriteId = data.getUint8(offset + 4, true);
                action.unk1 = data.getUint16(offset + 5, true);
                action.unk2 = data.getUint16(offset + 7, true);
                action.unk3 = data.getUint16(offset + 9, true);
                action.unk4 = data.getUint8(offset + 11, true);
                action.unk5 = data.getUint8(offset + 12, true);
            break;
            case ACTIONTYPE.THROW_MAGIC_BALL: 
                action.unk1 = data.getUint16(offset + 2, true);
                action.unk2 = data.getUint16(offset + 4, true);
                action.unk3 = data.getUint16(offset + 6, true);
                action.unk4 = data.getUint8(offset + 8, true);
            break;
            case ACTIONTYPE.SAMPLE_REPEAT: 
                action.sampleId = data.getUint16(offset + 2, true);
                action.repeat = data.getUint16(offset + 4, true);
            break;
            case ACTIONTYPE.EXTRA_AIMING: 
                action.yHeight = data.getUint16(offset + 2, true);
                action.unk1 = data.getUint8(offset + 4, true);
                action.unk2 = data.getUint8(offset + 5, true);
                action.unk3 = data.getUint16(offset + 7, true);
                action.unk4 = data.getUint8(offset + 8, true);
            break;
            case ACTIONTYPE.EXTRA_THROW: 
                action.yHeight = data.getUint16(offset + 2, true);
                action.spriteId = data.getUint8(offset + 4, true);
                action.unk1 = data.getUint16(offset + 5, true);
                action.unk2 = data.getUint16(offset + 7, true);
                action.unk3 = data.getUint16(offset + 9, true);
                action.unk4 = data.getUint8(offset + 11, true);
                action.unk5 = data.getUint8(offset + 12, true);
            break;
            case ACTIONTYPE.SAMPLE_STOP: 
                action.sampleId = data.getUint16(offset + 2, true);
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
                action.distanceX = data.getUint16(offset + 2, true);
                action.distanceY = data.getUint16(offset + 4, true);
                action.distanceZ = data.getUint16(offset + 6, true);
                action.spriteId = data.getUint8(offset + 8, true);
                action.unk1 = data.getUint16(offset + 7, true);
                action.unk2 = data.getUint16(offset + 9, true);
                action.unk3 = data.getUint16(offset + 11, true);
                action.unk4 = data.getUint8(offset + 11, true);
                action.strength = data.getUint8(offset + 12, true);
            break;
            case ACTIONTYPE.EXTRA_THROW_3: 
                action.distanceX = data.getUint16(offset + 2, true);
                action.distanceY = data.getUint16(offset + 4, true);
                action.distanceZ = data.getUint16(offset + 6, true);
                action.spriteId = data.getUint8(offset + 8, true);
                action.unk1 = data.getUint16(offset + 9, true);
                action.unk2 = data.getUint16(offset + 11, true);
                action.unk3 = data.getUint16(offset + 13, true);
                action.unk4 = data.getUint8(offset + 14, true);
                action.strength = data.getUint8(offset + 15, true);
            break;
            case ACTIONTYPE.EXTRA_AIMING_2: 
                action.distanceX = data.getUint16(offset + 2, true);
                action.distanceY = data.getUint16(offset + 4, true);
                action.distanceZ = data.getUint16(offset + 6, true);
                action.spriteId = data.getUint8(offset + 8, true);
                action.targetActor = data.getUint8(offset + 9, true);
                action.unk1 = data.getUint16(offset + 10, true);
                action.unk2 = data.getUint8(offset + 12, true);
            break;
        }
        anim.actions.push(action);
    }

    return anim;
}

export function getBodyIndex(entity, index) {
    for (let i = 0; i < entity.bodies.length; ++i) {
        if (entity.bodies[i].index == index) {
            return entity.bodies[i].bodyIndex;
        }
    }
    return 0;
}

export function getAnimIndex(entity, index) {
    for (let i = 0; i < entity.anims.length; ++i) {
        if (entity.anims[i].index == index) {
            return entity.anims[i].animIndex;
        }
    }
    return 0;
}
