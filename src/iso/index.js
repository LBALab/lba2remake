import * as THREE from 'three';
import {loadHqr} from '../hqr.ts';
import {loadBricks} from './bricks';
import {loadGrid} from './grid';
import {processCollisions} from './physics';
import brick_vertex from './shaders/brick.vert.glsl';
import brick_fragment from './shaders/brick.frag.glsl';

export function loadIsometricScenery(renderer, entry, callback) {
    loadIsometricSceneryAsync(renderer, entry)
        .then(isoScenery => callback(null, isoScenery));
}

async function loadIsometricSceneryAsync(renderer, entry) {
    const [ress, bkg] = await Promise.all([
        loadHqr('RESS.HQR'),
        loadHqr('LBA_BKG.HQR')
    ]);
    const palette = new Uint8Array(ress.getEntry(0));
    const bricks = loadBricks(bkg);
    const grid = loadGrid(bkg, bricks, palette, entry + 1);

    return {
        props: {
            startPosition: [0, 0],
            envInfo: {
                skyColor: [0, 0, 0]
            }
        },
        threeObject: loadMesh(renderer, grid, entry),
        physics: {
            processCollisions: processCollisions.bind(null, grid)
        },

        /* @inspector(locate) */
        update: () => {}
    };
}

function loadMesh(renderer, grid, entry) {
    const geometries = {
        positions: [],
        centers: [],
        tiles: []
    };
    let c = 0;
    for (let z = 0; z < 64; z += 1) {
        for (let x = 0; x < 64; x += 1) {
            grid.cells[c].build(geometries, x, z - 1);
            c += 1;
        }
    }

    const bufferGeometry = new THREE.BufferGeometry();
    bufferGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(geometries.positions), 3));
    bufferGeometry.addAttribute('center', new THREE.BufferAttribute(new Float32Array(geometries.centers), 3));
    bufferGeometry.addAttribute('tile', new THREE.BufferAttribute(new Float32Array(geometries.tiles), 2));
    const {width, height} = grid.library.texture.image;
    const mesh = new THREE.Mesh(bufferGeometry, new THREE.RawShaderMaterial({
        vertexShader: brick_vertex,
        fragmentShader: brick_fragment,
        transparent: true,
        uniforms: {
            library: {value: grid.library.texture},
            tileSize: {value: new THREE.Vector2(48 / width, 38 / height)},
            pixelSize: {value: 1.0 / renderer.pixelRatio()},
            offset: {value: renderer.cameras.isoCamera.offset},
            size: {value: renderer.cameras.isoCamera.size},
        }
    }));

    const scale = 1 / 32;
    mesh.scale.set(scale, scale, scale);
    mesh.position.set(2, 0, 0);
    mesh.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2.0);
    mesh.frustumCulled = false;
    mesh.name = `scenery_iso_${entry}`;

    return mesh;
}
