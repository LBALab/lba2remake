import THREE from 'three';
const push = Array.prototype.push;

let min = 0xFF;
let max = 0;
let distrib = {};

export function loadObjects(island, section, geometry, objects) {
    const numObjects = section.objInfo.numObjects;
    for (let i = 0; i < numObjects; ++i) {
        const info = loadObjectInfo(section.objects, section, i);
        const object = loadObject(island, objects, info.index);
        loadFaces(geometry, object, info, island.palette);
        if (info.iv in distrib) {
            distrib[info.iv] += 1;
        } else {
            distrib[info.iv] = 1;
        }
        min = Math.min(info.iv, min);
        max = Math.max(info.iv, max);
    }
    if (section.id == island.layout.length) {
        console.log(min, max, distrib);
    }
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
    } else {
        const buffer = island.files.obl.getEntry(index);
        const data = new DataView(buffer);
        const obj = {
            faceSectionOffset: data.getUint32(68, true),
            lineSectionSize: data.getUint32(72, true),
            lineSectionOffset: data.getUint32(76, true),
            sphereSectionSize: data.getUint32(80, true),
            sphereSectionOffset: data.getUint32(84, true),
            uvGroupsSectionSize: data.getUint32(88, true),
            uvGroupsSectionOffset: data.getUint32(92, true),
            numVerticesType1: data.getUint16(100, true),
            numVerticesType2: data.getUint16(102, true),
            buffer: buffer
        };
        obj.vertices = new Int16Array(buffer, 104, obj.numVerticesType1 * 4);
        obj.intensities = new Uint8Array(buffer, 104 + obj.numVerticesType1 * 8, obj.numVerticesType1 * 8);
        objects[index] = obj;
        return obj;
    }
}

function loadFaces(geometry, object, info, palette) {
    const data = new DataView(object.buffer, object.faceSectionOffset, object.lineSectionOffset - object.faceSectionOffset);
    let offset = 0;
    while (offset < data.byteLength) {
        const section = parseSectionHeader(data, object, offset);
        loadSection(geometry, object, info, section, palette);
        offset += section.size + 8;
    }
}

function parseSectionHeader(data, object, offset) {
    const flags = data.getUint8(offset + 1);
    const numFaces = data.getUint16(offset + 2, true);
    const size = data.getUint16(offset + 4, true) - 8;
    return {
        id: data.getUint8(offset),
        numFaces: numFaces,
        pointsPerFace: (flags & 0x80) ? 4 : 3,
        blockSize: size / numFaces,
        size: size,
        data: new DataView(object.buffer, object.faceSectionOffset + offset + 8, size)
    };
}

function loadSection(geometry, object, info, section, palette) {
    for (let i = 0; i < section.numFaces; ++i) {
        const addVertex = (j) => {
            const index = section.data.getUint16(i * section.blockSize + j * 2, true);
            const intensity = (object.intensities[index * 8 + info.iv] >> 5) * 3;
            push.apply(geometry.positions, getPosition(object, info, index));
            push.apply(geometry.colors, getColor(section, i, intensity, palette));
            push.apply(geometry.uvs, [0, 0]);
        };
        for (let j = 0; j < 3; ++j) {
            addVertex(j);
        }
        if (section.pointsPerFace == 4) {
            for (let j of [0, 2, 3]) {
                addVertex(j);
            }
        }
    }
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

function getColor(section, face, intensity, palette) {
    const color = section.data.getUint8(face * section.blockSize + 8);
    if (section.id >= 7) {
        return [0xFF, 0xFF, 0xFF, 0];
    } else {
        const c = color * 3 + intensity;
        return [palette[c], palette[c + 1], palette[c + 2], 0];
    }
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
