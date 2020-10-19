import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { each, orderBy } from 'lodash';

import { compile } from '../utils/shaders';
import { WORLD_SCALE } from '../utils/lba';
import sprite_vertex from './shaders/sprite.vert.glsl';
import sprite_fragment from './shaders/sprite.frag.glsl';
import { makeStars, makeStarsMaterial } from './misc/dome_env';
import {
    getPalette,
    getSprites,
    getSpritesRaw,
    getSpritesClipInfo,
    getSpritesRawClipInfo,
    getSpritesAnim3DSClipInfo,
    getModelReplacements
} from '../resources';

const loader = new GLTFLoader();

let spriteCache = null;
let spriteRawCache = null;
const push = Array.prototype.push;

export async function loadSprite(
    index,
    hasSpriteAnim3D = false,
    isBillboard = false,
    is3DCam = false,
) {
    const palette = await getPalette();
    // // lets keep it with two separate textures for now
    if (!spriteCache) {
        const sprites = await getSprites();
        spriteCache = loadSpritesMapping(sprites, palette);
    }
    if (!spriteRawCache) {
        const sprites = await getSpritesRaw();
        spriteRawCache = loadSpritesMapping(sprites, palette);
    }
    const cache = (index < 100) ? spriteRawCache : spriteCache;

    const clipInfo = hasSpriteAnim3D ?
        await getSpritesAnim3DSClipInfo() :
        (index < 100 ? await getSpritesRawClipInfo() : await getSpritesClipInfo());
    let box = clipInfo[index];

    if (!box) {
        // TODO LBA1 set default sprite box
        box = {xMin: 0, xMax: 0, yMin: 0, yMax: 0, zMin: 0, zMax: 0};
    }

    const {xMin, xMax, yMin, yMax, zMin, zMax} = box;

    let threeObject;
    let update = (_time) => {};
    const { sprites: replacements } = await getModelReplacements();
    if (replacements && index in replacements) {
        const replacement = await loadSpriteReplacement(replacements[index]);
        threeObject = replacement.threeObject;
        update = replacement.update;
    } else if (isBillboard) {
        threeObject = loadBillboardSprite(index, cache, is3DCam);
    } else {
        threeObject = loadMesh(index, cache, box);
    }
    return {
        box,
        boundingBox: new THREE.Box3(
            new THREE.Vector3(xMin, yMin, zMin).multiplyScalar(WORLD_SCALE),
            new THREE.Vector3(xMax, yMax, zMax).multiplyScalar(WORLD_SCALE)
        ),
        boundingBoxDebugMesh: null,

        props: cache.spritesMap[index],
        threeObject,
        update
    };
}

function loadMesh(index, sprite, box) {
    const s = sprite.spritesMap[index];
    const xMajor = (box.xMax - box.xMin) > (box.zMax - box.zMin);
    const vertices = xMajor
        ? [
            [box.xMax * WORLD_SCALE, box.yMin * WORLD_SCALE, 0],
            [box.xMin * WORLD_SCALE, box.yMin * WORLD_SCALE, 0],
            [box.xMin * WORLD_SCALE, box.yMax * WORLD_SCALE, 0],
            [box.xMax * WORLD_SCALE, box.yMax * WORLD_SCALE, 0]
        ]
        : [
            [0, box.yMin * WORLD_SCALE, box.zMin * WORLD_SCALE],
            [0, box.yMin * WORLD_SCALE, box.zMax * WORLD_SCALE],
            [0, box.yMax * WORLD_SCALE, box.zMax * WORLD_SCALE],
            [0, box.yMax * WORLD_SCALE, box.zMin * WORLD_SCALE]
        ];
    const baseUvs = xMajor
        ? [
            [
                s.u,
                (s.v + s.h)
            ],
            [
                s.u + s.w,
                (s.v + s.h) - (s.w / 2)
            ],
            [
                s.u + s.w,
                s.v
            ],
            [
                s.u,
                s.v + (s.w / 2)
            ]
        ]
        : [
            [
                s.u,
                (s.v + s.h) - (s.w / 2)
            ],
            [
                s.u + s.w,
                s.v + s.h
            ],
            [
                s.u + s.w,
                s.v + (s.w / 2)
            ],
            [
                s.u,
                s.v
            ]
        ];
    const uvs = baseUvs.map(([u, v]) => [u / sprite.width, v / sprite.height]);
    const geometries = {
        positions: [],
        uvs: []
    };

    const addVertex = (j) => {
        push.apply(geometries.positions, vertices[j]);
        push.apply(geometries.uvs, uvs[j]);
    };

    // faces
    each([0, 1, 2], (j) => {
        addVertex(j);
    });
    each([0, 2, 3], (j) => {
        addVertex(j);
    });

    const bufferGeometry = new THREE.BufferGeometry();
    bufferGeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array(geometries.positions), 3)
    );
    bufferGeometry.setAttribute(
        'uv',
        new THREE.BufferAttribute(new Float32Array(geometries.uvs), 2)
    );
    const mesh = new THREE.Mesh(bufferGeometry, new THREE.RawShaderMaterial({
        vertexShader: compile('vert', sprite_vertex),
        fragmentShader: compile('frag', sprite_fragment),
        transparent: true,
        uniforms: {
            uTexture: {value: sprite.texture},
        },
        side: THREE.DoubleSide,
        depthTest: true,
        wireframe: false
    }));
    mesh.name = 'Sprite';
    return mesh;
}

