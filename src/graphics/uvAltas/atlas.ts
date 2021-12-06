import * as THREE from 'three';
import xatlasModule from '@agrande/xatlas-web';

interface GeometryInfo {
    mesh: THREE.Mesh;
    geom: THREE.BufferGeometry;
    material: THREE.Material;
    atlasMeshId?: number;
}

export async function buildAtlas(scene: THREE.Object3D) {
    const xatlas = await xatlasModule();

    const geometries = collectGeometries(scene);

    xatlas.createAtlas();
    geometries.forEach(addMesh.bind(null, xatlas));
    xatlas.generateAtlas();
    geometries.forEach(updateMesh.bind(null, xatlas));
    xatlas.destroyAtlas();
}

function addMesh(xatlas, geomInfo: GeometryInfo) {
    const { index, attributes} = geomInfo.geom;
    const { position, normal, uv } = attributes;
    const mesh = xatlas.createMesh(
        position.array.length / 3,
        index.array.length,
        !!normal,
        !!uv
    );
    const tgtPosition = new Float32Array(
        xatlas.HEAPU8.buffer,
        mesh.positionOffset,
        position.array.length
    );
    tgtPosition.set(position.array);
    const tgtIndex = new Uint32Array(
        xatlas.HEAPU8.buffer,
        mesh.indexOffset,
        index.array.length
    );
    tgtIndex.set(index.array);
    if (!!normal) {
        const tgtNormal = new Float32Array(
            xatlas.HEAPU8.buffer,
            mesh.normalOffset,
            normal.array.length
        );
        tgtNormal.set(normal.array);
    }
    if (!!uv) {
        const tgtUv = new Float32Array(
            xatlas.HEAPU8.buffer,
            mesh.uvOffset,
            uv.array.length
        );
        tgtUv.set(uv.array);
    }
    geomInfo.atlasMeshId = mesh.meshId;
    xatlas.addMesh();
}

function updateMesh(xatlas, geomInfo: GeometryInfo) {
    const geom = geomInfo.geom;
    const meshData = xatlas.getMeshData(geomInfo.atlasMeshId);
    const { index, attributes } = geom;
    const originalIndexArray = new Uint32Array(
        xatlas.HEAPU8.buffer,
        meshData.originalIndexOffset,
        meshData.newVertexCount
    );
    for (const name in attributes) {
        const attr = attributes[name];
        const ArrayType = attr.array.constructor as any;
        const newArray = new ArrayType(meshData.newVertexCount * attr.itemSize);
        for (let i = 0; i < meshData.newVertexCount; i += 1) {
            const idx = i * attr.itemSize;
            const idx_src = originalIndexArray[i] * attr.itemSize;
            for (let j = 0; j < attr.itemSize; j += 1) {
                newArray[idx + j] = attr.array[idx_src + j];
            }
        }
        attributes[name] = new THREE.BufferAttribute(newArray, attr.itemSize, attr.normalized);
        attributes[name].needsUpdate = true;
    }
    const uv2_src = new Float32Array(
        xatlas.HEAPU8.buffer,
        meshData.uvOffset,
        meshData.newVertexCount * 2
    );
    const uv2 = new Float32Array(meshData.newVertexCount * 2);
    uv2.set(uv2_src);
    geom.attributes.uv2 = new THREE.BufferAttribute(uv2, 2);
    geom.attributes.uv2.needsUpdate = true;
    if (!geom.attributes.uv) {
        geom.attributes.uv = geom.attributes.uv2;
    }
    const tgtIndex = new Uint32Array(
        xatlas.HEAPU8.buffer,
        meshData.indexOffset,
        index.array.length
    );
    (index.array as any).set(tgtIndex);
    index.needsUpdate = true;
}

function collectGeometries(scene: THREE.Object3D): GeometryInfo[] {
    const geometries: GeometryInfo[] = [];
    scene.traverse((node) => {
        if (node instanceof THREE.Mesh
            && (!node.material.emissive
                || node.material.emissive.getHex() === 0x000000)) {
            node.updateMatrix();
            node.updateMatrixWorld();
            if (node.geometry instanceof THREE.BufferGeometry) {
                geometries.push({
                    mesh: node,
                    geom: node.geometry,
                    material: node.material
                });
            }
        }
    });
    return geometries;
}
