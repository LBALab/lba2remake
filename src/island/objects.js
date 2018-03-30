import * as THREE from 'three';
import {bits} from '../utils';

const push = Array.prototype.push;

export function loadObjects(island, section, geometries, objects) {
    const numObjects = section.objInfo.numObjects;
    const boundingBoxes = [];
    for (let i = 0; i < numObjects; i += 1) {
        const info = loadObjectInfo(section.objects, section, i);
        const object = loadObject(island, objects, info.index);
        loadFaces(geometries, object, info, boundingBoxes);
    }
    section.boundingBoxes = boundingBoxes;
}

function loadObjectInfo(objects, section, index) {
    const offset = index * 48;
    return {
        index: objects.getUint32(offset, true),
        x: (0x8000 - objects.getInt32(offset + 12, true) + 512) / 0x4000 + section.x * 2,
        y: objects.getInt32(offset + 8, true) / 0x4000,
        z: objects.getInt32(offset + 4, true) / 0x4000 + section.z * 2,
        angle: objects.getUint8(offset + 21) >> 2,
        iv: 1
    };
}

function loadObject(island, objects, index) {
    if (objects[index]) {
        return objects[index];
    }
    const buffer = island.files.obl.getEntry(index);
    const data = new DataView(buffer);
    const obj = {
        verticesOffset: data.getUint32(44, true),
        normalsOffset: data.getUint32(52, true),
        faceSectionOffset: data.getUint32(68, true),
        lineSectionSize: data.getUint32(72, true),
        lineSectionOffset: data.getUint32(76, true),
        sphereSectionSize: data.getUint32(80, true),
        sphereSectionOffset: data.getUint32(84, true),
        uvGroupsSectionSize: data.getUint32(88, true),
        uvGroupsSectionOffset: data.getUint32(92, true),
        numVerticesType1: data.getUint16(100, true),
        numVerticesType2: data.getUint16(102, true),
        buffer
    };
        // console.log(new Uint32Array(buffer, 0, 17));
    obj.vertices = new Int16Array(buffer, obj.verticesOffset, obj.numVerticesType1 * 4);
    obj.normals = new Int16Array(buffer, obj.normalsOffset, obj.numVerticesType1 * 4);
    loadUVGroups(obj);
    objects[index] = obj;
    return obj;
}

function loadUVGroups(object) {
    object.uvGroups = [];
    const rawUVGroups = new Uint8Array(
        object.buffer,
        object.uvGroupsSectionOffset,
        object.uvGroupsSectionSize * 4
    );
    for (let i = 0; i < object.uvGroupsSectionSize; i += 1) {
        const index = i * 4;
        object.uvGroups.push([
            rawUVGroups[index],
            rawUVGroups[index + 1],
            rawUVGroups[index + 2],
            rawUVGroups[index + 3]
        ]);
    }
}

function loadFaces(geometries, object, info, boundingBoxes) {
    const data = new DataView(
        object.buffer,
        object.faceSectionOffset,
        object.lineSectionOffset - object.faceSectionOffset
    );
    let offset = 0;
    while (offset < data.byteLength) {
        const section = parseSectionHeader(data, object, offset);
        loadSection(geometries, object, info, section, boundingBoxes);
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

function loadSection(geometries, object, info, section, boundingBoxes) {
    const bb = new THREE.Box3();
    for (let i = 0; i < section.numFaces; i += 1) {
        const uvGroup = getUVGroup(object, section, i);
        const faceNormal = getFaceNormal(object, section, info, i);
        const addVertex = (j) => {
            const index = section.data.getUint16(i * section.blockSize + j * 2, true);
            const x = object.vertices[index * 4];
            const y = object.vertices[index * 4 + 1];
            const z = object.vertices[index * 4 + 2];

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
                const group = section.isTransparent ? 'objects_textured_transparent' : 'objects_textured';
                push.apply(geometries[group].positions, getPosition(object, info, index));
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
            for (const j of [0, 2, 3]) {
                addVertex(j);
            }
        }
    }
    bb.min.divideScalar(0x4000);
    bb.max.divideScalar(0x4000);
    bb.applyMatrix4(angleMatrix[(info.angle + 3) % 4]);
    bb.translate(new THREE.Vector3(info.x, info.y, info.z));
    boundingBoxes.push(bb);
}

function getFaceNormal(object, section, info, i) {
    const vert = [];
    for (let j = 0; j < 3; j += 1) {
        const index = section.data.getUint16(i * section.blockSize + j * 2, true);
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
        u[1] * v[2] - u[2] * v[1],
        u[2] * v[0] - u[0] * v[2],
        u[0] * v[1] - u[1] * v[0]
    ];
}

function getVertexNormal(object, info, index) {
    return rotate([
        object.normals[index * 4] / 0x4000,
        object.normals[index * 4 + 1] / 0x4000,
        object.normals[index * 4 + 2] / 0x4000
    ], info.angle);
}

function getPosition(object, info, index) {
    const pos = rotate([
        object.vertices[index * 4] / 0x4000,
        object.vertices[index * 4 + 1] / 0x4000,
        object.vertices[index * 4 + 2] / 0x4000
    ], info.angle);
    return [
        pos[0] + info.x,
        pos[1] + info.y,
        pos[2] + info.z
    ];
}

function getColor(section, face) {
    const color = section.data.getUint8(face * section.blockSize + 8);
    return Math.floor(color / 16);
}

function getUVs(section, face, ptIndex) {
    const baseIndex = face * section.blockSize;
    const index = baseIndex + 12 + ptIndex * 4;
    const u = section.data.getUint8(index + 1);
    const v = section.data.getUint8(index + 3);
    return [u, v];
}

function getUVGroup(object, section, face) {
    if (section.blockSize === 24 || section.blockSize === 32) {
        const baseIndex = face * section.blockSize;
        const uvGroupIndex = section.blockSize === 32 ?
            section.data.getUint8(baseIndex + 28)
            : section.data.getUint8(baseIndex + 6);
        return object.uvGroups[uvGroupIndex];
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
