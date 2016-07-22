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
        THREE.LinearFilter
    );
    texture.needsUpdate = true;
    texture.generateMipmaps = false;
    return texture;
}
