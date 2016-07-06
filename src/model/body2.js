import THREE from 'three';

const push = Array.prototype.push;

/** Load LBA2 model body */
export function loadBody2(model, objects, index) {
    if (objects[index]) {
        return objects[index];
    } else {
        const buffer = model.files.body.getEntry(index);
        const data = new DataView(buffer);
        const obj = {
            bonesSize: data.getUint32(0x20, true),
            bonesOffset: data.getUint32(0x24, true),
            verticesSize: data.getUint32(0x28, true),
            verticesOffset: data.getUint32(0x2C, true),
            normalsSize: data.getUint32(0x30, true),
            normalsOffset: data.getUint32(0x34, true),
            //unk1Size: data.getUint32(0x38, true),
            //unk1Offset: data.getUint32(0x3C, true),
            polygonsSize: data.getUint32(0x40, true),
            polygonsOffset: data.getUint32(0x44, true),
            linesSize: data.getUint32(0x48, true),
            linesOffset: data.getUint32(0x4C, true),
            spheresSize: data.getUint32(0x50, true),
            spheresOffset: data.getUint32(0x54, true),
            texturesSize: data.getUint32(0x58, true),
            texturesOffset: data.getUint32(0x5C, true),
            
            buffer: buffer
        };
         
        loadBones(obj);
        loadVertices(obj);
        loadNormals(obj);
        loadPolygons(obj);
        loadLines(obj);
        loadSpheres(obj);
        loadTextures(obj);
        
        objects[index] = obj;
        return obj;
    }
}

function loadBones(object) {
    object.bones = [];
    const rawBones = new Uint16Array(object.buffer, object.bonesOffset, object.bonesSize * 8);
    for (let i = 0; i < object.bonesSize; ++i) {
        const index = i * 8;
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
    const rawVertices = new Uint16Array(object.buffer, object.verticesOffset, object.verticesSize * 8);
    for (let i = 0; i < object.verticesSize; ++i) {
        const index = i * 8;
        object.vertices.push({
            x: rawVertices[index],
            y: rawVertices[index + 1],
            z: rawVertices[index + 2],
            bone: rawVertices[index + 3]
        });
    }
}

function loadNormals(object) {
    object.normals = [];
    const rawNormals = new Uint16Array(object.buffer, object.normalsOffset, object.normalsSize * 8);
    for (let i = 0; i < object.normalsSize; ++i) {
        const index = i * 8;
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
    // const rawPolygons = new Uint16Array(object.buffer, object.polygonsOffset, object.polygonsSize * 4);
    // for (let i = 0; i < object.polygonsSize; ++i) {
    //     const index = i * 4;
    //     let flag = rawPolygons[index]; // flag to indicate if has texture or transparency
    //     let size = rawPolygons[index + 1];
    //     let num = rawPolygons[index + 2]; // total number of polygons
    //     let unk1 = rawPolygons[index + 3];

    //     for (let i = 0; i < object.polygonsSize; ++i) {
        
    //     object.polygons.push({
    //         x: rawPolygons[index],
    //         y: rawPolygons[index + 1],
    //         z: rawPolygons[index + 2],
    //         colour: rawPolygons[index + 3]
    //     });
    // }
}

function loadLines(object) {
    object.lines = [];
    const rawLines = new Uint16Array(object.buffer, object.linesOffset, object.linesSize * 8);
    for (let i = 0; i < object.linesSize; ++i) {
        const index = i * 8;
        object.lines.push({
            unk1: rawLines[index],
            colour: rawLines[index + 1],
            vertex1: rawLines[index + 2],
            vertex2: rawLines[index + 3]
        });
    }
}

function loadSpheres(object) {
    object.spheres = [];
    const rawSpheres = new Uint16Array(object.buffer, object.spheresOffset, object.spheresSize * 8);
    for (let i = 0; i < object.spheresSize; ++i) {
        const index = i * 8;
        object.spheres.push({
            unk1: rawSpheres[index],
            colour: rawSpheres[index + 1],
            vertex: rawSpheres[index + 2],
            size: rawSpheres[index + 3]
        });
    }
}

function loadTextures(object) {
    object.textures = [];
    const rawTextures = new Uint8Array(object.buffer, object.texturesOffset, object.texturesSize * 4);
    for (let i = 0; i < object.texturesSize; ++i) {
        const index = i * 4;
        object.textures.push({
            x: rawTextures[index],
            y: rawTextures[index + 1],
            w: rawTextures[index + 2],
            h: rawTextures[index + 3]
        });
    }
}

function getPosition(object, info, index) {
    const pos = rotate([
        object.vertices[index * 4].x / 0x4000,
        object.vertices[index * 4].y / 0x4000,
        object.vertices[index * 4].z / 0x4000
    ], info.angle);
    return [
        pos[0] + info.x,
        pos[1] + info.y,
        pos[2] + info.z
    ];
}
