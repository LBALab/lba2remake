import * as THREE from 'three';
import convert from 'color-convert';
import { loadResource, ResourceName } from '../resources';

export const LUT_DIM = 32;
const LUT_DIM_M1 = LUT_DIM - 1;
const TEXTURE_WIDTH = 512;
const TEXTURE_HEIGHT = (LUT_DIM * LUT_DIM * LUT_DIM) / TEXTURE_WIDTH;

let lutTexture = null;
let loading = false;
let loadingCallbacks = [];

export async function loadLUTTexture() : Promise<THREE.DataTexture> {
    if (lutTexture) {
        return lutTexture;
    }
    if (loading) {
        const promise = new Promise((resolve) => {
            loadingCallbacks.push(resolve);
        });
        return promise as Promise<THREE.DataTexture>;
    }
    loading = true;
    const buffer = await loadLUTData();
    const image_data = new Uint8Array(buffer);
    const texture = new THREE.DataTexture(
        image_data,
        TEXTURE_WIDTH,
        TEXTURE_HEIGHT * 16,
        THREE.RGBAFormat,
        THREE.UnsignedByteType,
        THREE.UVMapping,
        THREE.ClampToEdgeWrapping,
        THREE.ClampToEdgeWrapping,
        THREE.NearestFilter,
        THREE.NearestFilter
    );
    texture.needsUpdate = true;
    lutTexture = texture;
    loading = false;
    loadingCallbacks.forEach((resolve) => {
        resolve(lutTexture);
    });
    loadingCallbacks = [];
    return texture;
}

export async function resetLUTTexture() {
    const buffer = await loadLUTData();
    const image_data = new Uint8Array(buffer);
    if (lutTexture) {
        lutTexture.image.data = image_data;
        lutTexture.needsUpdate = true;
    }
}

async function loadLUTData() : Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.responseType = 'arraybuffer';
        request.open('GET', 'lut.dat', true);

        request.onload = function onload() {
            if (this.status === 200) {
                resolve(request.response);
            } else {
                reject(new Error(`LUT file download failed: status=${this.status}`));
            }
        };

        request.onerror = function onerror(err) {
            reject(err);
        };

        request.send(null);
    });
}

export async function generateLUTTexture({onProgress, bbs, useLabColors}) {
    const pal = await loadResource(ResourceName.PALETTE);
    const palette = pal.getBufferUint8();
    const compPalette = useLabColors ? buildLabPalette(palette) : palette;
    const buffer = new ArrayBuffer(LUT_DIM * LUT_DIM * LUT_DIM * 16 * 4);
    const image_data = new Uint8Array(buffer);
    for (let r = 0; r < LUT_DIM; r += 1) {
        onProgress(Math.round((r / LUT_DIM) * 100));
        await delay();
        for (let g = 0; g < LUT_DIM; g += 1) {
            for (let b = 0; b < LUT_DIM; b += 1) {
                const color = getColor(useLabColors, r, g, b);
                const distribution = decompose(color, compPalette, bbs);
                for (let i = 0; i < 16; i += 1) {
                    const level = i * LUT_DIM * LUT_DIM * LUT_DIM * 4;
                    const idx = (r + (LUT_DIM * (g + (LUT_DIM * b)))) * 4;
                    const tgtColor = [0, 0, 0];
                    for (let dIdx = 0; dIdx < 256; dIdx += 1) {
                        const x = dIdx % 16;
                        const y = Math.floor(dIdx / 16);
                        const pIdx = clamp(x + (i - 12), 0, 15) + (y * 16);
                        const weight = distribution[dIdx];
                        tgtColor[0] += palette[pIdx * 3] * weight;
                        tgtColor[1] += palette[(pIdx * 3) + 1] * weight;
                        tgtColor[2] += palette[(pIdx * 3) + 2] * weight;
                    }
                    tgtColor.map(c => clamp(Math.round(c), 0, 255));
                    image_data[level + idx] = tgtColor[0];
                    image_data[level + idx + 1] = tgtColor[1];
                    image_data[level + idx + 2] = tgtColor[2];
                }
            }
        }
    }
    if (lutTexture) {
        lutTexture.image.data = image_data;
        lutTexture.needsUpdate = true;
    }
    return buffer;
}

function getColor(useLabColors, r, g, b) {
    if (useLabColors) {
        return convert.rgb.lab(
            (r / LUT_DIM_M1) * 255,
            (g / LUT_DIM_M1) * 255,
            (b / LUT_DIM_M1) * 255
        );
    }
    return [
        (r / LUT_DIM_M1) * 255,
        (g / LUT_DIM_M1) * 255,
        (b / LUT_DIM_M1) * 255
    ];
}

async function delay() {
    return new Promise((resolve) => {
        setTimeout(resolve, 0);
    });
}

function clamp(v, min, max) {
    return Math.max(Math.min(v, max), min);
}

function decompose(color, p, bbs) {
    const distribution = [];
    let wTotal = 0;
    for (let y = 0; y < 16; y += 1) {
        for (let x = 0; x < 16; x += 1) {
            const idx = (y * 16) + x;
            if (isAllowed(bbs, x, y)) {
                const pColor = [
                    p[idx * 3],
                    p[(idx * 3) + 1],
                    p[(idx * 3) + 2]
                ];
                const dist = Math.sqrt(distSq(color, pColor));
                const weight = 1 / (1 + Math.exp(dist * 0.2));
                distribution[idx] = weight;
                wTotal += weight;
            } else {
                distribution[idx] = 0;
            }
        }
    }
    return distribution.map(w => w / wTotal);
}

function distSq(c0, c1) {
    const dr = c1[0] - c0[0];
    const dg = c1[1] - c0[1];
    const db = c1[2] - c0[2];
    return (dr * dr) + (dg * dg) + (db * db);
}

function isAllowed(bbs, x, y) {
    for (let j = 0; j < bbs.length; j += 1) {
        const bb = bbs[j];
        if (x >= bb.xMin && x <= bb.xMax && y >= bb.yMin && y <= bb.yMax) {
            return true;
        }
    }
    return false;
}

function buildLabPalette(palette) {
    const labPalette = [];
    for (let i = 0; i < 256; i += 1) {
        const labColor = convert.rgb.lab(
            palette[i * 3],
            palette[(i * 3) + 1],
            palette[(i * 3) + 2]
        );
        labPalette[i * 3] = labColor[0];
        labPalette[(i * 3) + 1] = labColor[1];
        labPalette[(i * 3) + 2] = labColor[2];
    }
    return labPalette;
}
