import {
    map,
    filter,
    flatten,
    uniq,
    each
} from 'lodash';
import * as THREE from 'three';

export function loadBricksMapping(layouts, bricks, palette) {
    const usedBricks = filter(
        uniq(
            flatten(
                map(layouts, ({blocks}) => map(blocks, block => block.brick))
            )
        ),
        idx => idx !== 0
    );
    const bricksMap = {};
    const {width, height} = computeTextureSize(usedBricks.length);
    const image_data = new Uint8Array(width * height * 4);
    each(usedBricks, (brick, idx) => {
        const offsetX = (idx % 21) * 48;
        const offsetY = Math.round(idx / 21) * 38;
        bricksMap[brick] = {
            u: offsetX,
            v: offsetY
        };
        const pixels = bricks[brick - 1];
        for (let y = 0; y < 38; y += 1) {
            for (let x = 0; x < 48; x += 1) {
                const src_i = y * 48 + (47 - x);
                const tgt_i = (y + offsetY) * width + x + offsetX;

                image_data[tgt_i * 4] = palette[pixels[src_i] * 3];
                image_data[tgt_i * 4 + 1] = palette[pixels[src_i] * 3 + 1];
                image_data[tgt_i * 4 + 2] = palette[pixels[src_i] * 3 + 2];
                image_data[tgt_i * 4 + 3] = pixels[src_i] ? 0xFF : 0;
            }
        }
    });
    const texture = new THREE.DataTexture(
        image_data,
        width,
        height,
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
    return {
        texture,
        bricksMap
    };
}

function computeTextureSize(numBricks) {
    const dim = [512, 512];
    let idx = 1;
    const count = () => Math.floor(dim[0] / 48) * Math.floor(dim[1] / 38);
    while (count() < numBricks) {
        dim[idx] *= 2;
        idx = 1 - idx;
    }
    return {
        width: dim[0],
        height: dim[1]
    };
}
