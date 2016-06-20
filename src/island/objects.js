import THREE from 'three';
const push = Array.prototype.push;

export function loadObjects(island, section, geometry, objects) {
    const numObjects = section.objInfo.numObjects;
    for (let i = 0; i < numObjects; ++i) {
        const info = loadObjectInfo(section.objects, section, i);
        const object = loadObject(island, objects, info.index);
        loadFaces(geometry, object, info);
    }
}

function loadObjectInfo(objects, section, index) {
    const offset = index * 48;
    return {
        index: objects.getUint32(offset, true),
        x: (0x8000 - objects.getInt32(offset + 12, true) + 512) / 0x4000 + section.x * 2,
        y: objects.getInt32(offset + 8, true) / 0x4000,
        z: objects.getInt32(offset + 4, true) / 0x4000 + section.z * 2,
        angle: ((objects.getUint8(offset + 21) >> 2) + 3) % 4
    }
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
        objects[index] = obj;
        return obj;
    }
}

function loadFaces(geometry, object, info) {
    const data = new DataView(object.buffer, object.faceSectionOffset, object.lineSectionOffset - object.faceSectionOffset);
    let offset = 0;
    while (offset < data.byteLength) {
        const section = parseSectionHeader(data, object, offset);
        loadSection(geometry, object, info, section);
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

const angleColor = {
    0: [0xFF, 0, 0, 0], // 00
    1: [0, 0xFF, 0, 0], // 01
    2: [0, 0, 0xFF, 0], // 10
    3: [0xFF, 0xFF, 0xFF, 0] // 11
};

function loadSection(geometry, object, info, section) {
    for (let i = 0; i < section.numFaces; ++i) {
        const triangle = (j) => {
            const index = section.data.getUint16(i * section.blockSize + j * 2, true);
            const pos = rotate([
                object.vertices[index * 4] / 0x4000,
                object.vertices[index * 4 + 1] / 0x4000,
                object.vertices[index * 4 + 2] / 0x4000
            ], info.angle);
            push.apply(geometry.positions, [
                pos[0] + info.x,
                pos[1] + info.y,
                pos[2] + info.z
            ]);
            push.apply(geometry.uvs, [0, 0]);
            push.apply(geometry.colors, angleColor[info.angle]);
        };
        for (let j = 0; j < 3; ++j) {
            triangle(j);
        }
        if (section.pointsPerFace == 4) {
            for (let j of [0, 2, 3]) {
                triangle(j);
            }
        }
    }
}

const angleMatrix = {
    0: new THREE.Matrix4(), // 0 degrees
    1: new THREE.Matrix4().set(0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 0, 1), // 90 degrees
    2: new THREE.Matrix4().set(-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1), // 180 degrees
    3: new THREE.Matrix4().set(0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1) // 270 degrees
};

function rotate(vec, angle) {
    const v = new THREE.Vector3().fromArray(vec);
    return v.applyMatrix4(angleMatrix[angle]).toArray();
}
