import THREE from 'three';
import DeviceOrientationControls from './controls/DeviceOrientationControls';
import OrbitControls from './controls/OrbitControls';
import StereoEffect from './effects/StereoEffect';
import island from './island';

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

let index = 0;
let current;

export default class Renderer {
    constructor(width, height, container) {
        this.clock = new THREE.Clock();

        // Camera init
        this.camera = new THREE.PerspectiveCamera(90, width / height, 0.001, 100);
        this.camera.position.x = 0;
        this.camera.position.y = 0.1;
        this.camera.position.z = 1;

        // Scene
        this.scene = new THREE.Scene();

        // Renderer init
        this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: false});
        this.renderer.setClearColor(0x000000);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(width, height);
        this.renderer.autoClear = false;

        this.stereoEffect = new StereoEffect(this.renderer);
        this.stereoEffect.eyeSeparation = 0.001;
        this.stereoEffect.setSize(width, height);

        this.renderer.domElement.style.position = 'absolute';
        this.renderer.domElement.style.left = 0;
        this.renderer.domElement.style.top = 0;
        this.renderer.domElement.style.opacity = 1.0;

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        //this.controls.rotateUp(Math.PI / 4);
        this.controls.target.set(
            this.camera.position.x + 0.1,
            this.camera.position.y,
            this.camera.position.z
        );
        this.controls.enableZoom = false;
        this.controls.enablePan = false;

        function fullscreen() {
            if (container.requestFullscreen) {
                container.requestFullscreen();
            } else if (container.msRequestFullscreen) {
                container.msRequestFullscreen();
            } else if (container.mozRequestFullScreen) {
                container.mozRequestFullScreen();
            } else if (container.webkitRequestFullscreen) {
                container.webkitRequestFullscreen();
            }
        }
        
        const that = this;
        function setOrientationControls(e) {
            if (!e.alpha) {
                return;
            }

            that.controls = new DeviceOrientationControls(that.camera);
            that.controls.connect();
            that.controls.update();

            that.renderer.domElement.addEventListener('click', fullscreen, false);

            window.removeEventListener('deviceorientation', setOrientationControls, true);
        }
        window.addEventListener('deviceorientation', setOrientationControls, true);

        // Render loop
        this.animate();

        island(islands[index], (object) => {
            current = object;
            this.scene.add(object);
        });
        window.addEventListener('keydown', this.onKeyDown.bind(this), false);
    }

    onResize(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
        this.stereoEffect.setSize(width, height);
    }

    onKeyDown(event) {
        if (event.keyCode == 78) {
            index = (index + 1) % islands.length;
            island(islands[index], (object) => {
                console.log('Loaded: ', islands[index]);
                this.scene.remove(current);
                current = object;
                this.scene.add(object);
            });
        }
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.controls.update(this.clock.getDelta());
        this.render();
    }

    render() {
        this.stereoEffect.render(this.scene, this.camera)
        //this.renderer.render(this.scene, this.camera);
    }
}
