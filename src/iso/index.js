import async from 'async';
import THREE from 'three';
import {loadHqrAsync} from '../hqr';
import {loadBricks} from './bricks';
import {loadGrid} from './grid';

export function loadIsometricGrid(entry, callback) {
    async.auto({
        ress: loadHqrAsync('RESS.HQR'),
        bkg: loadHqrAsync('LBA_BKG.HQR')
    }, function (err, files) {
        const palette = new Uint8Array(files.ress.getEntry(0));
        const bricks = loadBricks(files.bkg);
        const grid = loadGrid(files.bkg, bricks, palette, entry);

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

        const threeObject = new THREE.Object3D();
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
        threeObject.add(mesh);

        callback({
            threeObject: threeObject,
            physics: {
                getGroundHeight: () => 0
            },
            update: () => {}
        });
    });
}
