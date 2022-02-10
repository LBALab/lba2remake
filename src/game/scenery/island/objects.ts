import * as THREE from 'three';
import {each} from 'lodash';
import {bits} from '../../../utils';
import {WORLD_SCALE} from '../../../utils/lba';
import { IslandSection, IslandObjectInfo } from './IslandLayout';
import { getParams } from '../../../params';

const push = Array.prototype.push;

// Offset amount per island to offset any transparent objects to be closer to
// the object they're supposed to be attached to. This offset is unfortunately
// not consistent between islands, although appears to be consistent within a
// given island.
const TransparentObjectOffset = {
    CITADEL: 0.05,
};

export function loadObjectGeometries(section: IslandSection, geometries, models, atlas, island) {
    for (const obj of section.objects) {
        const model = models[obj.index];
        loadFaces(geometries, model, obj, atlas, island);
        loadBoundingBox(obj, model);
    }
}

function loadBoundingBox(obj: IslandObjectInfo, model) {
    const bb = new THREE.Box3(
        new THREE.Vector3(model.bbXMin, model.bbYMin, model.bbZMin),
        new THREE.Vector3(model.bbXMax, model.bbYMax, model.bbZMax),
    );
    bb.min.multiplyScalar(WORLD_SCALE);
    bb.max.multiplyScalar(WORLD_SCALE);
    bb.applyMatrix4(angleMatrix[(obj.angle + 3) % 4]);
    bb.translate(new THREE.Vector3(obj.x, obj.y, obj.z));
    obj.boundingBox = bb;
    if (getParams().editor) {
        obj.label = createObjectLabel(`obj_${obj.index}`, bb);
    }
}

function createObjectLabel(name, bb: THREE.Box3) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const icon = new Image(32, 32);
    icon.src = 'editor/icons/mesh.svg';
    const texture = new THREE.CanvasTexture(canvas);
    texture.encoding = THREE.sRGBEncoding;
    texture.anisotropy = 16;

    const draw = (selected = false) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = '22px LBA';
        ctx.textAlign = 'center';
        const textWidth = Math.min(ctx.measureText(name).width, 256 - 64);
        if (selected) {
            ctx.shadowColor = 'black';
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            ctx.fillStyle = 'white';
            ctx.fillRect(128 - (textWidth * 0.5) - 18, 16, textWidth + 38, 32);
            ctx.fillStyle = 'black';
            ctx.shadowColor = 'transparent';
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
        } else {
            ctx.fillStyle = 'white';
            ctx.shadowColor = 'black';
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
        }
        ctx.drawImage(icon, 128 - (textWidth * 0.5) - 16, 16, 32, 32);
        ctx.fillText(name, 128 + 16, 42, 256 - 64);
        texture.needsUpdate = true;
    };

    icon.onload = () => draw();
    const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        depthTest: false
    });
    // @ts-ignore
    spriteMaterial.sizeAttenuation = false;
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(0.2, 0.05, 1);
    const height = (bb.max.y - bb.min.y) * 0.5;
    sprite.position.set(0, height, 0);
    sprite.renderOrder = 2;
    sprite.name = `label:${name}`;
    return sprite;
}

function loadFaces(geometries, model, info, atlas, island) {
    const data = new DataView(
        model.buffer,
        model.faceSectionOffset,
        model.lineSectionOffset - model.faceSectionOffset
    );
    let offset = 0;
    while (offset < data.byteLength) {
        const section = parseSectionHeader(data, model, offset);
        loadFaceSection(geometries, model, info, section, atlas, island);
        offset += section.size + 8;
    }
}

function parseSectionHeader(data, object, offset) {
    const type = data.getUint8(offset);
    const flags = data.getUint8(offset + 1);
    const numFaces = data.getUint16(offset + 2, true);
    const size = data.getUint16(offset + 4, true) - 8;
    return {
        type,
        numFaces,
        pointsPerFace: (flags & 0x80) ? 4 : 3,
        blockSize: size / numFaces,
        size,
        isTransparent: bits(type, 2, 1) === 1,
        data: new DataView(object.buffer, object.faceSectionOffset + offset + 8, size)
    };
}

