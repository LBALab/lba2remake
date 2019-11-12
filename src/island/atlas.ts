import * as THREE from 'three';
import {each, find} from 'lodash';

export function createTextureAtlas({files: {ile}, palette}, uvGroups) {
    const rawTexture = new Uint8Array(ile.getEntry(2));

    const fittedGroups = {
        '0,0,255,255': {
            x: 0,
            y: 0,
            width: 256,
            height: 256,
            tgt: [0, 0, 256, 256]
        }
    };
    let dim = 512;
    const fit = (width, height) => {
        let tgtGroup = null;
        for (let y = 0; y + height < dim; y += 8) {
            for (let x = 0; x + width < dim; x += 8) {
                const found = find(fittedGroups, g => !(
                    x + width <= g.x ||
                    y + height <= g.y ||
                    x >= g.x + g.width ||
                    y >= g.y + g.height
                ));
                if (!found) {
                    tgtGroup = {
                        x,
                        y,
                        width,
                        height
                    };
                    break;
                }
            }
            if (tgtGroup) {
                break;
            }
        }
        return tgtGroup;
    };
    each(uvGroups, (group) => {
        const key = group.join(',');
        if (key !== '0,0,255,255') {
            const width = (group[2] + 1) * 2;
            const height = (group[3] + 1) * 2;
            let tgtGroup = null;
            do {
                tgtGroup = fit(width, height);
                if (!tgtGroup) {
                    dim *= 2;
                }
            } while (!tgtGroup);
            tgtGroup.tgt = [
                tgtGroup.x + (width / 4),
                tgtGroup.y + (height / 4),
                group[2] + 1,
                group[3] + 1
            ];
            fittedGroups[key] = tgtGroup;
        }
    });

    const texture = createAtlasTexture(dim);
    each(fittedGroups, (g, key) => {
        if (key === '0,0,255,255') {
            copySubImage(
                texture.image,
                rawTexture,
                palette,
                0, 0, 256, 256,
                g.x, g.y
            );
        } else {
            const [x, y, width, height] = key.split(',').map((v, idx) => Number(v) + Math.floor(idx / 2));
            copySubImage(
                texture.image,
                rawTexture,
                palette,
                x, y, width, height,
                g.x + (g.width / 4), g.y + (g.height / 4)
            );
            // left
            copySubImage(
                texture.image,
                rawTexture,
                palette,
                x + (width / 2), y, width / 2, height,
                g.x, g.y + (g.height / 4)
            );
            // right
            copySubImage(
                texture.image,
                rawTexture,
                palette,
                x, y, width / 2, height,
                g.x + (3 * (g.width / 4)), g.y + (g.height / 4)
            );
            // top
            copySubImage(
                texture.image,
                rawTexture,
                palette,
                x, y + (height / 2), width, height / 2,
                g.x + (g.width / 4), g.y
            );
            // bottom
            copySubImage(
                texture.image,
                rawTexture,
                palette,
                x, y, width, height / 2,
                g.x + (g.width / 4), g.y + (3 * (g.height / 4))
            );
            // top-left
            copySubImage(
                texture.image,
                rawTexture,
                palette,
                x + (width / 2), y + (height / 2), width / 2, height / 2,
                g.x, g.y
            );
            // top-right
            copySubImage(
                texture.image,
                rawTexture,
                palette,
                x, y + (height / 2), width / 2, height / 2,
                g.x + (3 * (g.width / 4)), g.y
            );
            // bottom-left
            copySubImage(
                texture.image,
                rawTexture,
                palette,
                x + (width / 2), y, width / 2, height / 2,
                g.x, g.y + (3 * (g.height / 4))
            );
            // bottom-right
            copySubImage(
                texture.image,
                rawTexture,
                palette,
                x, y, width / 2, height / 2,
                g.x + (3 * (g.width / 4)), g.y + (3 * (g.height / 4))
            );
        }
    });

    // debugTexture(rawTexture, palette, uvGroups);
    // debugAtlas(texture, fittedGroups);
    return {
        texture,
        groups: fittedGroups
    };
}

