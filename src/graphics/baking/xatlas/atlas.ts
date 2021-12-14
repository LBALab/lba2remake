import * as THREE from 'three';
import { BakeState } from '../bake';

interface GeometryInfo {
    attributes: Record<string, THREE.BufferAttribute>;
    index: THREE.BufferAttribute;
}

interface GeomCollection {
    geom: THREE.BufferGeometry[];
    geomInfo: GeometryInfo[];
}

export async function buildAtlas(scene: THREE.Object3D, params?: BakeState) {
    const { geom, geomInfo } = collectGeometries(scene);
    const worker = new window.Worker('/xatlas-worker.js');
    let p;
    let currentStage;
    const newGeometries = await new Promise<GeometryInfo[]>((resolve, reject) => {
        worker.onmessage = (msg) => {
            const data = msg.data;
            switch (data.type) {
                case 'progress':
                    if (params?.cancelled) {
                        worker.terminate();
                        p?.cancel();
                        reject(new Error('Cancelled'));
                        return;
                    }
                    if (currentStage !== data.stage) {
                        p?.done();
                        p = params?.startProgress(data.stage);
                        currentStage = data.stage;
                    }
                    p?.progress(data.progress);
                    break;
                case 'done':
                    p?.done();
                    resolve(data.result);
                    worker.terminate();
                    break;
                case 'error':
                    reject(data.error);
                    worker.terminate();
                    break;
            }
        };
        worker.postMessage({
            geometries: geomInfo,
            params: {
                resolution: params?.textureSize,
                margin: params?.margin
            }
        });
    });
    updateGeometries(geom, newGeometries);
}

function collectGeometries(scene: THREE.Object3D): GeomCollection {
    const geom: THREE.BufferGeometry[] = [];
    const geomInfo: GeometryInfo[] = [];
    scene.traverse((node) => {
        if (node instanceof THREE.Mesh
            && (!node.material.emissive
                || node.material.emissive.getHex() === 0x000000)) {
            node.updateMatrix();
            node.updateMatrixWorld();
            if (node.geometry instanceof THREE.BufferGeometry) {
                const { attributes: gAttributes, index } = node.geometry;
                const attributes: Record<string, THREE.BufferAttribute> = {};
                for (const key in gAttributes) {
                    const attr = gAttributes[key];
                    if (attr instanceof THREE.BufferAttribute) {
                        attributes[key] = attr;
                    } else {
                        throw new Error('Unsupported: THREE.InterleavedBufferAttribute');
                    }
                }
                geomInfo.push({
                    attributes,
                    index
                });
                geom.push(node.geometry);
            }
        }
    });
    return { geom, geomInfo };
}

function updateGeometries(geometries: THREE.BufferGeometry[], newGeometries: GeometryInfo[]) {
    for (let i = 0; i < geometries.length; i += 1) {
        const { attributes, index } = geometries[i];
        const { attributes: newAttributes, index: newIndex } = newGeometries[i];
        for (const key in newAttributes) {
            attributes[key] = cloneAttribute(newAttributes[key]);
        }
        index.set(newIndex.array);
    }
}

function cloneAttribute(src: THREE.BufferAttribute): THREE.BufferAttribute {
    const attr = new THREE.BufferAttribute(src.array, src.itemSize, src.normalized);
    attr.needsUpdate = true;
    return attr;
}
