import * as THREE from 'three';

import { Bone, BoneType, BoneBindings, BoneFrame } from './types';

export default class Skeleton {
    private bones: Bone[] = [];

    get rootBone(): Bone {
        return this.bones[0];
    }

    static fromBody(body): Skeleton {
        const skeleton = new Skeleton(body.bonesSize);
        for (let i = 0; i < body.bonesSize; i += 1) {
            const bdBone = body.bones[i];
            const skBone = skeleton.bones[i];
            skBone.vertex.copy(body.vertices[bdBone.vertex]);
            skBone.parent = bdBone.parent;
        }

        for (const bone of skeleton.bones) {
            if (bone.parent === 0xFFFF) {
                continue;
            }
            const parent = skeleton.bones[bone.parent];
            parent.children.push(bone.boneIndex);
        }

        skeleton.updateHierarchy();
        return skeleton;
    }

    static makeEmpty(): Skeleton {
        return new Skeleton(30);
    }

    copy(other: Skeleton) {
        const numBones = Math.min(this.bones.length, other.bones.length);
        for (let i = 0; i < numBones; i += 1) {
            const bone = this.bones[i];
            const srcBone = other.bones[i];
            bone.quat.copy(srcBone.quat);
            bone.pos.copy(srcBone.pos);
        }
    }

    private constructor(numBones) {
        for (let i = 0; i < numBones; i += 1) {
            this.bones.push({
                boneIndex: i,
                parent: 0xFFFF,
                vertex: new THREE.Vector3(),
                pos: new THREE.Vector3(),
                p: new THREE.Vector3(),
                r: new THREE.Vector4(),
                m: new THREE.Matrix4(),
                type: BoneType.TRANSLATION,
                quat: new THREE.Quaternion(),
                children: []
            });
        }
    }

    createBindings(): BoneBindings {
        const position: THREE.Vector3[] = [];
        const rotation: THREE.Vector4[] = [];
        const matrix: THREE.Matrix4[] = [];
        for (let i = 0; i < this.bones.length; i += 1) {
            position.push(this.bones[i].p);
            rotation.push(this.bones[i].r);
            matrix.push(this.bones[i].m);
        }
        for (let i = 0; i < 30 - this.bones.length; i += 1) {
            position.push(new THREE.Vector3(0, 0, 0));
            rotation.push(new THREE.Vector4(0, 0, 0, 0));
            matrix.push(new THREE.Matrix4());
        }
        return { position, rotation, matrix };
    }

    lerpKeyFrames(a: BoneFrame[], b: BoneFrame[], alpha: number) {
        const numBones = Math.min(Math.min(a.length, b.length), this.bones.length);
        for (let i = 0; i < numBones; i += 1) {
            const bone = this.bones[i];
            const boneA = a[i];
            const boneB = b[i];
            bone.type = boneA.type;
            switch (boneA.type) {
                case BoneType.ROTATION:
                    bone.quat.slerpQuaternions(boneA.quat, boneB.quat, alpha);
                    break;
                case BoneType.TRANSLATION:
                    bone.pos.lerpVectors(boneA.pos, boneB.pos, alpha);
                    break;
            }
        }
    }

    lerpSkeletonAndKeyFrame(sk: Skeleton, bfs: BoneFrame[], alpha: number) {
        const numBones = Math.min(Math.min(sk.bones.length, bfs.length), this.bones.length);
        for (let i = 0; i < numBones; i += 1) {
            const bone = this.bones[i];
            const boneSk = sk.bones[i];
            const boneBf = bfs[i];
            bone.type = boneBf.type;
            switch (boneBf.type) {
                case BoneType.ROTATION:
                    bone.quat.slerpQuaternions(boneSk.quat, boneBf.quat, alpha);
                    break;
                case BoneType.TRANSLATION:
                    bone.pos.lerpVectors(boneSk.pos, boneBf.pos, alpha);
                    break;
            }
        }
    }

    lerpSkeletons(a: Skeleton, b: Skeleton, alpha: number) {
        for (let i = 0; i < this.bones.length; i += 1) {
            const bone = this.bones[i];
            const boneA = a.bones[i];
            const boneB = b.bones[i];
            bone.quat.slerpQuaternions(boneA.quat, boneB.quat, alpha);
            bone.pos.lerpVectors(boneA.pos, boneB.pos, alpha);
        }
    }

    updateHierarchy() {
        this.updateBone(0);
    }

    private updateBone(index: number) {
        const bone = this.bones[index];
        const parent = bone.parent !== 0xFFFF
            ? this.bones[bone.parent]
            : null;
        bone.m.identity();
        if (parent) {
            TMP_POS.copy(bone.vertex);

            switch (bone.type) {
                case BoneType.ROTATION:
                    bone.m.makeRotationFromQuaternion(bone.quat);
                    break;
                case BoneType.TRANSLATION:
                    TMP_POS.x += bone.pos.x;
                    TMP_POS.y += bone.pos.y;
                    TMP_POS.z += bone.pos.z;
                    break;
            }

            bone.m.setPosition(TMP_POS);

            TMP_M.copy(parent.m);
            TMP_M.multiply(bone.m);
            bone.m.copy(TMP_M);
            TMP_Q.setFromRotationMatrix(bone.m);
            TMP_Q.normalize();
            bone.p.setFromMatrixPosition(bone.m);
            bone.r.set(TMP_Q.x, TMP_Q.y, TMP_Q.z, TMP_Q.w);
        }
        for (const child of bone.children) {
            this.updateBone(child);
        }
    }
}

const TMP_M = new THREE.Matrix4();
const TMP_Q = new THREE.Quaternion();
const TMP_POS = new THREE.Vector3();