function copySubImage(
    image,
    rawTexture,
    palette,
    srcX, srcY, width, height,
    tgtX, tgtY
) {
    for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
            const sX = srcX + x;
            const sY = srcY + y;
            const tX = tgtX + x;
            const tY = tgtY + y;
            const sIdx = (sY * 256) + sX;
            const tIdx = ((tY * image.width) + tX) * 4;
            const pIdx = rawTexture[sIdx] * 3;
            if (pIdx !== 0) {
                image.data[tIdx] = palette[pIdx];
                image.data[tIdx + 1] = palette[pIdx + 1];
                image.data[tIdx + 2] = palette[pIdx + 2];
                image.data[tIdx + 3] = 0xFF;
            }
        }
    }
}

function createAtlasTexture(dim) {
    const image_data = new Uint8Array(dim * dim * 4);
    const texture = new THREE.DataTexture(
        image_data,
        dim,
        dim,
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
    texture.anisotropy = 16;
    return texture;
}

// eslint-disable-next-line no-unused-vars
async function debugTexture(rawTexture, palette, uvGroups) {
    const canvas = document.createElement('canvas');
    canvas.id = 'debugTexture';
    canvas.width = 256;
    canvas.height = 256;
    canvas.style.position = 'fixed';
    const ctx = canvas.getContext('2d');
    const img = await loadObjImage(rawTexture, palette);
    ctx.fillStyle = 'rgb(127, 0, 223)';
    ctx.fillRect(0, 0, 256, 256);
    ctx.drawImage(img, 0, 0);
    ctx.strokeStyle = 'rgb(0, 255, 0)';
    each(uvGroups, (g) => {
        ctx.strokeRect(g[0], g[1], g[2] + 1, g[3] + 1);
    });
    const old = document.getElementById(canvas.id);
    if (old) {
        document.body.removeChild(old);
    }
    document.body.appendChild(canvas);
}

// eslint-disable-next-line no-unused-vars
async function debugAtlas({image}, fittedGroups) {
    const canvas = document.createElement('canvas');
    canvas.id = 'debugAtlas';
    canvas.width = image.width;
    canvas.height = image.height;
    canvas.style.position = 'fixed';
    canvas.style.left = 256;
    canvas.style.width = 512;
    canvas.style.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgb(127, 0, 223)';
    ctx.fillRect(0, 0, image.width, image.height);
    const arr = new Uint8ClampedArray(image.width * image.height * 4);
    for (let i = 0; i < arr.length; i += 1) {
        arr[i] = image.data[i];
    }
    const bmp = new ImageData(arr, image.width, image.height);
    const img = await createImageBitmap(bmp);
    ctx.drawImage(img, 0, 0);
    each(fittedGroups, (g, key) => {
        const d = key === '0,0,255,255' ? 1 : 2;
        const ox = key === '0,0,255,255' ? 0 : g.width / 4;
        const oy = key === '0,0,255,255' ? 0 : g.height / 4;
        ctx.strokeStyle = 'rgb(255, 0, 0)';
        ctx.strokeRect(g.x, g.y, g.width, g.height);
        ctx.strokeStyle = 'rgb(0, 255, 0)';
        ctx.strokeRect(g.x + ox, g.y + oy, g.width / d, g.height / d);
    });
    const old = document.getElementById(canvas.id);
    if (old) {
        document.body.removeChild(old);
    }
    document.body.appendChild(canvas);
}

// eslint-disable-next-line no-unused-vars
async function loadObjImage(rawTexture, palette) {
    const arr = new Uint8ClampedArray(256 * 256 * 4);
    for (let i = 0; i < 256 * 256; i += 1) {
        const idx = i * 4;
        const pIdx = rawTexture[i] * 3;
        if (pIdx === 0) {
            arr[idx + 3] = 0;
        } else {
            arr[idx] = palette[pIdx];
            arr[idx + 1] = palette[pIdx + 1];
            arr[idx + 2] = palette[pIdx + 2];
            arr[idx + 3] = 0xFF;
        }
    }
    const bmp = new ImageData(arr, 256, 256);
    return createImageBitmap(bmp);
}
