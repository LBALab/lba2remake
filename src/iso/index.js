import async from 'async';
import THREE from 'three';
import {loadHqrAsync} from '../hqr';
import {loadBricks} from './bricks';
import {loadGrid} from './grid';

export function loadIsometricScenery(entry, callback) {
    async.auto({
        ress: loadHqrAsync('RESS.HQR'),
        bkg: loadHqrAsync('LBA_BKG.HQR')
    }, function (err, files) {
        const palette = new Uint8Array(files.ress.getEntry(0));
        const bricks = loadBricks(files.bkg);
        const grid = loadGrid(files.bkg, bricks, palette, entry + 1);

        const geometries = {
            positions: [],
            uvs: []
        };
        let c = 0;
        for (let z = 0; z < 64; ++z) {
            for (let x = 0; x < 64; ++x) {
                grid.cells[c].build(geometries, x, z);
                c++;
            }
        }

        const bufferGeometry = new THREE.BufferGeometry();
        bufferGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(geometries.positions), 3));
        bufferGeometry.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(geometries.uvs), 2));
        const mesh = new THREE.Mesh(bufferGeometry, new THREE.MeshBasicMaterial({
            map: grid.library.texture,
            depthTest: false,
            transparent: true
        }));
        mesh.position.x = 120;
        mesh.position.y = -150;

        callback(null, {
            props: {
                startPosition: [0, 0],
                envInfo: {
                    skyColor: [0, 0, 0]
                }
            },
            threeObject: mesh,
            threeObject3D: load3DMesh(grid),
            physics: {
                getGroundHeight: () => 0
            },
            update: () => {}
        });
    });
}

function load3DMesh(grid) {
    const geometries = {
        positions: [],
        uvs: []
    };
    let c = 0;
    for (let z = 0; z < 64; ++z) {
        for (let x = 0; x < 64; ++x) {
            grid.cells[c].build3D(geometries, x, z - 1);
            c++;
        }
    }

    const bufferGeometry = new THREE.BufferGeometry();
    bufferGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(geometries.positions), 3));
    bufferGeometry.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(geometries.uvs), 2));
    const mesh = new THREE.Mesh(bufferGeometry, new THREE.MeshBasicMaterial({
        map: makeTestTexture(),
        color: 0xFFFFFFFF,
        transparent: true
    }));
    let scale = 1 / 32;
    mesh.scale.set(scale, scale, scale);
    mesh.position.set(2, 0, 0);
    mesh.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2.0);

    return mesh;
}

export function makeTestTexture() {
    const image_data = new Uint8Array(32 * 32 * 4);
    for (let y = 0; y < 32; ++y) {
        for (let x = 0; x < 32; ++x) {
            const idx = y * 32 + x;
            if (y == 0 || x == 0 || y == 31 || x == 31) {
                image_data[idx * 4] = 0xFF;
                image_data[idx * 4 + 1] = 0;
                image_data[idx * 4 + 2] = 0;
                image_data[idx * 4 + 3] = 0xFF;
            } else {
                image_data[idx * 4] = 0;
                image_data[idx * 4 + 1] = 0;
                image_data[idx * 4 + 2] = 0;
                image_data[idx * 4 + 3] = 0x0F;
            }
        }
    }
    const texture = new THREE.DataTexture(
        image_data,
        32,
        32,
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
    return texture;
}