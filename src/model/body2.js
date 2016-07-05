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
        //loadNormals(obj);
        //loadPolygons(obj);
        //loadLines(obj);
        //loadSpheres(obj);
        //loadTextures(obj);
        
        objects[index] = obj;
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
    const rawVertices = new Uint16Array(object.buffer, object.verticesOffset, object.verticesSize * 4);
    for (let i = 0; i < object.verticesSize; ++i) {
        const index = i * 4;
        object.vertices.push({
            x: rawVertices[index],
            y: rawVertices[index + 1],
            z: rawVertices[index + 2],
            bone: rawVertices[index + 3]
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
