const push = Array.prototype.push;

export function loadObjects(island, section, geometry) {
    const numObjects = section.info.numObjects;
    for (let i = 0; i < numObjects; ++i) {
        const info = loadObjectInfo(section.objects, i);
        console.log(info);
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
