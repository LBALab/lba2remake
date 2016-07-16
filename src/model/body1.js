import THREE from 'three';
import _ from 'lodash';

const push = Array.prototype.push;

/** Load LBA1 model body */
export function loadBody1(model, geometry, objects, index) {
    if (objects[index]) {
        return objects[index];
    } else {
        const buffer = model.files.body.getEntry(index);
        const data = new DataView(buffer);
        const obj = {
            bodyFlag: data.getInt16(0x00, true),
            verticesSize: 0,
            bonesSize: 0,
            shadesSize: 0,
            polygonsSize: 0,
            linesSize: 0,
            spheresSize: 0,
            uvGroupsSize: 0,
            uvGroupsOffset: 0,
            
            buffer: buffer
        };

        obj.hasAnim = obj.bodyFlag & 2;
         
        offset = loadVertices(obj, 0x1A);
        offset = loadBones(obj, offset);
        offset = loadShades(obj, offset);
        offset = loadPolygons(obj, offset);
        offset = loadLines(obj, offset);
        offset = loadSpheres(obj, offset);

        loadGeometry(geometry, obj, model.palette);
        
        objects[index] = obj;
        return obj;
    }
}

function loadVertices(object, offset) {
    object.vertices = [];
    const data = new DataView(object.buffer, offset);
    object.verticesSize = data.getUint16(offset);
    offset += 2;
    for (let i = 0; i < object.verticesSize; ++i) {
        const index = i * 6;
        object.vertices.push({
            x: data.getInt16(index, true),
            y: data.getInt16(index + 2 , true),
            z: data.getInt16(index + 4, true),
            bone: 0
        });
        offset += 6;
    }
    return offset;
}

function loadBones(object, offset) {
    object.bones = [];
    const data = new DataView(object.buffer, offset);
    object.bonesSize = data.getUint16(offset);
    offset += 2;
    for (let i = 0; i < object.bonesSize; ++i) {
        const firstVertex = data.getInt16(offset);
        const numVertex = data.getInt16(offset + 2);
        const baseVertex = data.getInt16(offset + 4);
        const baseBone = data.getInt16(offset + 6);
        // TODO fields skipped now
        
        let bone = {
            parent: 0xFFFF,
            vertex: 0
        };

        if (baseBone == -1) {
			bone.parent = 0xFFFF;
		} else {
			bone.parent = baseBone / 38;
		}
		bone.vertex = baseVertex / 6;
		for (let j = 0; j < numVertex; ++j) {
			object.vertices[firstVertex/6 + j].bone = i;
		}

        object.bones.push(bone);

        offset += 28; // blocksize
    }
}

function loadShades(object, offset) {
    return offset;
}

function loadPolygons(object, offset) {
    return offset;
}

function loadLines(object, offset) {
    return offset;
}

function loadSpheres(object, offset) {
    return offset;
}

function loadGeometry(geometry, object, palette) {
}
