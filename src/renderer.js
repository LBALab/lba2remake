import THREE from 'three';
import OrbitControls from './controls/OrbitControls';
import island from './island';
import model from './model';

const islands = [
    'CITADEL',
    'CITABAU',
    'DESERT',
    'OTRINGAL',
    'KNARTAS',
    'ASCENCE',
    'CELEBRA2',
    'CELEBRAT',
    'ILOTCX',
    'MOSQUIBE',
    'PLATFORM',
    'SOUSCELB',
    'MOON',
    'EMERAUDE'
];

let index = 2;
let current;

export default class Renderer {
    constructor(width, height) {
        this.clock = new THREE.Clock();

        // Camera init
        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.03, 100);
        this.camera.position.x = 0;
        this.camera.position.y = 2;
        this.camera.position.z = 8;
        this.camera.lookAt(new THREE.Vector3());
        this.camera.zoom = 70; //TODO remove this piece when merged into master branch

        // Scene
        this.scene = new THREE.Scene();

        // Renderer init
        this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: false});
        this.renderer.setClearColor(0xffffff);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(width, height);
        this.renderer.autoClear = false;

        this.renderer.domElement.style.position = 'absolute';
        this.renderer.domElement.style.left = 0;
        this.renderer.domElement.style.top = 0;
        this.renderer.domElement.style.opacity = 1.0;

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.zoomSpeed = 2.0;

        // Render loop
        this.animate();

        model(index, (object) => {
            current = object;
            this.scene.add(object);
        });
        // island(islands[index], (object) => {
        //     current = object;
        //     this.scene.add(object);
        // });

        window.addEventListener('keydown', this.onKeyDown.bind(this), false);
    }

    onResize(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    onKeyDown(event) {
        if (event.keyCode == 78) {
            index = (index + 1)
            model(index, (object) => {
                this.scene.remove(current);
                current = object;
                this.scene.add(object);
            });
            // index = (index + 1) % islands.length;
            // island(islands[index], (object) => {
            //     console.log('Loaded: ', islands[index]);
            //     this.scene.remove(current);
            //     current = object;
            //     this.scene.add(object);
            // });
        }
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.render();
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}
