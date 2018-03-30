import async from 'async';
import * as THREE from 'three';
import {each, orderBy} from 'lodash';
import {bits} from '../utils';
import {loadHqrAsync} from '../hqr';
import sprite_vertex from './shaders/sprite.vert.glsl';
import sprite_fragment from './shaders/sprite.frag.glsl';

const push = Array.prototype.push;

let spriteCache = null;
let spriteRawCache = null;

export function loadSprite(index, callback) {
    async.auto({
        ress: loadHqrAsync('RESS.HQR'),
        sprites: loadHqrAsync('SPRITES.HQR'),
        spritesRaw: loadHqrAsync('SPRIRAW.HQR')
    }, (err, files) => {
        const palette = new Uint8Array(files.ress.getEntry(0));
        // lets keep it with two separate textures for now
        if (!spriteCache) {
            const sprites = loadAllSprites(files.sprites);
            spriteCache = loadSpritesMapping(sprites, palette);
        }
        if (!spriteRawCache) {
            const sprites = loadAllSpritesRaw(files.spritesRaw);
            spriteRawCache = loadSpritesMapping(sprites, palette);
        }
        callback({
            threeObject: loadMesh(index, (index < 100) ? spriteRawCache : spriteCache)
        });
    });
}

function loadMesh(index, sprite) {
    const s = sprite.spritesMap[index];
    const vertices = [
        [0, 0, 0],
        [s.w, 0, 0],
        [s.w, s.h, 0],
        [0, s.h, 0]
        /*
        [-s.w/2, -s.h/2, 0],
        [s.w/2,  -s.h/2, 0],
        [s.w/2,   s.h/2, 0],
        [-s.w/2,  s.h/2, 0]
         */
    ];
    const uvs = [
        [
            s.u / sprite.width,
            (s.v / sprite.height) + (s.h / sprite.height)
        ],
        [
            (s.u / sprite.width) + (s.w / sprite.width),
            (s.v / sprite.height) + (s.h / sprite.height)
        ],
        [
            (s.u / sprite.width) + (s.w / sprite.width),
            s.v / sprite.height
        ],
        [
            s.u / sprite.width,
            s.v / sprite.height
        ]
    ];
    const geometries = {
        positions: [],
        uvs: []
    };

    const addVertex = (j) => {
        push.apply(geometries.positions, vertices[j]);
        push.apply(geometries.uvs, uvs[j]);
    };

    // faces
    for (const j of [0, 1, 2]) {
        addVertex(j);
    }
    for (const j of [0, 2, 3]) {
        addVertex(j);
    }

    const bufferGeometry = new THREE.BufferGeometry();
    bufferGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(geometries.positions), 3));
    bufferGeometry.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(geometries.uvs), 2));
    const mesh = new THREE.Mesh(bufferGeometry, new THREE.RawShaderMaterial({
        vertexShader: sprite_vertex,
        fragmentShader: sprite_fragment,
        transparent: true,
        uniforms: {
            texture: {value: sprite.texture},
        },
        side: THREE.DoubleSide,
        depthTest: true,
        wireframe: false
    }));

    const scale = 1 / 1024;
    mesh.scale.set(scale, scale, scale);
    mesh.frustumCulled = true;

    const object = new THREE.Object3D();
    object.add(mesh);

    object.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), 3 * (Math.PI / 4.0));
    return object;
}
export function loadAllSprites(spriteFile) {
    const sprites = [];
    for (let i = 0; i < 425; i += 1) {
        sprites.push(loadSpriteData(spriteFile, i));
    }
    return sprites;
}

export function loadAllSpritesRaw(spriteFile) {
    const sprites = [];
    for (let i = 0; i < 111; i += 1) {
        sprites.push(loadSpriteRawData(spriteFile, i));
    }
    return sprites;
}

function loadSpriteData(sprites, entry) {
    const dataView = new DataView(sprites.getEntry(entry));
    const width = dataView.getUint8(8);
    const height = dataView.getUint8(9);
    const offsetX = dataView.getUint8(10);
    const offsetY = dataView.getUint8(11);
    const buffer = new ArrayBuffer(width * height);
    const pixels = new Uint8Array(buffer);
    let ptr = 12;
    for (let y = 0; y < height; y += 1) {
        const numRuns = dataView.getUint8(ptr);
        ptr += 1;
        let x = 0;
        const offset = () => (y + offsetY) * width + x + offsetX;
        for (let run = 0; run < numRuns; run += 1) {
            const runSpec = dataView.getUint8(ptr);
            ptr += 1;
            const runLength = bits(runSpec, 0, 6) + 1;
            const type = bits(runSpec, 6, 2);
            if (type === 2) {
                const color = dataView.getUint8(ptr);
                ptr += 1;
                for (let i = 0; i < runLength; i += 1) {
                    pixels[offset()] = color;
                    x += 1;
                }
            } else if (type === 1 || type === 3) {
                for (let i = 0; i < runLength; i += 1) {
                    pixels[offset()] = dataView.getUint8(ptr);
                    ptr += 1;
                    x += 1;
                }
            } else {
                x += runLength;
            }
        }
    }
    return {
        width,
        height,
        offsetX,
        offsetY,
        pixels,
        index: entry
    };
}


function loadSpriteRawData(sprites, entry) {
    const dataView = new DataView(sprites.getEntry(entry));
    const width = dataView.getUint8(8);
    const height = dataView.getUint8(9);
    const buffer = new ArrayBuffer(width * height);
    const pixels = new Uint8Array(buffer);
    let ptr = 12;
    for (let y = 0; y < height; y += 1) {
        let x = 0;
        const offset = () => (y) * width + x;
        for (let run = 0; run < width; run += 1) {
            pixels[offset()] = dataView.getUint8(ptr);
            ptr += 1;
            x += 1;
        }
    }
    return {
        width,
        height,
        offsetX: 0,
        offsetY: 0,
        pixels,
        index: entry
    };
}

export function loadSpritesMapping(sprites, palette) {
    const spritesMap = {};
    const width = 2048;
    const height = 2048;
    const image_data = new Uint8Array(width * height * 4);
    let h = 0;
    let w = 0;
    let maxH = 0;
    sprites = orderBy(sprites, ['height'], ['desc']);
    each(sprites, (sprite, idx) => {
        if (maxH < sprite.height) {
            maxH = sprite.height;
        }
        if (w + sprite.width > width) {
            w = 0;
            h += maxH;
        }
        const offsetX = w + sprite.offsetX;
        const offsetY = h + sprite.offsetY;
        w += sprite.width;
        spritesMap[sprite.index] = {
            w: sprite.width,
            h: sprite.height,
            u: offsetX,
            v: offsetY
        };
        const pixels = sprites[idx].pixels;
        for (let y = 0; y < sprite.height; y += 1) {
            for (let x = 0; x < sprite.width; x += 1) {
                const src_i = y * sprite.width + (sprite.width - 1 - x);
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
        width,
        height,
        texture,
        spritesMap
    };
}
