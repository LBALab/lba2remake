import * as THREE from 'three';
import { WORLD_SCALE } from '../../utils/lba';

export const parseModelLBA2 = (resource, index, bodyProps) => {
    const buffer = resource.getEntry(index);
    const data = new DataView(buffer);
    const bodyFlag = data.getInt32(0x00, true);
    const obj = {
        index,
        bodyFlag,
        xMin: data.getInt32(0x08, true),
        xMax: data.getInt32(0x0C, true),
        yMin: data.getInt32(0x10, true),
        yMax: data.getInt32(0x14, true),
        zMin: data.getInt32(0x18, true),
        zMax: data.getInt32(0x1C, true),
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
        version: bodyFlag & 0xff,
        hasAnimation: bodyFlag & (1 << 8),
        noSort: bodyFlag & (1 << 9),
        hasTransparency: bodyFlag & (1 << 10),
        buffer
    };

    loadBones(obj);
    loadVertices(obj);
    loadNormals(obj);
    loadPolygons(obj, index);
    loadLines(obj);
    loadSpheres(obj);
    loadUVGroups(obj);
    computeBoundingBox(obj, bodyProps);

    return obj;
};

function loadBones(object) {
    object.bones = [];
    const rawBones = new Uint16Array(object.buffer, object.bonesOffset, object.bonesSize * 4);
    for (let i = 0; i < object.bonesSize; i += 1) {
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
    const data = new DataView(
        object.buffer,
        object.verticesOffset,
        object.normalsOffset - object.verticesOffset
    );
    for (let i = 0; i < object.verticesSize; i += 1) {
        const index = i * 8;
        object.vertices.push({
            x: data.getInt16(index, true) * WORLD_SCALE,
            y: data.getInt16(index + 2, true) * WORLD_SCALE,
            z: data.getInt16(index + 4, true) * WORLD_SCALE,
            bone: data.getUint16(index + 6, true)
        });
    }
}

function loadNormals(object) {
    object.normals = [];
    const rawNormals = new Int16Array(object.buffer, object.normalsOffset, object.normalsSize * 4);
    for (let i = 0; i < object.normalsSize; i += 1) {
        const index = i * 4;
        object.normals.push({
            x: rawNormals[index],
            y: rawNormals[index + 1],
            z: rawNormals[index + 2],
            colour: Math.floor((rawNormals[index + 3] & 0x00FF) / 16)
        });
    }
}

function loadPolygons(object, bodyIndex) {
    object.polygons = [];
    const data = new DataView(
        object.buffer,
        object.polygonsOffset,
        object.linesOffset - object.polygonsOffset
    );
    let offset = 0;
    while (offset < object.linesOffset - object.polygonsOffset) {
        const polyType = data.getUint8(offset);
        const renderType = data.getUint16(offset, true);
        const numPolygons = data.getUint16(offset + 2, true);
        const sectionSize = data.getUint16(offset + 4, true);
        // const shade = data.getUint16(offset + 6, true);
        offset += 8;

        if (sectionSize === 0)
            break;

        const blockSize = ((sectionSize - 8) / numPolygons);

        for (let j = 0; j < numPolygons; j += 1) {
            const poly = loadPolygon(data, offset, renderType, polyType, blockSize, bodyIndex);
            object.polygons.push(poly);
            offset += blockSize;
        }
    }
}

function loadPolygon(data, offset, renderType, polyType, blockSize, bodyIndex) {
    const numVertex = (renderType & 0x8000) ? 4 : 3;
    const hasExtra = !!((renderType & 0x4000));
    const hasTex = polyType > 7 && blockSize > 16;
    const hasTransparency = (renderType === 2);

    const poly = {
        renderType,
        polyType,
        vertex: [],
        colour: 0,
        intensity: 0,
        u: [],
        v: [],
        tex: 0,
        numVertex,
        hasTex,
        hasExtra,
        hasTransparency
    };

    // Blocksizes:
    // Quad and Extra = 16
    // Quad and Tex = 32
    // Quad and Color = 12
    // Tri and Extra = 16
    // Tri and Tex = 24
    // Tri and Color = 12

    // vertex block
    for (let k = 0; k < numVertex; k += 1) {
        poly.vertex[k] = data.getUint16(offset + (k * 2), true);
    }

    // special case for trianguled textures
    if (hasTex && numVertex === 3) {
        poly.tex = data.getUint8(offset + 6, true);
    }

    // polygon color
    const colour = data.getUint8(offset + 8, true);
    poly.colour = Math.floor(colour / 16);

    // dirty fix for Zoe's mustache
    if ((bodyIndex === 26 || bodyIndex === 17) && poly.colour === 1) {
        poly.colour = 2;
    }

    // polygon color intensity
    // const intensity = data.getInt16(offset + 10, true);
    poly.intensity = colour % 16;

    if (hasTex) {
        for (let k = 0; k < numVertex; k += 1) {
            poly.u[k] = data.getUint8(offset + 13 + (k * 4), true);
            poly.v[k] = data.getUint8(offset + 15 + (k * 4), true);
        }
        // for blocksize 32 with quad texture
        if (numVertex === 4) {
            poly.tex = data.getUint8(offset + 28, true);
        }
    }
    // else if (hasExtra) {
    //     poly.u[0] = data.getInt8(offset + 12, true);
    //     poly.v[0] = data.getInt8(offset + 13, true);
    //     poly.tex = data.getUint8(offset + 14, true);
    // }

    return poly;
}

function loadLines(object) {
    object.lines = [];
    const rawLines = new Uint16Array(object.buffer, object.linesOffset, object.linesSize * 4);
    for (let i = 0; i < object.linesSize; i += 1) {
        const index = i * 4;
        const colour = rawLines[index + 1] & 0x00FF;
        object.lines.push({
            unk1: rawLines[index],
            colour: Math.floor(colour / 16),
            intensity: colour % 16,
            vertex1: rawLines[index + 2],
            vertex2: rawLines[index + 3]
        });
    }
}

function loadSpheres(object) {
    object.spheres = [];
    const rawSpheres = new Uint16Array(object.buffer, object.spheresOffset, object.spheresSize * 4);
    for (let i = 0; i < object.spheresSize; i += 1) {
        const index = i * 4;
        const colour = rawSpheres[index + 1] & 0x00FF;
        object.spheres.push({
            unk1: rawSpheres[index],
            colour: Math.floor(colour / 16),
            intensity: colour % 16,
            vertex: rawSpheres[index + 2],
            size: rawSpheres[index + 3] * WORLD_SCALE
        });
    }
}

function loadUVGroups(object) {
    object.uvGroups = [];
    const rawUVGroups = new Uint8Array(
        object.buffer,
        object.uvGroupsOffset,
        object.uvGroupsSize * 4
    );
    for (let i = 0; i < object.uvGroupsSize; i += 1) {
        const index = i * 4;
        object.uvGroups.push([
            rawUVGroups[index],
            rawUVGroups[index + 1],
            rawUVGroups[index + 2],
            rawUVGroups[index + 3]
        ]);
    }
}

export function computeBoundingBox(object, bodyProps) {
    if (bodyProps && bodyProps.hasCollisionBox) {
        const {xMin, yMin, zMin, xMax, yMax, zMax} = bodyProps.box;
        object.boundingBox = new THREE.Box3(
            new THREE.Vector3(
                xMin * WORLD_SCALE,
                yMin * WORLD_SCALE,
                zMin * WORLD_SCALE
            )
            ,
            new THREE.Vector3(
                xMax * WORLD_SCALE,
                yMax * WORLD_SCALE,
                zMax * WORLD_SCALE
            )
        );
    } else {
        const {xMin, yMin, zMin, xMax, yMax, zMax} = object;
        object.boundingBox = new THREE.Box3(
            new THREE.Vector3(
                xMin * WORLD_SCALE,
                yMin * WORLD_SCALE,
                zMin * WORLD_SCALE
            )
            ,
            new THREE.Vector3(
                xMax * WORLD_SCALE,
                yMax * WORLD_SCALE,
                zMax * WORLD_SCALE
            )
        );
    }
}
