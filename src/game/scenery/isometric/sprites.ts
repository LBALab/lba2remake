import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { each, orderBy } from 'lodash';

import { compile } from '../../../utils/shaders';
import { WORLD_SCALE } from '../../../utils/lba';
import sprite_vertex from './shaders/sprite.vert.glsl';
import sprite_fragment from './shaders/sprite.frag.glsl';
import VERT_OBJECTS_COLORED_SPRITE from './shaders/objects/colored.sprite.vert.glsl';
import FRAG_OBJECTS_COLORED from './shaders/objects/colored.frag.glsl';
import VERT_OBJECTS_TEXTURED from './shaders/objects/textured.vert.glsl';
import FRAG_OBJECTS_TEXTURED from './shaders/objects/textured.frag.glsl';
import { makeStars, makeStarsMaterial } from './misc/dome_env';
import {
    getPalette,
    getSprites,
    getSpritesRaw,
    getSpritesClipInfo,
    getSpritesRawClipInfo,
    getSpritesAnim3DSClipInfo,
    getModelReplacements,
    getAnim3DS,
    getAnim3DSInfo,
} from '../../../resources';
import { getParams } from '../../../params';
import { loadReplacementData } from './metadata/replacements';

const loader = new GLTFLoader();

let spriteCache = null;
let spriteRawCache = null;
let anim3DSCache = null;
let anim3DSInfoCache = null;
const push = Array.prototype.push;

let cachePromise = null;

async function loadCacheOnce() {
    const palette = await getPalette();
    const sprites = await getSprites();
    spriteCache = loadSpritesMapping(sprites, palette);
    const spritesRaw = await getSpritesRaw();
    spriteRawCache = loadSpritesMapping(spritesRaw, palette);
    const anims3DS = await getAnim3DS();
    anim3DSCache = loadSpritesMapping(anims3DS, palette);
    anim3DSInfoCache = await getAnim3DSInfo();
}

async function loadCache() {
    if (!cachePromise) {
        cachePromise = loadCacheOnce();
    }
    return cachePromise;
}

