import {
    map,
    filter,
    flatten,
    uniq,
    each
} from 'lodash';
import * as THREE from 'three';

export const Side = {
    NONE: 0,
    TOP: 1,
    LEFT: 2,
    RIGHT: 3
};

export const OffsetBySide = {
    [Side.NONE]: {x: 0, y: 0},
    [Side.TOP]: {x: 2, y: 1},
    [Side.LEFT]: {x: 1, y: 3},
    [Side.RIGHT]: {x: 3, y: 3},
};

export function loadBricksMapping(renderer, params, layouts, bricks, mask, palette) {
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
    const nWidth = Math.floor(width / 52);
    each(usedBricks, (brick, idx) => {
        const offsetX = (idx % nWidth) * 52;
        const offsetY = Math.floor(idx / nWidth) * 42;
        bricksMap[brick] = {
            u: offsetX,
            v: offsetY
        };
        const pixels = bricks[brick - 1];
        for (let y = 0; y < 38; y += 1) {
            for (let x = 0; x < 48; x += 1) {
                const src_i = (y * 48) + (47 - x);
                const side = getSide(mask, src_i);
                const o = OffsetBySide[side];
                const tgt_i = ((y + offsetY + o.y) * width) + x + offsetX + o.x;

                if (side !== Side.NONE) {
                    copyPixel(image_data, pixels, palette, src_i, tgt_i);
                    if (y === 0 || getSide(mask, ((y - 1) * 48) + (47 - x)) !== side) {
                        const tgt_i1 = (((y - 1) + offsetY + o.y) * width) + x + offsetX + o.x;
                        copyPixel(image_data, pixels, palette, src_i, tgt_i1);
                    }
                    if (y === 37 || getSide(mask, ((y + 1) * 48) + (47 - x)) !== side) {
                        const tgt_i1 = (((y + 1) + offsetY + o.y) * width) + x + offsetX + o.x;
                        copyPixel(image_data, pixels, palette, src_i, tgt_i1);
                    }
                    if (x === 0 || (x === 24 && side === Side.RIGHT)) {
                        const tgt_i1 = ((y + offsetY + o.y) * width) + (x - 1) + offsetX + o.x;
                        copyPixel(image_data, pixels, palette, src_i, tgt_i1);
                    }
                    if (x === 47 || (x === 23 && side === Side.LEFT)) {
                        const tgt_i1 = ((y + offsetY + o.y) * width) + (x + 1) + offsetX + o.x;
                        copyPixel(image_data, pixels, palette, src_i, tgt_i1);
                    }
                }
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
        THREE.LinearFilter,
        THREE.LinearMipMapLinearFilter
    );
    texture.needsUpdate = true;
    texture.generateMipmaps = true;
    texture.anisotropy = 16;
    return {
        texture,
        bricksMap
    };
}

function getSide(mask, pos) {
    if (mask.data[pos * 4]) {
        return Side.TOP;
    } else if (mask.data[(pos * 4) + 1]) {
        return Side.LEFT;
    } else if (mask.data[(pos * 4) + 2]) {
        return Side.RIGHT;
    }
    return Side.NONE;
}

function copyPixel(image_data, pixels, palette, src_i, tgt_i) {
    image_data[tgt_i * 4] = palette[pixels[src_i] * 3];
    image_data[(tgt_i * 4) + 1] = palette[(pixels[src_i] * 3) + 1];
    image_data[(tgt_i * 4) + 2] = palette[(pixels[src_i] * 3) + 2];
    image_data[(tgt_i * 4) + 3] = pixels[src_i] ? 0xFF : 0;
}

function computeTextureSize(numBricks) {
    const dim = [512, 512];
    let idx = 1;
    const count = () => Math.floor(dim[0] / 52) * Math.floor(dim[1] / 42);
    while (count() < numBricks) {
        dim[idx] *= 2;
        idx = 1 - idx;
    }
    return {
        width: dim[0],
        height: dim[1]
    };
}
