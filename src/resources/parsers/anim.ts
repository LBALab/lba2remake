import * as THREE from 'three';

import { WORLD_SCALE, lbaToDegrees } from '../../utils/lba';
import { Resource } from '../load';
import { Anim, KeyFrame, BoneFrame, BoneframeCanFall } from '../../model/anim/types';

export const parseAnim = (resource: Resource, index: number) => {
    const buffer = resource.getEntry(index);
    const data = new DataView(buffer);
    const obj : Anim = {
        index,
        numKeyframes: data.getUint16(0x00, true),
        numBoneframes: data.getUint16(0x02, true),
        loopFrame: data.getUint16(0x04, true),
        unk1: data.getUint16(0x08, true),
        keyframes: [],
        buffer
    };

    loadKeyframes(obj, resource.type === 'LA1');

    return obj;
};

const loadKeyframes = (anim, isLBA1: boolean) => {
    const data = new DataView(anim.buffer, 0, anim.buffer.byteLength);
    let offset = 8;
    for (let i = 0; i < anim.numKeyframes; i += 1) {
        const keyframe : KeyFrame = {
            duration: data.getUint16(offset, true) * (isLBA1 ? 20 : 1),
            step: new THREE.Vector3(
                data.getInt16(offset + 2, true) * WORLD_SCALE,
                data.getInt16(offset + 4, true) * WORLD_SCALE,
                data.getInt16(offset + 6, true) * WORLD_SCALE
            ),
            canFall: false,
            boneframes: []
        };
        offset += 8;

        for (let j = 0; j < anim.numBoneframes; j += 1) {
            const {boneframe, canFall} : BoneframeCanFall = loadBoneframe(data, offset);
            keyframe.canFall = keyframe.canFall || canFall;
            offset += 8;
            keyframe.boneframes.push(boneframe);
        }

        anim.keyframes.push(keyframe);
    }
};

const loadBoneframe = (data, offset) : BoneframeCanFall => {
    const boneframe : BoneFrame = {
        type: data.getUint16(offset, true), // if > 0 canFall because it has translation in space
        quat: null,
        pos: null
    };
    let canFall = false;

    const x = data.getInt16(offset + 2, true);
    const y = data.getInt16(offset + 4, true);
    const z = data.getInt16(offset + 6, true);

    // assigned based on type of bone animation (rotation or translation)
    if (boneframe.type === 0) { // rotation
        boneframe.pos = new THREE.Vector3(0, 0, 0);
        const euler = new THREE.Euler(
            THREE.MathUtils.degToRad(lbaToDegrees(x)),
            THREE.MathUtils.degToRad(lbaToDegrees(y)),
            THREE.MathUtils.degToRad(lbaToDegrees(z)),
            'XZY'
        );
        boneframe.quat = new THREE.Quaternion().setFromEuler(euler).normalize();
    } else { // translation
        boneframe.quat = new THREE.Quaternion();
        boneframe.pos = new THREE.Vector3(
            x * WORLD_SCALE,
            y * WORLD_SCALE,
            z * WORLD_SCALE
        );
        canFall = true;
    }
    return { boneframe, canFall };
};