export async function loadSprite(
    index,
    ambience,
    hasSpriteAnim3D = false,
    isBillboard = false,
    is3DCam = false,
) {
    await loadCache();
    let cache;
    if (hasSpriteAnim3D) {
        cache = anim3DSCache;
    } else if (index < 100) {
        cache = spriteRawCache;
    } else {
        cache = spriteCache;
    }

    const clipInfo = hasSpriteAnim3D ?
        await getSpritesAnim3DSClipInfo() :
        (index < 100 ? await getSpritesRawClipInfo() : await getSpritesClipInfo());
    const box = clipInfo[index];
    const { xMin, xMax, yMin, yMax, zMin, zMax } = box;

    let threeObject;
    let update = (_time) => {};
    const { sprites: replacements } = await getModelReplacements();
    // TODO: replacements for animated sprites.
    if (!hasSpriteAnim3D && is3DCam && replacements && index in replacements) {
        if (replacements[index].hide) {
            threeObject = new THREE.Object3D();
        } else {
            const replacement = await loadSpriteReplacement(ambience, replacements[index]);
            threeObject = replacement.threeObject;
            update = replacement.update;
        }
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
    // flat - draw the sprite on the XZ plane.
    // xmajor - draw the sprite on the XY plane.
    // zmajor - draw the sprite on the YZ plane.
    // else - draw sprite on plane perpendicular to isometric camera
    //
    // The final case is a fallback and has clipping issues with the floor below. It also causes
    // distortion in 3D isometric mode due to the non-fixed camera position.
    //
    // In this final case, the y axis is stretched by the projection-corrected length of the line
    // from (0, yMax, 0) to (xMax, yMax, zMax) in order to render equivalently to a 2D billboard.
    // The 1/sqrt(3) factor here is the horizonal:vertical foreshortening in isometric projections.
    //
    // A better way of handling this might be to project the sprite on to a cuboid rather than a
    // plane but is significantly more complex.
    //
    // The tuning factors here are arbitrary and were chosen based on what gave good results in the
    // various locations on Citadel island.
    const s = sprite.spritesMap[index];
    const axisMajorThreshold = 3 / 5;   // Arbitrary tuning parameter.
    const flatThreshold = 3;            // Arbitrary tuning parameter.
    const xSize = box.xMax - box.xMin;
    const ySize = box.yMax - box.yMin;
    const zSize = box.zMax - box.xMin;
    const flat = ((xSize / ySize) > flatThreshold) && ((zSize / ySize) > flatThreshold);
    const xMajor = (xSize / (xSize + zSize)) > axisMajorThreshold;
    const zMajor = (zSize / (xSize + zSize)) > axisMajorThreshold;
    const yProj = WORLD_SCALE / Math.sqrt(3);
    const yExtra = yProj * Math.sqrt(Math.pow(xSize / 2, 2) + Math.pow(zSize / 2, 2));
    const vertices = flat
        ? [
            [box.xMax * WORLD_SCALE, 0, box.zMin * WORLD_SCALE],
            [box.xMin * WORLD_SCALE, 0, box.zMin * WORLD_SCALE],
            [box.xMin * WORLD_SCALE, 0, box.zMax * WORLD_SCALE],
            [box.xMax * WORLD_SCALE, 0, box.zMax * WORLD_SCALE],
        ]
        : xMajor
        ? [
            [box.xMax * WORLD_SCALE, box.yMin * WORLD_SCALE, 0],
            [box.xMin * WORLD_SCALE, box.yMin * WORLD_SCALE, 0],
            [box.xMin * WORLD_SCALE, box.yMax * WORLD_SCALE, 0],
            [box.xMax * WORLD_SCALE, box.yMax * WORLD_SCALE, 0]
        ]
        : zMajor
        ? [
            [0, box.yMin * WORLD_SCALE, box.zMin * WORLD_SCALE],
            [0, box.yMin * WORLD_SCALE, box.zMax * WORLD_SCALE],
            [0, box.yMax * WORLD_SCALE, box.zMax * WORLD_SCALE],
            [0, box.yMax * WORLD_SCALE, box.zMin * WORLD_SCALE]
        ]
        : [
            [box.xMax * WORLD_SCALE, box.yMin * WORLD_SCALE - yExtra, box.zMin * WORLD_SCALE],
            [box.xMin * WORLD_SCALE, box.yMin * WORLD_SCALE - yExtra, box.zMax * WORLD_SCALE],
            [box.xMin * WORLD_SCALE, box.yMax * WORLD_SCALE + yExtra, box.zMax * WORLD_SCALE],
            [box.xMax * WORLD_SCALE, box.yMax * WORLD_SCALE + yExtra, box.zMin * WORLD_SCALE]
        ];
    const baseUvs = flat
        ? [
            [
                s.u,
                s.v + s.h / 2
            ],
            [
                s.u + s.w / 2,
                s.v
            ],
            [
                s.u + s.w,
                s.v + s.h / 2
            ],
            [
                s.u + s.w / 2,
                s.v + s.h,
            ]
        ]
        : xMajor
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
        : zMajor
        ? [
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
        ]
        : [
            [
                s.u,
                s.v + s.h
            ],
            [
                s.u + s.w,
                s.v + s.h
            ],
            [
                s.u + s.w,
                s.v
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

    texture.encoding = THREE.sRGBEncoding;
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
        threeSprite.scale.set(s.w / 50, s.h / 50, 1);
    }
    threeSprite.name = 'Sprite';

    return threeSprite;
}

export function loadSpritesMapping(sprites: any[], palette) {
    const spritesMap = {};
    const width = 2048;
    const height = 2048;
    const image_data = new Uint8Array(width * height * 4);
    let h = 0;
    let w = 0;
    let maxH = 0;
    sprites = orderBy(sprites, ['height'], ['desc']);
    for (const sprite of sprites) {
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
    }
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

export async function loadSpriteReplacement(ambience, {file, fx}) {
    const data = await loadReplacementData(ambience);
    return new Promise<SpriteReplacement>((resolve) => {
        const { game } = getParams();
        loader.load(`models/${game}/sprites/${file}`, async (m) => {
            let glow;
            if (fx === 'glow') {
                glow = makeStars([{
                    pos: new THREE.Vector3(0, 0.18, 0),
                    intensity: 0.65,
                    tint: 0.5,
                    size: 0.3,
                    sparkle: 0
                }], await makeStarsMaterial());
                glow.material.name = 'keepMat_glow';
                glow.renderOrder = 1;
                m.scene.add(glow);
            }
            m.scene.traverse((node) => {
                    if (node instanceof THREE.Mesh) {
                    const material = node.material as THREE.MeshStandardMaterial;
                    if (material.name.substring(0, 8) === 'keepMat_') {
                        return;
                    }
                    const texture = node.material.map;
                    const mColor = node.material.color.clone().convertLinearToSRGB();
                    const color = new THREE.Vector4().fromArray(
                        [...mColor.toArray(), node.material.opacity]
                    );
                    node.material = new THREE.RawShaderMaterial({
                        vertexShader: compile('vert', texture
                            ? VERT_OBJECTS_TEXTURED
                            : VERT_OBJECTS_COLORED_SPRITE),
                        fragmentShader: compile('frag', texture
                            ? FRAG_OBJECTS_TEXTURED
                            : FRAG_OBJECTS_COLORED),
                        transparent: node.name.substring(0, 12) === 'transparent_',
                        uniforms: {
                            uColor: {value: color},
                            uTexture: texture && { value: texture },
                            lutTexture: {value: data.lutTexture},
                            palette: {value: data.paletteTexture},
                            light: {value: data.light},
                            uNormalMatrix: {value: new THREE.Matrix3()}
                        }
                    });
                    if (node.material.transparent) {
                        node.renderOrder = 1;
                    }
                }
            });
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

export async function loadAnim3DSInfo(index: number) {
    await loadCache();
    return anim3DSInfoCache[index];
}
