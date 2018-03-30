import async from 'async';
import * as THREE from 'three';
import {map, each, assign, tail} from 'lodash';

import {loadHqrAsync} from '../hqr';
import {prepareGeometries} from './geometries';
import {loadLayout} from './layout';
import {loadGround} from './ground';
import {loadSea} from './sea';
import {loadObjects} from './objects';
import {loadIslandPhysics} from './physics';
import {createBoundingBox} from '../utils/rendering';

import islandsInfo from './data/islands';
import environments from './data/environments';

const islandProps = {};
each(islandsInfo, (island) => {
    islandProps[island.name] = assign({
        envInfo: environments[island.env]
    }, island);
});

const islands = {};

export function getEnvInfo(name) {
    return islandProps[name].envInfo;
}

export function loadIslandScenery(params, name, ambience, callback) {
    if (name in islands) {
        callback(null, islands[name]);
    } else {
        async.auto({
            ress: loadHqrAsync('RESS.HQR'),
            ile: loadHqrAsync(`${name}.ILE`),
            obl: loadHqrAsync(`${name}.OBL`)
        }, (err, files) => {
            const island = loadIslandNode(params, islandProps[name], files, ambience);
            islands[name] = island;
            callback(null, island);
        });
    }
}

function loadIslandNode(params, props, files, ambience) {
    const islandObject = new THREE.Object3D();
    islandObject.name = `scenery_${props.name}`;
    islandObject.matrixAutoUpdate = false;
    const layout = loadLayout(files.ile);
    const data = {
        files,
        palette: new Uint8Array(files.ress.getEntry(0)),
        layout
    };

    const geometries = loadGeometries(props, data, ambience);
    const matByName = {};
    each(geometries, ({positions, uvs, colors, intensities, normals, uvGroups, material}, name) => {
        if (positions && positions.length > 0) {
            const bufferGeometry = new THREE.BufferGeometry();
            bufferGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
            if (uvs) {
                bufferGeometry.addAttribute('uv', new THREE.BufferAttribute(new Uint8Array(uvs), 2, false));
            }
            if (colors) {
                bufferGeometry.addAttribute('color', new THREE.BufferAttribute(new Uint8Array(colors), 1, false));
            }
            if (intensities) {
                bufferGeometry.addAttribute('intensity', new THREE.BufferAttribute(new Uint8Array(intensities), 1, false));
            }
            if (normals) {
                bufferGeometry.addAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3));
            }
            if (uvGroups) {
                bufferGeometry.addAttribute('uvGroup', new THREE.BufferAttribute(new Uint8Array(uvGroups), 4, false));
            }
            const mesh = new THREE.Mesh(bufferGeometry, material);
            mesh.matrixAutoUpdate = false;
            mesh.name = name;
            matByName[name] = material;
            islandObject.add(mesh);
        }
    });

    islandObject.add(loadSky(geometries));

    const sections = {};
    let boundingBoxes = null;
    if (params.editor) {
        boundingBoxes = new THREE.Object3D();
        boundingBoxes.name = 'BoundingBoxes';
        boundingBoxes.visible = false;
        boundingBoxes.matrixAutoUpdate = false;
        islandObject.add(boundingBoxes);
    }
    each(data.layout.groundSections, (section) => {
        sections[`${section.x},${section.z}`] = section;
        if (params.editor) {
            each(section.boundingBoxes, (bb, idx) => {
                const box = createBoundingBox(bb, new THREE.Vector3(0.9, 0.9, 0.9));
                box.name = `[${section.x},${section.z}]:${idx}`;
                boundingBoxes.add(box);
            });
        }
    });

    const seaTimeUniform = islandObject.getObjectByName('sea').material.uniforms.time;

    return {
        props,
        sections: map(layout.groundSections, section => ({x: section.x, z: section.z})),
        threeObject: islandObject,
        physics: loadIslandPhysics(sections),
        update: (game, scene, time) => {
            updateShadows(scene, matByName);
            seaTimeUniform.value = time.elapsed;
        }
    };
}

function loadSky(geometries) {
    const sky = new THREE.Mesh(new THREE.PlaneGeometry(128, 128, 1, 1), geometries.sky.material);
    sky.name = 'sky';
    sky.rotateX(Math.PI / 2.0);
    sky.position.y = 2.0;
    return sky;
}

function loadGeometries(island, data, ambience) {
    const geometries = prepareGeometries(island, data, ambience);
    const usedTiles = {};
    const objects = [];

    each(data.layout.groundSections, (section) => {
        const tilesKey = [section.x, section.z].join(',');
        usedTiles[tilesKey] = [];
        loadGround(section, geometries, usedTiles[tilesKey]);
        loadObjects(data, section, geometries, objects);
    });

    each(data.layout.seaSections, (section) => {
        const xd = Math.floor(section.x / 2);
        const zd = Math.floor(section.z / 2);
        const offsetX = 1 - Math.abs(section.x % 2);
        const offsetZ = Math.abs(section.z % 2);
        const tilesKey = [xd, zd].join(',');
        loadSea(section, geometries, usedTiles[tilesKey], offsetX, offsetZ, island.envInfo.index);
    });

    return geometries;
}

const DIFF = new THREE.Vector3();
const POSITION = new THREE.Vector3();

function updateShadows(baseScene, matByName) {
    const shadows = [];
    let heroPos = null;

    function computeShadow(scene, actor) {
        if (!actor.props.flags.isSprite
            && !actor.props.flags.noShadow
            && actor.model
            && actor.isVisible) {
            const sz = actor.model.boundingBox.max.x - actor.model.boundingBox.min.x;
            POSITION.copy(actor.physics.position);
            POSITION.applyMatrix4(scene.sceneNode.matrixWorld);
            const distToHero = heroPos ? DIFF.subVectors(POSITION, heroPos).lengthSq() : 0;
            if (distToHero < 2.5) {
                shadows.push({
                    data: [POSITION.x, POSITION.z, 2.8 / sz, 1],
                    distToHero
                });
            }
        }
    }

    computeShadow(baseScene, baseScene.actors[0]);
    heroPos = POSITION.clone();
    each(tail(baseScene.actors), computeShadow.bind(null, baseScene));
    each(baseScene.sideScenes, (sideScene) => {
        each(sideScene.actors, computeShadow.bind(null, sideScene));
    });
    shadows.sort((a, b) => a.distToHero - b.distToHero);
    for (let i = 0; i < 10; i += 1) {
        const shadow = shadows[i];
        const {ground_colored, ground_textured} = matByName;
        if (shadow) {
            ground_colored && ground_colored.uniforms.actorPos.value[i].fromArray(shadow.data);
            ground_textured && ground_textured.uniforms.actorPos.value[i].fromArray(shadow.data);
        } else {
            ground_colored && (ground_colored.uniforms.actorPos.value[i].w = 0);
            ground_textured && (ground_textured.uniforms.actorPos.value[i].w = 0);
        }
    }
}
