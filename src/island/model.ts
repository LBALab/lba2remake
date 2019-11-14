export function loadModel(buffer) {
    const data = new DataView(buffer);
    const model = {
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
        vertices: null,
        normals: null,
        uvGroups: [],
        buffer
    };
    model.vertices = new Int16Array(buffer, model.verticesOffset, model.numVerticesType1 * 4);
    model.normals = new Int16Array(buffer, model.normalsOffset, model.numVerticesType1 * 4);

    // uvGroups
    const rawUVGroups = new Uint8Array(
        model.buffer,
        model.uvGroupsSectionOffset,
        model.uvGroupsSectionSize * 4
    );
    for (let i = 0; i < model.uvGroupsSectionSize; i += 1) {
        const index = i * 4;
        model.uvGroups.push([
            rawUVGroups[index],
            rawUVGroups[index + 1],
            rawUVGroups[index + 2],
            rawUVGroups[index + 3]
        ]);
    }
    return model;
}
