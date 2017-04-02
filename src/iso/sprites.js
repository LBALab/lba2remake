import async from 'async';
import THREE from 'three';
import {map, each, range} from 'lodash';

const push = Array.prototype.push;

import {bits} from '../utils';
import {loadHqrAsync} from '../hqr';
import sprite_vertex from './shaders/sprite.vert.glsl';
import sprite_fragment from './shaders/sprite.frag.glsl';

let spriteCache = null;

export function loadSprite(index, renderer, callback) {
    async.auto({
        ress: loadHqrAsync('RESS.HQR'),
        sprites: loadHqrAsync('SPRITES.HQR')
    }, function (err, files) {
        if (!spriteCache) {
            const palette = new Uint8Array(files.ress.getEntry(0));
            const sprites = loadAllSprites(files.sprites);
            spriteCache = loadSpritesMapping(sprites, palette);
        }
        callback({
            threeObject: loadMesh(index, spriteCache, renderer)
        });
    });
}

function loadMesh(index, sprite, renderer) {
    /*const geometry = new THREE.PlaneGeometry(sprite.spritesMap[index].w, sprite.spritesMap[index].h, 1, 1);
    const material = new THREE.MeshBasicMaterial( { map : sprite.texture });
    const mesh = new THREE.Mesh(geometry, material);
    return mesh;*/
    const s = sprite.spritesMap[index];
    const vertices = [
        [-0.5, -0.5, 0],
        [0.5,  -0.5, 0],
        [0.5,   0.5, 0],
        [-0.5,  0.5, 0]
    ];
    const uvs = [
        [0,   0],
        [1,   0],
        [1,   1],
        [0,   1]
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
    for (let j of [0, 1, 2]) {
        addVertex(j);
    }
    for (let j of [0, 2, 3]) {
        addVertex(j);
    }

    const bufferGeometry = new THREE.BufferGeometry();
    bufferGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(geometries.positions), 3));
    bufferGeometry.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(geometries.uvs), 2));
    const {width, height} = sprite.texture.image;
    const mesh = new THREE.Mesh(bufferGeometry, new THREE.RawShaderMaterial({
        vertexShader: sprite_vertex,
        fragmentShader: sprite_fragment,
        transparent: true,
        uniforms: {
            texture: {value: sprite.texture},
            //spriteSize: {value: new THREE.Vector2(s.w / width, s.h / height)},
            //pixelSize: {value: 1.0 / renderer.pixelRatio()},
            //offset: {value: renderer.cameras.isoCamera.offset},
            //size: {value: renderer.cameras.isoCamera.size},
        }
    }));

    let scale = 1 / 32;
    mesh.scale.set(scale, scale, scale);
    mesh.position.set(2, 0, 0);
    mesh.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2.0);
    mesh.frustumCulled = false;

    return mesh;

    /*const spriteMaterial = new THREE.SpriteMaterial( { map: sprite.texture, color: 0xffffff } );
    return new THREE.Sprite( spriteMaterial );*/
}

export function loadAllSprites(spriteFile) {
    const sprites = [];
    for (let i = 0; i < 425; ++i) {
        sprites.push(loadSpriteData(spriteFile, i));
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
    for (let y = 0; y < height; ++y) {
        const numRuns = dataView.getUint8(ptr++);
        let x = 0;
        const offset = () => (y + offsetY) * width + x + offsetX;
        for (let run = 0; run < numRuns; ++run) {
            const runSpec = dataView.getUint8(ptr++);
            const runLength = bits(runSpec, 0, 6) + 1;
            const type = bits(runSpec, 6, 2);
            if (type == 2) {
                const color = dataView.getUint8(ptr++);
                for (let i = 0; i < runLength; ++i) {
                    pixels[offset()] = color;
                    x++;
                }
            }
            else if (type == 1 || type == 3) {
                for (let i = 0; i < runLength; ++i) {
                    pixels[offset()] = dataView.getUint8(ptr++);
                    x++;
                }
            }
            else {
                x += runLength;
            }
        }
    }
    return {
        width: width,
        height: height,
        offsetX: offsetX,
        offsetY: offsetY,
        pixels: pixels
    };
}

export function loadSpritesMapping(sprites, palette) {
    const spritesMap = {};
    const width = 2048;
    const height = 2048;
    const image_data = new Uint8Array(width * height * 4);
    each(sprites, (sprite, idx) => {
        const offsetX = (idx % 21) * (sprite.width + sprite.offsetX);
        const offsetY = Math.round(idx / 21) * (sprite.height + sprite.offsetY);
        spritesMap[idx] = {
            w: sprite.width,
            h: sprite.height,
            u: offsetX,
            v: offsetY
        };
        const pixels = sprites[idx].pixels;
        for (let y = 0; y < sprite.height; ++y) {
            for (let x = 0; x < sprite.width; ++x) {
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
        width: width,
        height: height,
        texture: texture,
        spritesMap: spritesMap
    };
}
