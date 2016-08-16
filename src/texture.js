import THREE from 'three';
import {map} from 'lodash';

export function loadPaletteTexture(palette) {
    const image_data = new Uint8Array(256 * 4);
    image_data[0] = 0;
    image_data[1] = 0;
    image_data[2] = 0;
    image_data[3] = 0;
    for (let i = 1; i < 256; ++i) {
        image_data[i * 4] = palette[i * 3];
        image_data[i * 4 + 1] = palette[i * 3 + 1];
        image_data[i * 4 + 2] = palette[i * 3 + 2];
        image_data[i * 4 + 3] = 0xFF;
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

export function loadTexture(buffer) {
    const pixel_data = new Uint8Array(buffer);
    let image_data = new Uint8Array(256 * 256 * 4);
    for (let x = 0; x < 256; ++x) {
        for (let y = 0; y < 256; ++y) {
            const idx = x * 256 + y;
            image_data[idx * 4] = pixel_data[idx];
            image_data[idx * 4 + 1] = 0;
            image_data[idx * 4 + 2] = 0;
            image_data[idx * 4 + 3] = 0;
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
    for (let l = 1; l <= 8; ++l) {
        const dim = Math.pow(2, 8 - l);
        image_data = loadMipmapLevelPal(image_data, l);
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

function loadMipmapLevelPal(source_data, level) {
    const dim = Math.pow(2, 8 - level);
    const tgt_data = new Uint8Array(dim * dim * 4);
    for (let y = 0; y < dim; ++y) {
        for (let x = 0; x < dim; ++x) {
            const values = [
                source_data[((y * 2) * dim * 2 + x * 2) * 4],
                source_data[((y * 2) * dim * 2 + x * 2 + 1) * 4],
                source_data[((y * 2 + 1) * dim * 2 + x * 2) * 4],
                source_data[((y * 2 + 1) * dim * 2 + x * 2 + 1) * 4],
            ];
            const colors = map(values, v => Math.floor(v / 16));
            const intensities = map(values, v => v % 16);
            const idx = y * dim + x;
            const intensity = (intensities[0] + intensities[1] + intensities[2] + intensities[3]) / 4;
            const colorMap = {};
            for (let i = 0; i < 4; ++i) {
                colorMap[colors[i]] = colorMap[colors[i]] ? colorMap[colors[i]] + 1 : 1;
            }
            let max = 0;
            let c = 0;
            for (let i = 0; i < 4; ++i) {
                if (colorMap[colors[i]] > max) {
                    c = colors[i];
                    max = colorMap[colors[i]];
                }
            }
            tgt_data[idx * 4] = c * 16 + (c ? intensity : 0);
            tgt_data[idx * 4 + 1] = 0;
            tgt_data[idx * 4 + 2] = 0;
            tgt_data[idx * 4 + 3] = 0;
        }
    }
    return tgt_data;
}

export function loadSubTexture(buffer, palette, x_offset, y_offset, width, height) {
    const pixel_data = new Uint8Array(buffer);
    const image_data = new Uint8Array(width * height * 4);
    for (let y = 0; y < height; ++y) {
        for (let x = 0; x < width; ++x) {
            const src_i = (y + y_offset) * 256 + x + x_offset;
            const tgt_i = y * width + x;
            image_data[tgt_i * 4] = palette[pixel_data[src_i] * 3];
            image_data[tgt_i * 4 + 1] = palette[pixel_data[src_i] * 3 + 1];
            image_data[tgt_i * 4 + 2] = palette[pixel_data[src_i] * 3 + 2];
            image_data[tgt_i * 4 + 3] = 0xFF;
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
