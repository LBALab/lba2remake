import THREE from 'three';

export function loadTexture(buffer, palette) {
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
        THREE.LinearMipMapLinearFilter
    );
    texture.needsUpdate = true;
    texture.generateMipmaps = true;
    return texture;
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