function loadFaceSection(geometries, object, info, section, atlas, island) {
    for (let i = 0; i < section.numFaces; i += 1) {
        const uvGroup = getUVGroup(object, section, i, atlas);
        const faceNormal = getFaceNormal(object, section, info, i);
        const normalVec = new THREE.Vector3(
            faceNormal[0],
            faceNormal[1],
            faceNormal[2]
        ).normalize();
        const addVertex = (j) => {
            const index = section.data.getUint16((i * section.blockSize) + (j * 2), true);
            if (section.blockSize === 12 || section.blockSize === 16) {
                push.apply(geometries.objects_colored.positions, getPosition(object, info, index));
                push.apply(
                    geometries.objects_colored.normals,
                    section.type === 1 ? faceNormal : getVertexNormal(object, info, index)
                );
                geometries.objects_colored.colors.push(getColor(section, i));
            } else {
                const pos = getPosition(object, info, index);
                if (section.isTransparent && TransparentObjectOffset[island.name]) {
                    pos[0] -= TransparentObjectOffset[island.name] * normalVec.x;
                    pos[1] -= TransparentObjectOffset[island.name] * normalVec.y;
                    pos[2] -= TransparentObjectOffset[island.name] * normalVec.z;
                }
                const group = section.isTransparent
                    ? 'objects_textured_transparent'
                    : 'objects_textured';
                push.apply(geometries[group].positions, pos);
                push.apply(
                    geometries[group].normals,
                    section.type !== 10 ? faceNormal : getVertexNormal(object, info, index)
                );
                push.apply(geometries[group].uvs, getUVs(section, i, j));
                push.apply(geometries[group].uvGroups, uvGroup);
            }
        };
        for (let j = 0; j < 3; j += 1) {
            addVertex(j);
        }
        if (section.pointsPerFace === 4) {
            each([0, 2, 3], (j) => {
                addVertex(j);
            });
        }
    }
}

function getFaceNormal(object, section, info, i) {
    const vert = [];
    for (let j = 0; j < 3; j += 1) {
        const index = section.data.getUint16((i * section.blockSize) + (j * 2), true);
        vert.push(getPosition(object, info, index));
    }
    const u = [
        vert[1][0] - vert[0][0],
        vert[1][1] - vert[0][1],
        vert[1][2] - vert[0][2]
    ];
    const v = [
        vert[2][0] - vert[0][0],
        vert[2][1] - vert[0][1],
        vert[2][2] - vert[0][2]
    ];
    return [
        (u[1] * v[2]) - (u[2] * v[1]),
        (u[2] * v[0]) - (u[0] * v[2]),
        (u[0] * v[1]) - (u[1] * v[0])
    ];
}

function getVertexNormal(object, info, index) {
    return rotate([
        object.normals[index * 4],
        object.normals[(index * 4) + 1],
        object.normals[(index * 4) + 2]
    ], info.angle);
}

function getPosition(object, info, index) {
    const pos = rotate([
        object.vertices[index * 4] * WORLD_SCALE,
        object.vertices[(index * 4) + 1] * WORLD_SCALE,
        object.vertices[(index * 4) + 2] * WORLD_SCALE
    ], info.angle);
    return [
        pos[0] + info.x,
        pos[1] + info.y,
        pos[2] + info.z
    ];
}

function getColor(section, face) {
    const color = section.data.getUint8((face * section.blockSize) + 8);
    return Math.floor(color / 16);
}

function getUVs(section, face, ptIndex) {
    const baseIndex = face * section.blockSize;
    const index = baseIndex + 12 + (ptIndex * 4);
    const u = section.data.getUint16(index);
    const v = section.data.getUint16(index + 2);
    return [u, v];
}

function getUVGroup(object, section, face, atlas) {
    if (section.blockSize === 24 || section.blockSize === 32) {
        const baseIndex = face * section.blockSize;
        const uvGroupIndex = section.blockSize === 32 ?
            section.data.getUint8(baseIndex + 28)
            : section.data.getUint8(baseIndex + 6);
        const uvGroup = object.uvGroups[uvGroupIndex];
        return atlas.groups[uvGroup.join(',')].tgt;
    }
    return null;
}

const angleMatrix = {
    0: new THREE.Matrix4(), // 0 degrees
    1: new THREE.Matrix4().set(0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 0, 1), // 270 degrees
    2: new THREE.Matrix4().set(-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1), // 180 degrees
    3: new THREE.Matrix4().set(0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1) // 90 degrees
};

const V = new THREE.Vector3();

function rotate(vec, angle) {
    const index = (angle + 3) % 4;
    V.fromArray(vec);
    return V.applyMatrix4(angleMatrix[index]).toArray();
}
