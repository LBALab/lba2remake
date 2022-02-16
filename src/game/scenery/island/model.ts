export interface IslandModel {
    index: number;
    bbXMin: number;
    bbXMax: number;
    bbYMin: number;
    bbYMax: number;
    bbZMin: number;
    bbZMax: number;
    verticesOffset: number;
    normalsOffset: number;
    faceSectionOffset: number;
    lineSectionSize: number;
    lineSectionOffset: number;
    sphereSectionSize: number;
    sphereSectionOffset: number;
    uvGroupsSectionSize: number;
    uvGroupsSectionOffset: number;
    numVerticesType1: number;
    numVerticesType2: number;
    vertices: Int16Array;
    normals: Int16Array;
    uvGroups: [number, number, number, number][];
    buffer: ArrayBuffer;
}

export function loadModel(buffer: ArrayBuffer, index: number): IslandModel {
  const data = new DataView(buffer);
  const model = {
    index,
    bbXMin: data.getInt32(8, true),
    bbXMax: data.getInt32(12, true),
    bbYMin: data.getInt32(16, true),
    bbYMax: data.getInt32(20, true),
    bbZMin: data.getInt32(24, true),
    bbZMax: data.getInt32(28, true),
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
    buffer,
  };
  model.vertices = new Int16Array(
    buffer,
    model.verticesOffset,
    model.numVerticesType1 * 4
  );
  model.normals = new Int16Array(
    buffer,
    model.normalsOffset,
    model.numVerticesType1 * 4
  );

  // uvGroups
  const rawUVGroups = new Uint8Array(
    model.buffer,
    model.uvGroupsSectionOffset,
    model.uvGroupsSectionSize * 4
  );
  for (let i = 0; i < model.uvGroupsSectionSize; i += 1) {
    const idx = i * 4;
    model.uvGroups.push([
      rawUVGroups[idx],
      rawUVGroups[idx + 1],
      rawUVGroups[idx + 2],
      rawUVGroups[idx + 3],
    ]);
  }
  return model;
}
