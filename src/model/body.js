import THREE from 'three';
import _ from 'lodash';

const push = Array.prototype.push;

/** Load LBA model body */
export function loadBody(model, bodies, index) {
    if (bodies[index]) {
        return bodies[index];
    } else {
        const buffer = model.files.body.getEntry(index);
        const data = new DataView(buffer);
        const obj = {
            bodyFlag: data.getInt16(0x00, true),
            bonesSize: data.getUint32(0x20, true),
            bonesOffset: data.getUint32(0x24, true),
            verticesSize: data.getUint32(0x28, true),
            verticesOffset: data.getUint32(0x2C, true),
            normalsSize: data.getUint32(0x30, true),
            normalsOffset: data.getUint32(0x34, true),
            unk1Size: data.getUint32(0x38, true),
            unk1Offset: data.getUint32(0x3C, true),
            polygonsSize: data.getUint32(0x40, true),
            polygonsOffset: data.getUint32(0x44, true),
            linesSize: data.getUint32(0x48, true),
            linesOffset: data.getUint32(0x4C, true),
            spheresSize: data.getUint32(0x50, true),
            spheresOffset: data.getUint32(0x54, true),
            uvGroupsSize: data.getUint32(0x58, true),
            uvGroupsOffset: data.getUint32(0x5C, true),
            
            buffer: buffer
        };

        obj.hasAnim = obj.bodyFlag & 2;
         
        loadBones(obj);
        loadVertices(obj);
        loadNormals(obj);
        loadPolygons(obj);
        loadLines(obj);
        loadSpheres(obj);
        loadUVGroups(obj);
        
        bodies[index] = obj;
        return obj;
    }
}

function loadBones(object) {
    object.bones = [];
    const rawBones = new Uint16Array(object.buffer, object.bonesOffset, object.bonesSize * 4);
    for (let i = 0; i < object.bonesSize; ++i) {
        const index = i * 4;
        object.bones.push({
            parent: rawBones[index],
            vertex: rawBones[index + 1],
            unk1: rawBones[index + 2],
            unk2: rawBones[index + 3]
        });
    }
}

function loadVertices(object) {
    object.vertices = [];
    const data = new DataView(object.buffer, object.verticesOffset, object.normalsOffset - object.verticesOffset);
    for (let i = 0; i < object.verticesSize; ++i) {
        const index = i * 8;
        object.vertices.push({
            x: data.getInt16(index, true) / 0x4000,
            y: data.getInt16(index + 2 , true) / 0x4000,
            z: data.getInt16(index + 4, true) / 0x4000,
            bone: data.getUint16(index + 6, true)
        });
    }
}

function loadNormals(object) {
    object.normals = [];
    const rawNormals = new Int16Array(object.buffer, object.normalsOffset, object.normalsSize * 4);
    for (let i = 0; i < object.normalsSize; ++i) {
        const index = i * 4;
        object.normals.push({
            x: rawNormals[index],
            y: rawNormals[index + 1],
            z: rawNormals[index + 2],
            colour: rawNormals[index + 3]
        });
    }
}

function loadPolygons(object) {
    object.polygons = [];
    const data = new DataView(object.buffer, object.polygonsOffset, object.linesOffset - object.polygonsOffset);
    let offset = 0;
    while (offset < object.linesOffset - object.polygonsOffset) {
        const renderType = data.getUint16(offset, true);
        const numPolygons = data.getUint16(offset + 2, true);
        const sectionSize = data.getUint16(offset + 4, true);
        const shade = data.getUint16(offset + 6, true);
        offset += 8;

        if (sectionSize == 0)
            break;

        const blockSize = ((sectionSize - 8) / numPolygons);

        for (let j = 0; j < numPolygons; ++j) {
            const poly = loadPolygon(data, offset, renderType, blockSize);
            object.polygons.push(poly);
            offset += blockSize;
        }
    }
}

function loadPolygon(data, offset, renderType, blockSize) {
    const numVertex = (renderType & 0x8000) ? 4 : 3;
    const hasExtra = (renderType & 0x4000) ? true : false;
    const hasTex = (renderType & 0x8 && blockSize > 16) ? true : false;
    const hasTransparency = (renderType == 2) ? true : false;

    let poly = {
        vertex: [],
        colour: 0,
        intensity: 0,
        unkX: [],
        texX: [],
        unkY: [],
        texY: [],
        tex: 0,
        numVertex: numVertex,
        hasTex: hasTex,
        hasExtra: hasExtra,
        hasTransparency: hasTransparency
    };

    // Blocksizes:
    // Quad and Extra = 16
    // Quad and Tex = 32
    // Quad and Color = 12 (DONE)
    // Tri and Extra = 16
    // Tri and Tex = 24
    // Tri and Color = 12 (DONE)

    // vertex block
    for (let k = 0; k < numVertex; ++k) {
        poly.vertex[k] = data.getUint16(offset + k * 2, true);
    }

    // special case for trianguled textures
    if (hasTex && numVertex == 3) {
        poly.tex = data.getUint8(offset + 6, true);
    }

    // polygon color
    const colour = data.getUint16(offset + 8, true);
    poly.colour = (colour & 0x00FF);

    // polygon color intensity
    const intensity = data.getInt16(offset + 10, true);
    poly.intensity = intensity;

    if (hasTex) {
        for (let k = 0; k < numVertex; ++k) {
            poly.unkX[k] = data.getInt8(offset + 12 + k * 4, true);
            poly.texX[k] = data.getInt8(offset + 13 + k * 4, true);
            poly.unkY[k] = data.getInt8(offset + 14 + k * 4, true);
            poly.texY[k] = data.getInt8(offset + 15 + k * 4, true);
        }
        // for blocksize 32 with quad texture
        if (numVertex == 4) {
            poly.tex = data.getUint8(offset + 28, true);
        }
    }
    // else if (hasExtra) {
    //     poly.texX[0] = data.getInt8(offset + 12, true);
    //     poly.texY[0] = data.getInt8(offset + 13, true);
    //     poly.tex = data.getUint8(offset + 14, true);
    // }

    return poly;
}

function loadLines(object) {
    object.lines = [];
    const rawLines = new Uint16Array(object.buffer, object.linesOffset, object.linesSize * 4);
    for (let i = 0; i < object.linesSize; ++i) {
        const index = i * 4;
        object.lines.push({
            unk1: rawLines[index],
            colour: rawLines[index + 1] & 0x00FF,
            vertex1: rawLines[index + 2],
            vertex2: rawLines[index + 3]
        });
    }
}

function loadSpheres(object) {
    object.spheres = [];
    const rawSpheres = new Uint16Array(object.buffer, object.spheresOffset, object.spheresSize * 4);
    for (let i = 0; i < object.spheresSize; ++i) {
        const index = i * 4;
        object.spheres.push({
            unk1: rawSpheres[index],
            colour: rawSpheres[index + 1] & 0x00FF,
            vertex: rawSpheres[index + 2],
            size: rawSpheres[index + 3] / 0x4000
        });
    }
}

function loadUVGroups(object) {
    object.uvGroups = [];
    const rawUVGroups = new Uint8Array(object.buffer, object.uvGroupsOffset, object.uvGroupsSize * 4);
    for (let i = 0; i < object.uvGroupsSize; ++i) {
        const index = i * 4;
        object.uvGroups.push({
            x: rawUVGroups[index],
            y: rawUVGroups[index + 1],
            width: rawUVGroups[index + 2],
            height: rawUVGroups[index + 3]
        });
    }
}
