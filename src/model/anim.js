import THREE from 'three';
import _ from 'lodash';

const push = Array.prototype.push;

/** Load LBA2 model animation */
export function loadAnim(model, body, anims, index) {
    if (anims[index]) {
        return anims[index];
    } else {
        const buffer = model.files.anim.getEntry(index);
        const data = new DataView(buffer);
        const obj = {
            numKeyframes: data.getUint16(0x00, true),
            numBones: data.getUint16(0x02, true),
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
    
}

/** Load bones at keyframe */
function loadBoneframes(object) {
    
}