function loadBillboardSprite(index, sprite, is3DCam) {
    const s = sprite.spritesMap[index];
    const { image: { data: srcImage } } = sprite.texture;

    const tgtImage = new Uint8Array(s.w * s.h * 4);

    for (let y = 0; y < s.h; y += 1) {
        for (let x = 0; x < s.w; x += 1) {
            const src_i = ((y + s.v) * sprite.width) + (x + s.u);
            const tgt_i = (y * s.w) + x;

            tgtImage[tgt_i * 4] = srcImage[src_i * 4];
            tgtImage[(tgt_i * 4) + 1] = srcImage[(src_i * 4) + 1];
            tgtImage[(tgt_i * 4) + 2] = srcImage[(src_i * 4) + 2];
            tgtImage[(tgt_i * 4) + 3] = srcImage[(src_i * 4) + 3];
        }
    }

    const texture = new THREE.DataTexture(
        tgtImage,
        s.w,
        s.h,
        THREE.RGBAFormat,
        THREE.UnsignedByteType,
        THREE.UVMapping,
        THREE.ClampToEdgeWrapping,
        THREE.ClampToEdgeWrapping,
        THREE.LinearFilter,
        THREE.LinearFilter
    );

    texture.encoding = THREE.GammaEncoding;
    texture.needsUpdate = true;
    texture.generateMipmaps = false;

    const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        rotation: THREE.MathUtils.degToRad(180)
    });

    const threeSprite = new THREE.Sprite(spriteMaterial);
    if (is3DCam) {
        threeSprite.scale.set(s.w / 75, s.h / 75, 1);
    } else {
        threeSprite.scale.set(s.w * 2, s.h * 2, 1);
    }
    threeSprite.name = 'Sprite';

    return threeSprite;
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
    each(sprites, (sprite) => {
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
        const pixels = sprite.pixels;
        for (let y = 0; y < sprite.height; y += 1) {
            for (let x = 0; x < sprite.width; x += 1) {
                const src_i = (y * sprite.width) + (sprite.width - 1 - x);
                const tgt_i = ((y + offsetY) * width) + x + offsetX;

                image_data[tgt_i * 4] = palette[pixels[src_i] * 3];
                image_data[(tgt_i * 4) + 1] = palette[(pixels[src_i] * 3) + 1];
                image_data[(tgt_i * 4) + 2] = palette[(pixels[src_i] * 3) + 2];
                image_data[(tgt_i * 4) + 3] = pixels[src_i] ? 0xFF : 0;
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

interface SpriteReplacement {
    threeObject: THREE.Object3D;
    update: (time: any) => void;
}

export async function loadSpriteReplacement({file, fx}) {
    return new Promise<SpriteReplacement>((resolve) => {
        loader.load(`models/sprites/${file}`, async (m) => {
            let glow;
            if (fx === 'glow') {
                glow = makeStars([{
                    pos: new THREE.Vector3(0, 0.18, 0),
                    intensity: 0.65,
                    tint: 0.5,
                    size: 0.3,
                    sparkle: 0
                }], await makeStarsMaterial());
                glow.renderOrder = 1;
                m.scene.add(glow);
            }
            resolve({
                threeObject: m.scene,
                update: (time) => {
                    if (glow) {
                        const material = glow.material;
                        material.uniforms.time.value = time.elapsed;
                    }
                }
            });
        });
    });
}
