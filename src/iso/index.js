import async from 'async';
import THREE from 'three';
import {loadHqrAsync} from '../hqr';
import {loadBricks} from './bricks';
import {loadGrid} from './grid';

export function loadIsoSceneManager() {
    const scene = {
        data: {
            update: () => {
            },
            physics: {
                getGroundHeight: () => 0
            },
            threeScene: new THREE.Object3D()
        }
    };
    let idx = 1;

    function load() {
        loadScene(idx, threeScene => {
            scene.data.threeScene = threeScene;
        });
    }

    load();

    window.addEventListener('keydown', function(event) {
        if (event.code == 'PageUp') {
            idx--;
            if (idx < 1)
                idx = 148;
            load();
        } else if (event.code == 'PageDown') {
            idx++;
            if (idx > 148) {
                idx = 1;
            }
            load();
        }
    });

    return {
        currentScene: () => scene
    }
}

export function loadScene(entry, callback) {
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

        const scene = new THREE.Scene();
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
        scene.add(mesh);

        callback(scene);
    });
}
