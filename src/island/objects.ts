import * as THREE from 'three';
import {each} from 'lodash';
import {bits} from '../utils';
import {WORLD_SCALE, WORLD_SIZE} from '../utils/lba';

const push = Array.prototype.push;

// Offset amount per island to offset any transparent objects to be closer to
// the object they're supposed to be attached to. This offset is unfortunately
// not consistent between islands, although appears to be consistent within a
// given island.
const TransparentObjectOffset = {
    CITADEL: 0.05,
};

export function loadObjects(section, geometries, models, atlas, island) {
    const numObjects = section.objInfo.numObjects;
    const boundingBoxes = [];
    for (let i = 0; i < numObjects; i += 1) {
        const info = loadObjectInfo(section.objects, section, i);
        const model = models[info.index];
        loadFaces(geometries, model, info, boundingBoxes, atlas, island);
    }
    section.boundingBoxes = boundingBoxes;
}

function loadObjectInfo(objects, section, index) {
    const offset = index * 48;
    const ox = objects.getInt32(offset + 12, true);
    const oy = objects.getInt32(offset + 8, true);
    const oz = objects.getInt32(offset + 4, true);
    const angle = objects.getUint8(offset + 21) >> 2;
    return {
        index: objects.getUint32(offset, true),
        x: (((0x8000 - ox) + 512) * WORLD_SCALE) + (section.x * WORLD_SIZE * 2),
        y: oy * WORLD_SCALE,
        z: (oz * WORLD_SCALE) + (section.z * WORLD_SIZE * 2),
        angle,
        iv: 1
    };
}

function loadFaces(geometries, model, info, boundingBoxes, atlas, island) {
    const data = new DataView(
        model.buffer,
        model.faceSectionOffset,
        model.lineSectionOffset - model.faceSectionOffset
    );
    let offset = 0;
    while (offset < data.byteLength) {
        const section = parseSectionHeader(data, model, offset);
        loadSection(geometries, model, info, section, boundingBoxes, atlas, island);
        offset += section.size + 8;
    }
}

function parseSectionHeader(data, object, offset) {
    const type = data.getUint8(offset);
    const flags = data.getUint8(offset + 1);
    const numFaces = data.getUint16(offset + 2, true);
    const size = data.getUint16(offset + 4, true) - 8;
    return {
        type,
        numFaces,
        pointsPerFace: (flags & 0x80) ? 4 : 3,
        blockSize: size / numFaces,
        size,
        isTransparent: bits(type, 2, 1) === 1,
        data: new DataView(object.buffer, object.faceSectionOffset + offset + 8, size)
    };
}

function loadSection(geometries, object, info, section, boundingBoxes, atlas, island) {
    const bb = new THREE.Box3();
    for (let i = 0; i < section.numFaces; i += 1) {
        const uvGroup = getUVGroup(object, section, i, atlas);
        const faceNormal = getFaceNormal(object, section, info, i);
        const normalVec = new THREE.Vector3(
            faceNormal[0],
            faceNormal[1],
            faceNormal[2]
        ).normalize();
        const addVertex = (j) => {
            const index = section.data.getUint16((i * section.blockSize) + (j * 2), true);
            const x = object.vertices[index * 4];
            const y = object.vertices[(index * 4) + 1];
            const z = object.vertices[(index * 4) + 2];

            bb.min.x = Math.min(x, bb.min.x);
            bb.min.y = Math.min(y, bb.min.y);
            bb.min.z = Math.min(z, bb.min.z);

            bb.max.x = Math.max(x, bb.max.x);
            bb.max.y = Math.max(y, bb.max.y);
            bb.max.z = Math.max(z, bb.max.z);
            if (section.blockSize === 12 || section.blockSize === 16) {
                push.apply(geometries.objects_colored.positions, getPosition(object, info, index));
                push.apply(
                    geometries.objects_colored.normals,
                    section.type === 1 ? faceNormal : getVertexNormal(object, info, index)
                );
                geometries.objects_colored.colors.push(getColor(section, i));
            } else {
                const pos = getPosition(object, info, index);
                if (section.isTransparent && TransparentObjectOffset[island.name]) {                    
                    pos[0] -= TransparentObjectOffset[island.name] * normalVec.x;
                    pos[1] -= TransparentObjectOffset[island.name] * normalVec.y;
                    pos[2] -= TransparentObjectOffset[island.name] * normalVec.z;
                }
                const group = section.isTransparent
                    ? 'objects_textured_transparent'
                    : 'objects_textured';
                push.apply(geometries[group].positions, pos);
                push.apply(
                    geometries[group].normals,
                    section.type !== 10 ? faceNormal : getVertexNormal(object, info, index)
                );
                push.apply(geometries[group].uvs, getUVs(section, i, j));
                push.apply(geometries[group].uvGroups, uvGroup);
            }
        };
        for (let j = 0; j < 3; j += 1) {
            addVertex(j);
        }
        if (section.pointsPerFace === 4) {
            each([0, 2, 3], (j) => {
                addVertex(j);
            });
        }
    }
    bb.min.multiplyScalar(WORLD_SCALE);
    bb.max.multiplyScalar(WORLD_SCALE);
    bb.applyMatrix4(angleMatrix[(info.angle + 3) % 4]);
    bb.translate(new THREE.Vector3(info.x, info.y, info.z));
    boundingBoxes.push(bb);
}

