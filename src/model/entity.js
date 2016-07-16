import _ from 'lodash';

const push = Array.prototype.push;

/** Load models entity data */
export function loadEntity2(buffer) {
    let entities = [];
    const data = new DataView(buffer);
    let offset = data.getUint32(0, true);
    const numEntries = (offset / 4) - 1;
    for (let i = 0; i < numEntries; ++i) {
        const {entity, innerOffset} = loadEntityEntry(buffer, offset, i);
        entities.push(entity);
        offset += innerOffset;
    }
}

function loadEntityEntry(buffer, offset, index) {
    let innerOffset = 0;
    const data = new DataView(buffer, offset);
    let entity = {
        index: index,
        bodies: [],
        anims: []
    }
    let opcode = 0;
    do {
        opcode = data.getUint8(innerOffset);
        innerOffset++;

        switch(opcode) {
            case 1: { // body
                let body = loadEntityBody(data, innerOffset);
                entity.bodies.push(body);
                
                innerOffset += 5;
                if (body.hasCollisionBox) {
                    innerOffset += 13;
                }
            }
            break;
            case 3: { // anim
                let anim = loadEntityAnim(data, innerOffset);
                entity.anims.push(anim);
                innerOffset += 5 + anim.size - 3;
            }
            break;
        }
    } while(opcode != 0xFF);

    return {entity, innerOffset};
}

function loadEntityBody(data, innerOffset) {
    let body = {
        index: 0,
        bodyIndex: 0,
        hasCollisionBox: false,
        box: {}
    }

    body.index = data.getUint8(innerOffset);
    innerOffset++;
    innerOffset++; // skip this unknown byte
    body.bodyIndex = data.getUint16(innerOffset);
    innerOffset += 2;

    const hasCollisionBox = data.getUint8(innerOffset);
    innerOffset++;

    if (hasCollisionBox == 1) {
        body.hasCollisionBox = true;
        let box = {
            bX: 0, bY: 0, bZ: 0,
            tX: 0, tY: 0, tZ: 0
        }
        
        innerOffset++; // skip number bytes to read

        box.bX = data.getUint16(innerOffset);
        innerOffset += 2;
        box.bY = data.getUint16(innerOffset);
        innerOffset += 2;
        box.bZ = data.getUint16(innerOffset);
        innerOffset += 2;
        box.tX = data.getUint16(innerOffset);
        innerOffset += 2;
        box.tY = data.getUint16(innerOffset);
        innerOffset += 2;
        box.tZ = data.getUint16(innerOffset);
        innerOffset += 2;

        body.box = box;
    }
    return body;
}

function loadEntityAnim(data, innerOffset) {
    let anim = {
        index: 0,
        animIndex: 0,
        animSize: 0,
        animType: 0
    }

    anim.index = data.getUint8(innerOffset);
    innerOffset++;
    innerOffset++; // skip this unknown byte (only on LBA2 - LBA1 doesn't have it)
    anim.size = data.getUint8(innerOffset);
    innerOffset++;
    anim.animIndex = data.getUint16(innerOffset);
    innerOffset += 2;

    // TODO anim data
    innerOffset += anim.size - 3;

    return anim;
}
