import async from 'async';
import THREE from 'three';
import {loadHqrAsync} from '../hqr';
import {loadBricks} from './bricks';
import {loadGrid} from './grid';
import brick_vertex from './shaders/brick.vert.glsl';
import brick_fragment from './shaders/brick.frag.glsl';

export function loadIsometricScenery(renderer, entry, callback) {
    async.auto({
        ress: loadHqrAsync('RESS.HQR'),
        bkg: loadHqrAsync('LBA_BKG.HQR')
    }, function (err, files) {
        const palette = new Uint8Array(files.ress.getEntry(0));
        const bricks = loadBricks(files.bkg);
        const grid = loadGrid(files.bkg, bricks, palette, entry + 1);

        callback(null, {
            props: {
                startPosition: [0, 0],
                envInfo: {
                    skyColor: [0, 0, 0]
                }
            },
            threeObject: loadMesh(renderer, grid),
            physics: {
                processCollisions: (scene, actor) => {
                    const position = actor.physics.position;
                    const dx = 64 - Math.floor(position.x * 32);
                    const dz = Math.floor(position.z * 32);
                    const cell = grid.cells[dx * 64 + dz];
                    let height = 0;
                    if (cell && cell.heights.length > 0) {
                        height = (cell.heights[0] + 1) / 64;
                    }
                    position.y = Math.max(height, position.y);
                },
                getGroundInfo: (x, z) => {
                    const dx = 64 - Math.floor(x * 32);
                    const dz = Math.floor(z * 32);
                    const cell = grid.cells[dx * 64 + dz];
                    let height = 0;
                    if (cell) {
                        height = cell.heights[0];
                    }
                    return (height + 1) / 64;
                }
            },
            update: () => {}
        });
    });
}

function loadMesh(renderer, grid) {
    const geometries = {
        positions: [],
        centers: [],
        tiles: []
    };
    let c = 0;
    for (let z = 0; z < 64; ++z) {
        for (let x = 0; x < 64; ++x) {
            grid.cells[c].build(geometries, x, z - 1);
            c++;
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

    let scale = 1 / 32;
    mesh.scale.set(scale, scale, scale);
    mesh.position.set(2, 0, 0);
    mesh.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2.0);
    mesh.frustumCulled = false;

    return mesh;
}
