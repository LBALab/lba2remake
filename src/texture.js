import THREE from 'three';

export function loadTexture(buffer, palette) {
    const texture = new THREE.DataTexture(
        loadImageData(buffer, palette),
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

const mipmapColor = [
    [0xFF, 0x0, 0x0, 0xFF],
    [0x0, 0xFF, 0x0, 0xFF],
    [0x0, 0x0, 0xFF, 0xFF],
    [0xFF, 0xFF, 0x0, 0xFF],
    [0x0, 0xFF, 0xFF, 0xFF],
    [0xFF, 0x0, 0xFF, 0xFF],
    [0xFF, 0xFF, 0xFF, 0xFF],
    [0x80, 0x80, 0x80, 0xFF]
];

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

export function loadTextureWithoutPalette(buffer) {
    const pixel_data = new Uint8Array(buffer);
    const image_data = new Uint8Array(128 * 128 * 4);
    for (let x = 0; x < 128; ++x) {
        for (let y = 0; y < 128; ++y) {
            for (let i = 0; i < 4; ++i) {
                const dx = Math.floor(i / 2);
                const dy = i % 2;
                const idx = (x * 2 + dx) * 256 + (y * 2 + dy);
                image_data[(x * 128 + y) * 4 + i] = pixel_data[idx];
            }
        }
    }
    const texture = new THREE.DataTexture(
        image_data,
        128,
        128,
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

export function loadTextureWithMipmaps(buffer, palette) {
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
        THREE.NearestMipMapLinearFilter
    );
    let image_data = loadImageData(buffer, palette);
    texture.mipmaps = [{
        data: image_data,
        width: 256,
        height: 256
    }];
    for (let l = 1; l <= 8; ++l) {
        const dim = Math.pow(2, 8 - l);
        image_data = loadMipmapLevel(image_data, l);
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

function loadMipmapLevel(source_data, level) {
    const dim = Math.pow(2, 8 - level);
    const tgt_data = new Uint8Array(dim * dim * 4);
    for (let y = 0; y < dim; ++y) {
        for (let x = 0; x < dim; ++x) {
            const average = (offset) => {
                //return mipmapColor[Math.min(level - 1, 7)][offset];
                const values = [
                    source_data[((y * 2) * dim * 2 + x * 2) * 4 + offset],
                    source_data[((y * 2) * dim * 2 + x * 2 + 1) * 4 + offset],
                    source_data[((y * 2 + 1) * dim * 2 + x * 2) * 4 + offset],
                    source_data[((y * 2 + 1) * dim * 2 + x * 2 + 1) * 4 + offset],
                ];
                return Math.round((values[0] + values[1] + values[2] + values[3]) / 4);
            };
            const idx = y * dim + x;
            tgt_data[idx * 4] = average(0);
            tgt_data[idx * 4 + 1] = average(1);
            tgt_data[idx * 4 + 2] = average(2);
            tgt_data[idx * 4 + 3] = Math.round(average(3) / 255) * 255;
        }
    }
    return tgt_data;
}

function loadImageData(buffer, palette) {
    const pixel_data = new Uint8Array(buffer);
    const image_data = new Uint8Array(256 * 256 * 4);
    for (let i = 0; i < 65536; ++i) { // 256 * 256
        const idx = pixel_data[i];
        if (idx == 0) {
            image_data[i * 4] = 0;
            image_data[i * 4 + 1] = 0;
            image_data[i * 4 + 2] = 0;
            image_data[i * 4 + 3] = 0;
        } else {
            image_data[i * 4] = palette[idx * 3];
            image_data[i * 4 + 1] = palette[idx * 3 + 1];
            image_data[i * 4 + 2] = palette[idx * 3 + 2];
            image_data[i * 4 + 3] = 0xFF;
        }
    }
    return image_data;
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
