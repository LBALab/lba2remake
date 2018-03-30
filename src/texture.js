// @flow

import * as THREE from 'three';
import {map, each} from 'lodash';

export function loadPaletteTexture(palette: Uint8Array) {
    const image_data = new Uint8Array(256 * 4);
    image_data[0] = 0;
    image_data[1] = 0;
    image_data[2] = 0;
    image_data[3] = 0;
    for (let i = 1; i < 256; i += 1) {
        image_data[i * 4] = palette[i * 3];
        image_data[(i * 4) + 1] = palette[(i * 3) + 1];
        image_data[(i * 4) + 2] = palette[(i * 3) + 2];
        image_data[(i * 4) + 3] = 0xFF;
    }
    const texture = new THREE.DataTexture(
        image_data,
        16,
        16,
        THREE.RGBAFormat,
        THREE.UnsignedByteType,
        THREE.UVMapping,
        THREE.ClampToEdgeWrapping,
        THREE.ClampToEdgeWrapping,
        THREE.NearestFilter,
        THREE.NearestFilter
    );
    texture.needsUpdate = true;
    texture.generateMipmaps = false;
    return texture;
}

export function loadTexture(buffer: ArrayBuffer, palette: Uint8Array) {
    const pixel_data = new Uint8Array(buffer);
    let image_data = new Uint8Array(256 * 256 * 4);
    for (let x = 0; x < 256; x += 1) {
        for (let y = 0; y < 256; y += 1) {
            const idx = (x * 256) + y;
            image_data[idx * 4] = pixel_data[idx];
            image_data[(idx * 4) + 1] = 0;
            image_data[(idx * 4) + 2] = 0;
            image_data[(idx * 4) + 3] = 0;
        }
    }
    const texture = new THREE.DataTexture(
        null,
        256,
        256,
        THREE.RGBAFormat,
        THREE.UnsignedByteType,
        THREE.UVMapping,
        THREE.ClampToEdgeWrapping,
        THREE.ClampToEdgeWrapping,
        THREE.NearestFilter,
        THREE.NearestMipMapNearestFilter
    );
    texture.mipmaps = [{
        data: image_data,
        width: 256,
        height: 256
    }];
    for (let level = 1; level <= 8; level += 1) {
        const dim = Math.pow(2, 8 - level);
        image_data = loadMipmapLevelPal(image_data, level, palette);
        texture.mipmaps.push({
            data: image_data,
            width: dim,
            height: dim
        });
    }
    texture.needsUpdate = true;
    texture.generateMipmaps = false;
    return texture;
}

export function loadTexture2(buffer: ArrayBuffer, palette: Uint8Array) {
    const pixel_data = new Uint8Array(buffer);
    const image_data = new Uint8Array(256 * 256 * 4);
    for (let i = 0; i < 65536; i += 1) { // 256 * 256
        const idx = pixel_data[i];
        if (idx === 0) {
            image_data[i * 4] = 0;
            image_data[(i * 4) + 1] = 0;
            image_data[(i * 4) + 2] = 0;
            image_data[(i * 4) + 3] = 0;
        } else {
            image_data[i * 4] = palette[idx * 3];
            image_data[(i * 4) + 1] = palette[(idx * 3) + 1];
            image_data[(i * 4) + 2] = palette[(idx * 3) + 2];
            image_data[(i * 4) + 3] = 0xFF;
        }
    }
    const texture = new THREE.DataTexture(
        image_data,
        256,
        256,
        THREE.RGBAFormat,
        THREE.UnsignedByteType,
        THREE.UVMapping,
        THREE.RepeatWrapping,
        THREE.RepeatWrapping,
        THREE.NearestFilter,
        THREE.LinearFilter
    );
    texture.needsUpdate = true;
    texture.generateMipmaps = false;
    return texture;
}

function loadMipmapLevelPal(source_data: Uint8Array, level: number, palette: Uint8Array) {
    const dim = Math.pow(2, 8 - level);
    const tgt_data = new Uint8Array(dim * dim * 4);
    for (let y = 0; y < dim; y += 1) {
        for (let x = 0; x < dim; x += 1) {
            const idx = (y * dim) + x;
            const yd = y * dim * 4;
            const yd1 = ((y * 2) + 1) * dim * 2;
            const indices = [
                source_data[(yd + (x * 2)) * 4],
                source_data[(yd + (x * 2) + 1) * 4],
                source_data[(yd1 + (x * 2)) * 4],
                source_data[(yd1 + (x * 2) + 1) * 4],
            ];
            const colors = map(
                indices,
                i => [palette[i * 3], palette[(i * 3) + 1], palette[(i * 3) + 2], i]
            );
            tgt_data[idx * 4] = findNearestColor(palette, colors);
            tgt_data[(idx * 4) + 1] = 0;
            tgt_data[(idx * 4) + 2] = 0;
            tgt_data[(idx * 4) + 3] = 0;
        }
    }
    return tgt_data;
}

function findNearestColor(palette: Uint8Array, colors: Array< Array<number> >) {
    const sum = [0, 0, 0];
    let count = 0;
    each(colors, ([r, g, b, idx]) => {
        if (idx > 0) {
            sum[0] += r;
            sum[1] += g;
            sum[2] += b;
            count += 1;
        }
    });
    if (count === 0) {
        return 0;
    }
    const [r, g, b] = map(sum, s => s / count);
    let min = Infinity;
    let minIdx = 0;
    const sq = x => Math.pow(x, 2);
    for (let i = 16; i < 256; i += 1) {
        const pr = palette[i * 3];
        const pg = palette[(i * 3) + 1];
        const pb = palette[(i * 3) + 2];
        const dist = sq(pr - r) + sq(pg - g) + sq(pb - b);
        if (dist < min) {
            min = dist;
            minIdx = i;
        }
    }
    return minIdx;
}

export function loadSubTexture(buffer: ArrayBuffer,
                               palette: Uint8Array,
                               x_offset: number,
                               y_offset: number,
                               width: number,
                               height: number) {
    const pixel_data = new Uint8Array(buffer);
    const image_data = new Uint8Array(width * height * 4);
    for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
            const src_i = ((y + y_offset) * 256) + x + x_offset;
            const tgt_i = (y * width) + x;
            image_data[tgt_i * 4] = palette[pixel_data[src_i] * 3];
            image_data[(tgt_i * 4) + 1] = palette[(pixel_data[src_i] * 3) + 1];
            image_data[(tgt_i * 4) + 2] = palette[(pixel_data[src_i] * 3) + 2];
            image_data[(tgt_i * 4) + 3] = 0xFF;
        }
    }
    const texture = new THREE.DataTexture(
        image_data,
        width,
        height,
        THREE.RGBAFormat,
        THREE.UnsignedByteType,
        THREE.UVMapping,
        THREE.RepeatWrapping,
        THREE.RepeatWrapping,
        THREE.LinearFilter,
        THREE.LinearMipMapLinearFilter
    );
    texture.needsUpdate = true;
    texture.generateMipmaps = true;
    return texture;
}