function getFaceNormal(object, section, info, i) {
    const vert = [];
    for (let j = 0; j < 3; j += 1) {
        const index = section.data.getUint16((i * section.blockSize) + (j * 2), true);
        vert.push(getPosition(object, info, index));
    }
    const u = [
        vert[1][0] - vert[0][0],
        vert[1][1] - vert[0][1],
        vert[1][2] - vert[0][2]
    ];
    const v = [
        vert[2][0] - vert[0][0],
        vert[2][1] - vert[0][1],
        vert[2][2] - vert[0][2]
    ];
    return [
        (u[1] * v[2]) - (u[2] * v[1]),
        (u[2] * v[0]) - (u[0] * v[2]),
        (u[0] * v[1]) - (u[1] * v[0])
    ];
}

function getVertexNormal(object, info, index) {
    return rotate([
        object.normals[index * 4],
        object.normals[(index * 4) + 1],
        object.normals[(index * 4) + 2]
    ], info.angle);
}

function getPosition(object, info, index) {
    const pos = rotate([
        object.vertices[index * 4] * WORLD_SCALE,
        object.vertices[(index * 4) + 1] * WORLD_SCALE,
        object.vertices[(index * 4) + 2] * WORLD_SCALE
    ], info.angle);
    return [
        pos[0] + info.x,
        pos[1] + info.y,
        pos[2] + info.z
    ];
}

function getColor(section, face) {
    const color = section.data.getUint8((face * section.blockSize) + 8);
    return Math.floor(color / 16);
}

function getUVs(section, face, ptIndex) {
    const baseIndex = face * section.blockSize;
    const index = baseIndex + 12 + (ptIndex * 4);
    const u = section.data.getUint16(index);
    const v = section.data.getUint16(index + 2);
    return [u, v];
}

function getUVGroup(object, section, face, atlas) {
    if (section.blockSize === 24 || section.blockSize === 32) {
        const baseIndex = face * section.blockSize;
        const uvGroupIndex = section.blockSize === 32 ?
            section.data.getUint8(baseIndex + 28)
            : section.data.getUint8(baseIndex + 6);
        const uvGroup = object.uvGroups[uvGroupIndex];
        return atlas.groups[uvGroup.join(',')].tgt;
    }
    return null;
}

const angleMatrix = {
    0: new THREE.Matrix4(), // 0 degrees
    1: new THREE.Matrix4().set(0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 0, 1), // 270 degrees
    2: new THREE.Matrix4().set(-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1), // 180 degrees
    3: new THREE.Matrix4().set(0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1) // 90 degrees
};

function rotate(vec, angle) {
    const index = (angle + 3) % 4;
    const v = new THREE.Vector3().fromArray(vec);
    return v.applyMatrix4(angleMatrix[index]).toArray();
}
