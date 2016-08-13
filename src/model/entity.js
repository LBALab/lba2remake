import _ from 'lodash';

const push = Array.prototype.push;

const ACTIONTYPE = {
    ACTION_HITTING           : 0,
	ACTION_SAMPLE            : 1,
    ACTION_SAMPLE_FREQ       : 2,
    ACTION_THROW_EXTRA_BONUS : 3,
	ACTION_THROW_MAGIC_BALL  : 4,
	ACTION_SAMPLE_REPEAT     : 5,
	ACTION_UNKNOWN_6         : 6,
	ACTION_UNKNOWN_7         : 7,
	ACTION_SAMPLE_STOP       : 8,
	ACTION_UNKNOWN_9         : 9, // unused
	ACTION_SAMPLE_BRICK_1    : 10,
	ACTION_SAMPLE_BRICK_2    : 11,
	ACTION_HERO_HITTING      : 12,
	ACTION_UNKNOWN_13        : 13,
	ACTION_UNKNOWN_14        : 14,
	ACTION_UNKNOWN_15        : 15,
}

export function loadEntity(buffer) {
    let entities = [];
    const data = new DataView(buffer);
    const offset = data.getUint32(0, true);
    const numEntries = (offset / 4) - 1;
    let offsets = [];
    for (let i = 0; i < numEntries; ++i) {
        const entry = {
            offset : data.getUint32(i * 4, true),
            size: data.getUint32((i + 1) * 4, true) - data.getUint32(i * 4, true)
        }
        if (i == numEntries - 1) {
            entry.size = buffer.length - entry.offset;
        }
        offsets.push(entry);
    }
    for (let i = 0; i < numEntries; ++i) {
        const entity = loadEntityEntry(buffer, offsets[i].offset, i);
        entities.push(entity);
    }
    return entities;
}

function loadEntityEntry(buffer, offset, index) {
    const data = new DataView(buffer, offset);
    offset = 0;
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

    body.index = data.getUint8(offset++);
    body.offset = data.getUint8(offset++) + 1; // to add the previous byte
    body.bodyIndex = data.getUint16(offset);
    offset += 2;

    const hasCollisionBox = data.getUint8(offset++);

    if (hasCollisionBox == 1) {
        body.hasCollisionBox = true;
        let box = {
            bX: 0, bY: 0, bZ: 0,
            tX: 0, tY: 0, tZ: 0
        }
        
        const innerOffset = data.getUint8(offset++);

        box.bX = data.getUint16(offset);
        box.bY = data.getUint16(offset + 2);
        box.bZ = data.getUint16(offset + 4);
        box.tX = data.getUint16(offset + 6);
        box.tY = data.getUint16(offset + 8);
        box.tZ = data.getUint16(offset + 10);

        body.box = box;
        offset += innerOffset;
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

    anim.index = data.getUint8(offset++);
    anim.offset = data.getUint8(offset++) + 1; // to add the previous byte
    anim.animIndex = data.getUint16(offset);
    offset += 2;
    anim.numActions = data.getUint8(offset++);

    /*for (let i = 0; i < numActions; ++i) {
        let action = {
            type: data.getUint8(offset++);
        }
        switch(type - 5) {
            case ACTION_HITTING: 
            break;
            case ACTION_SAMPLE: 
            break;
            case ACTION_SAMPLE_FREQ: 
            break;
            case ACTION_THROW_EXTRA_BONUS: 
            break;
            case ACTION_THROW_MAGIC_BALL: 
            break;
            case ACTION_SAMPLE_REPEAT: 
            break;
            case ACTION_UNKNOWN_6: 
            break;
            case ACTION_UNKNOWN_7: 
            break;
            case ACTION_SAMPLE_STOP: 
            break;
            case ACTION_UNKNOWN_9: 
            break;
            case ACTION_SAMPLE_BRICK_1: 
            break;
            case ACTION_SAMPLE_BRICK_2: 
            break;
            case ACTION_HERO_HITTING: 
            break;
            case ACTION_UNKNOWN_13: 
            break;
            case ACTION_UNKNOWN_14: 
            break;
            case ACTION_UNKNOWN_15: 
            break;
        }
    }*/

    return anim;
}
