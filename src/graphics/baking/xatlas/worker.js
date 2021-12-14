self.importScripts('xatlas-web.js', 'three.js');

const stages = [
    'Xatlas: Adding meshes',
	'Xatlas: Computing Charts',
	'Xatlas: Packing Charts',
	'Xatlas: Rebuilding meshes'
];

self.onmessage = async function handleXatlasJob(msg) {
    try {
        const { geometries, params } = msg.data;
        const xatlas = await self.Module();

        xatlas.createAtlas();
        geometries.forEach(addMesh.bind(null, xatlas));
        xatlas.generateAtlas({
            ...params,
            onProgress(stage, progress) {
                self.postMessage({
                    type: 'progress',
                    stage: stages[stage],
                    progress: progress / 100
                });
            }
        });
        geometries.forEach(updateMesh.bind(null, xatlas));
        xatlas.destroyAtlas();

        self.postMessage({ type: 'done', result: geometries });
    } catch (e) {
        self.postMessage({ type: 'error', error: e });
    }
}

function addMesh(xatlas, geomInfo) {
    const { index, attributes} = geomInfo;
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

function updateMesh(xatlas, geom) {
    const meshData = xatlas.getMeshData(geom.atlasMeshId);
    const { index, attributes } = geom;
    const originalIndexArray = new Uint32Array(
        xatlas.HEAPU8.buffer,
        meshData.originalIndexOffset,
        meshData.newVertexCount
    );
    for (const name in attributes) {
        const attr = attributes[name];
        const ArrayType = attr.array.constructor;
        const newArray = new ArrayType(meshData.newVertexCount * attr.itemSize);
        for (let i = 0; i < meshData.newVertexCount; i += 1) {
            const idx = i * attr.itemSize;
            const idx_src = originalIndexArray[i] * attr.itemSize;
            for (let j = 0; j < attr.itemSize; j += 1) {
                newArray[idx + j] = attr.array[idx_src + j];
            }
        }
        attributes[name] = new THREE.BufferAttribute(newArray, attr.itemSize, attr.normalized);
    }
    const uv2_src = new Float32Array(
        xatlas.HEAPU8.buffer,
        meshData.uvOffset,
        meshData.newVertexCount * 2
    );
    const uv2 = new Float32Array(meshData.newVertexCount * 2);
    uv2.set(uv2_src);
    geom.attributes.uv2 = new THREE.BufferAttribute(uv2, 2);
    if (!geom.attributes.uv) {
        geom.attributes.uv = geom.attributes.uv2;
    }
    const tgtIndex = new Uint32Array(
        xatlas.HEAPU8.buffer,
        meshData.indexOffset,
        index.array.length
    );
    index.array.set(tgtIndex);
}
