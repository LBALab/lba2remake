import * as THREE from 'three';
import { WORLD_SCALE, PolygonType } from '../../utils/lba';
import { computeBoundingBox } from './body2';

export const parseModelLBA1 = (resource, index, bodyProps) => {
    const buffer = resource.getEntry(index);
    const data = new DataView(buffer);
    const bodyFlag = data.getInt16(0x00, true);
    const obj = {
        bodyFlag,
        xMin: data.getInt16(0x02, true),
        xMax: data.getInt16(0x04, true),
        yMin: data.getInt16(0x06, true),
        yMax: data.getInt16(0x08, true),
        zMin: data.getInt16(0x0A, true),
        zMax: data.getInt16(0x0C, true),
        version: bodyFlag & 0xff,
        hasAnimation: bodyFlag & (1 << 8),
        noSort: bodyFlag & (1 << 9),
        hasTransparency: bodyFlag & (1 << 10),
        buffer,
        normals: [],
    };

    let offset = loadVertices(obj, data, 0x1A);
    offset = loadBones(obj, data, offset);
    offset = loadShades(obj, data, offset);
    offset = loadPolygons(obj, data, offset);
    offset = loadLines(obj, data, offset);
    loadSpheres(obj, data, offset);

    normalizeNormals(obj);
    computeBoundingBox(obj, bodyProps);

    return obj;
};

function loadVertices(object: any, data: DataView, offset: number) {
    object.verticesSize = data.getUint16(offset, true);
    offset += 2;
    object.vertices = [];
    for (let i = 0; i < object.verticesSize; i += 1) {
        object.vertices.push({
            x: data.getInt16(offset, true) * WORLD_SCALE,
            y: data.getInt16(offset + 2, true) * WORLD_SCALE,
            z: data.getInt16(offset + 4, true) * WORLD_SCALE,
            bone: 0
        });
        object.normals.push(new THREE.Vector3());
        offset += 6;
    }
    return offset;
}

function loadBones(object: any, data: DataView, offset: number) {
    object.bonesSize = data.getUint16(offset, true);
    offset += 2;
    object.bones = [];
    for (let i = 0; i < object.bonesSize; i += 1) {
        const firstPoint  = data.getInt16(offset, true) / 6;
        const pointsSize  = data.getInt16(offset + 2, true);
        const basePoint   = data.getInt16(offset + 4, true) / 6;
        const baseElement = data.getInt16(offset + 6, true);
        offset += 8;

        // skip data
        offset += 30;

        const bone = {
            parent: (baseElement === -1) ? 0xffff : baseElement / 38,
            vertex: basePoint,
        };

        for (let j = 0; j < pointsSize; j += 1) {
            object.vertices[firstPoint + j].bone = i;
        }

        object.bones.push(bone);
    }
    return offset;
}

function loadShades(object: any, data: DataView, offset: number) {
    object.shadesSize = data.getUint16(offset, true);
    offset += 2;
    object.shades = [];
    for (let i = 0; i < object.shadesSize; i += 1) {
        object.shades.push({
            unk1: data.getInt16(offset, true),
            unk2: data.getInt16(offset + 2, true),
            unk3: data.getInt16(offset + 4, true),
            unk4: data.getInt16(offset + 6, true),
        });
        offset += 8;
    }
    return offset;
}

const PolyTypeMapping = {
    0: PolygonType.FLAT,
    1: PolygonType.COPPER,
    2: PolygonType.BOPPER,
    3: PolygonType.MARBLE,
    4: PolygonType.TELE,
    5: PolygonType.TRANS,
    6: PolygonType.TRAME,
    7: PolygonType.GOURAUD,
    8: PolygonType.DITHER,
    9: PolygonType.GOURAUD_TABLE,
    10: PolygonType.DITHER_TABLE,
};

function loadPolygons(object: any, data: DataView, offset: number) {
    object.polygonsSize = data.getUint16(offset, true);
    offset += 2;
    object.polygons = [];
    for (let i = 0; i < object.polygonsSize; i += 1) {
        const renderType = data.getUint8(offset);
        const numVertex = data.getUint8(offset + 1);
        const colour = data.getUint8(offset + 2);
        const hasExtra = !!((renderType & 0x40));
        const hasTransparency = (renderType === 2);
        offset += 4;

        const poly = {
            renderType,
            polyType: PolyTypeMapping[renderType & 0x0F],
            vertex: [],
            colour: Math.floor(colour / 16),
            intensity: colour % 16,
            u: [],
            v: [],
            tex: 0,
            numVertex,
            hasTex: false,
            hasExtra,
            hasTransparency
        };

        if (renderType >= 7 && !(renderType >= 9)) {
            // poly.intensity = data.getInt16(offset, true);
            offset += 2;
        }

        // vertex block
        for (let k = 0; k < numVertex; k += 1) {
            if (renderType >= 9) {
                // poly.intensity = data.getInt16(offset, true);
                offset += 2;
            }
            poly.vertex[k] = data.getUint16(offset, true) / 6;
            offset += 2;
        }
        const normal = getFaceNormal(object, poly);
        for (const vertex of poly.vertex) {
            object.normals[vertex].add(normal);
        }

        object.polygons.push(poly);
    }
    return offset;
}

const U = new THREE.Vector3();
const V = new THREE.Vector3();
const P1 = new THREE.Vector3();
const N = new THREE.Vector3();

function getFaceNormal(object, poly) {
    const pt0 = poly.vertex[0];
    const pt1 = poly.vertex[1];
    const pt2 = poly.vertex[2];
    const vert0 = object.vertices[pt0];
    const vert1 = object.vertices[pt1];
    const vert2 = object.vertices[pt2];
    P1.copy(vert0).add(getBoneOffset(object, vert0.bone));
    U.copy(vert1).add(getBoneOffset(object, vert1.bone)).sub(P1);
    V.copy(vert2).add(getBoneOffset(object, vert2.bone)).sub(P1);
    N.set(
        (U.y * V.z) - (U.z * V.y),
        (U.z * V.x) - (U.x * V.z),
        (U.x * V.y) - (U.y * V.x),
    );
    return N.normalize();
}

const B = new THREE.Vector3();

function getBoneOffset(object, bone) {
    B.set(0, 0, 0);

    while (bone !== 0xFFFF) {
        const vert = object.vertices[bone];
        B.add(vert);
        bone = object.bones[bone].parent;
    }

    return B;
}

function normalizeNormals(object) {
    for (const normal of object.normals) {
        normal.normalize();
    }
}

function loadLines(object: any, data: DataView, offset: number) {
    object.linesSize = data.getUint16(offset, true);
    offset += 2;
    object.lines = [];
    for (let i = 0; i < object.linesSize; i += 1) {
        object.lines.push({
            unk1: data.getUint16(offset, true),
            colour: Math.floor((data.getUint16(offset + 2, true)) / 16),
            vertex1: data.getUint16(offset + 4, true) / 6,
            vertex2: data.getUint16(offset + 6, true) / 6
        });
        offset += 8;
    }
    return offset;
}

function loadSpheres(object: any, data: DataView, offset: number) {
    object.spheresSize = data.getUint16(offset, true);
    offset += 2;
    object.spheres = [];
    for (let i = 0; i < object.spheresSize; i += 1) {
        object.spheres.push({
            unk1: data.getUint16(offset, true),
            colour: Math.floor((data.getUint16(offset + 2, true)) / 16),
            size: data.getUint16(offset + 4, true) * WORLD_SCALE,
            vertex: data.getUint16(offset + 6, true) / 6
        });
        offset += 8;
    }
    return offset;
}
