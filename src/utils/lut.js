import * as THREE from 'three';
import convert from 'color-convert';
import { loadHqr } from '../hqr.ts';

let lutTexture = null;

export async function loadLUTTexture() {
    if (lutTexture) {
        return lutTexture;
    }
    const buffer = await loadLUTData();
    const image_data = new Uint8Array(buffer);
    const texture = new THREE.DataTexture3D(image_data, 64, 64, 64);
    texture.format = THREE.AlphaFormat;
    texture.type = THREE.UnsignedByteType;
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.needsUpdate = true;
    lutTexture = texture;
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

async function loadLUTData() {
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

export async function generateLUTTexture({onProgress, bb, useLabColors}) {
    const ress = await loadHqr('RESS.HQR');
    const palette = new Uint8Array(ress.getEntry(0));
    const buffer = new ArrayBuffer(64 * 64 * 64);
    const image_data = new Uint8Array(buffer);
    for (let r = 0; r < 64; r += 1) {
        onProgress(Math.round((r / 64) * 100));
        // eslint-disable-next-line no-await-in-loop
        await delay();
        for (let g = 0; g < 64; g += 1) {
            for (let b = 0; b < 64; b += 1) {
                const tgtIdx = nearestColor([
                    (r / (64 - 1)) * 255,
                    (g / (64 - 1)) * 255,
                    (b / (64 - 1)) * 255
                ], palette, useLabColors, bb);
                const idx = r + (64 * (g + (64 * b)));
                image_data[idx] = tgtIdx;
            }
        }
    }
    if (lutTexture) {
        lutTexture.image.data = image_data;
        lutTexture.needsUpdate = true;
    }
    return buffer;
}

async function delay() {
    return new Promise((resolve) => {
        setTimeout(resolve, 0);
    });
}

function nearestColor([r, g, b], palette, useLabColors, bb) {
    const c = useLabColors ? convert.rgb.lab(r, g, b) : [r, g, b];
    let min = Infinity;
    let minIdx = 0;
    for (let i = 0; i < 256; i += 1) {
        const x = i % 16;
        const y = Math.floor(i / 16);
        if (x < bb.xMin || x > bb.xMax || y < bb.yMin || y > bb.yMax) {
            continue;
        }
        const pr = palette[i * 3];
        const pg = palette[(i * 3) + 1];
        const pb = palette[(i * 3) + 2];
        const p = useLabColors ? convert.rgb.lab(pr, pg, pb) : [pr, pg, pb];
        const dr = p[0] - c[0];
        const dg = p[1] - c[1];
        const db = p[2] - c[2];
        const dist2 = (dr * dr) + (dg * dg) + (db * db);
        if (dist2 < min) {
            min = dist2;
            minIdx = i;
        }
    }
    return minIdx;
}
