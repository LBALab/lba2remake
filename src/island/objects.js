const push = Array.prototype.push;

export function loadObjects(island, section, geometry, objects) {
    const numObjects = section.info.numObjects;
    for (let i = 0; i < numObjects; ++i) {
        const info = loadObjectInfo(section.objects, i);
        const object = loadObject(island, objects, info.index);
        loadFaces(geometry, object);
    }
}

function loadObjectInfo(objects, index) {
    const offset = index * 48;
    return {
        index: objects.getUint32(offset, true),
        x: objects.getInt32(offset + 4, true),
        y: objects.getInt32(offset + 8, true),
        z: objects.getInt32(offset + 12, true),
        angle: objects.getUint8(offset + 17)
    }
}

function loadObject(island, objects, index) {
    if (objects[index]) {
        return objects[index];
    } else {
        const buffer = island.files.obl.getEntry(index);
        const dataView = new DataView(buffer);
        const obj = {
            faceSectionOffset: dataView.getUint32(68, true),
            lineSectionSize: dataView.getUint32(72, true),
            lineSectionOffset: dataView.getUint32(76, true),
            sphereSectionSize: dataView.getUint32(80, true),
            sphereSectionOffset: dataView.getUint32(84, true),
            uvGroupsSectionSize: dataView.getUint32(88, true),
            uvGroupsSectionOffset: dataView.getUint32(92, true),
            numVerticesType1: dataView.getUint16(100, true),
            numVerticesType2: dataView.getUint16(102, true),
            buffer: buffer
        };
        objects[index] = obj;
        return obj;
    }
}

function loadFaces(geometry, object) {
    const dataView = new DataView(object.buffer, object.faceSectionOffset, object.lineSectionOffset - object.faceSectionOffset);
    let offset = 0;
    while (offset < dataView.byteLength) {
        const section = {
            id: dataView.getUint8(offset),
            type: dataView.getUint8(offset + 1),
            numFaces: dataView.getUint16(offset + 2, true),
            size: dataView.getUint16(offset + 4, true) - 8
            // 2 bytes padding
        };
        if (section.size != 0) {
            section.blockSize = section.size / section.numFaces;
            section.dataView = new DataView(object.buffer, offset + 8, section.size);
            loadFaceSection(geometry, section);
            offset += section.size + 8;
        } else {
            break;

        }
    }
}

function loadFaceSection(geometry, section) {
    
}