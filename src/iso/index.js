import async from 'async';
import THREE from 'three';
import {loadHqrAsync} from '../hqr';
import {loadBricks} from './bricks';
import {loadGrid} from './grid';
import brick_vertex from './shaders/brick.vert.glsl';
import brick_fragment from './shaders/brick.frag.glsl';

export function loadIsometricScenery(entry, callback) {
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
            threeObject: loadMesh(grid),
            physics: {
                getGroundHeight: () => 0
            },
            update: () => {}
        });
    });
}

function loadMesh(grid) {
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
            window: {value: new THREE.Vector2(window.innerWidth, window.innerHeight)}
        }
    }));

    window.addEventListener('resize', () => {
        mesh.material.uniforms.window.value.set(window.innerWidth, window.innerHeight);
    });
    let scale = 1 / 32;
    mesh.scale.set(scale, scale, scale);
    mesh.position.set(2, 0, 0);
    mesh.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2.0);

    return mesh;
}
