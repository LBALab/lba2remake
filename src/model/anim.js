import THREE from 'three';
import _ from 'lodash';

const push = Array.prototype.push;

/** Load LBA2 model animation */
export function loadAnim(model, anims, index) {
    if (anims[index]) {
        return anims[index];
    } else {
        const buffer = model.files.anim.getEntry(index);
        const data = new DataView(buffer);
        const obj = {
            numKeyframes: data.getUint16(0x00, true),
            numBoneframes: data.getUint16(0x02, true),
            startFrame: data.getUint16(0x04, true),
            unk1: data.getUint16(0x08, true),
            
            buffer: buffer
        };

        loadKeyframes(obj);
        
        anims[index] = obj;
        return obj;
    }
}

/** Load anim key frames */
function loadKeyframes(object) {
    object.keyframes = [];
    const data = new DataView(object.buffer, 0, object.buffer.length);
    let offset = 0;
    for (let i = 0; i < object.numKeyframes; ++i) {
        let keyframe = {
            length: data.getUint16(offset, true),
            x: data.getUint16(offset + 2, true),
            y: data.getUint16(offset + 4, true),
            z: data.getUint16(offset + 6, true),
            canFall: false,
            boneframes: []
        };
        offset += 8;

        for (let j = 0; j < object.numBoneframes; ++j) {
            const {boneframe, canFall} = loadBoneframe(keyframe, data, offset);
            keyframe.canFall |= canFall;
            offset += 8;
            keyframe.boneframes.push(boneframe);
        }

        object.keyframes.push(keyframe);
    }
}

/** Load bone at keyframe */
function loadBoneframe(keyframe, data, offset) {
    let boneframe = {
        type: data.getUint16(offset, true), // if > 0 canFall because it has translation in space
        /*x: 0,
        y: 0,
        z: 0,
        angleX: 0,
        angleY: 0,
        angleZ: 0,*/
        euler: null,
        pos: null
    };
    let canFall = false;

    const x = data.getUint16(offset + 2, true);
    const y = data.getUint16(offset + 4, true);
    const z = data.getUint16(offset + 6, true);

    // assigned based on type of bone animation (rotation or translation)
    switch (boneframe.type) {
        case 0: // rotation
            /*boneframe.angleX = x * (360 / 0x1000);
            boneframe.angleY = y * (360 / 0x1000);
            boneframe.angleZ = z * (360 / 0x1000);*/
            boneframe.euler = new THREE.Euler(x / 0x1000,
                                              y / 0x1000,
                                              z / 0x1000, 
                                              'XZY' ); 
            boneframe.pos = new THREE.Vector3(0, 0, 0);
            boneframe.veuler = new THREE.Vector3(x / 0x1000,
                                                 y / 0x1000,
                                                 z / 0x1000);
            break;
        case 1:
        case 2: // translation
            /*boneframe.x = x / 0x4000;
            boneframe.y = y / 0x4000;
            boneframe.z = z / 0x4000;*/
            boneframe.euler = new THREE.Euler(0,0,0,'XZY');
            boneframe.veuler = new THREE.Vector3(0, 0, 0);
            boneframe.pos = new THREE.Vector3(x / 0x4000, y / 0x4000, z / 0x4000);
            canFall = true;
            break;
        default:
            boneframe.euler = new THREE.Euler(0,0,0,'XZY');
            boneframe.veuler = new THREE.Vector3(0, 0, 0);
            boneframe.pos = new THREE.Vector3(0, 0, 0);
            break;
    }
    return { boneframe, canFall };
}
