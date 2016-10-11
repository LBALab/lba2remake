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
    loadScene(1, threeScene => {
        scene.data.threeScene = threeScene;
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
        console.log(grid);
        let idx = 53;

        function buildScene() {
            console.log('Layout: ', idx);
            const geometries = {
                positions: [],
                uvs: []
            };
            grid.library.layouts[idx].build(geometries);

            const scene = new THREE.Scene();
            const bufferGeometry = new THREE.BufferGeometry();
            bufferGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(geometries.positions), 3));
            bufferGeometry.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(geometries.uvs), 2));
            const mesh = new THREE.Mesh(bufferGeometry, new THREE.MeshBasicMaterial({
                map: grid.library.texture,
                depthTest: false,
                transparent: true
            }));
            mesh.position.x = 0.5;
            mesh.position.y = 0.5;
            scene.add(mesh);
            return scene;
        }

        callback(buildScene());

        window.addEventListener('keydown', function(event) {
            if (event.code == 'PageUp') {
                idx = idx - 1 >= 0 ? idx - 1 : grid.library.layouts.length - 1;
                callback(buildScene());
            } else if (event.code == 'PageDown') {
                idx = (idx + 1) % grid.library.layouts.length;
                callback(buildScene());
            }
        });
    });
}
