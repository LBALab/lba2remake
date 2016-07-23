import THREE from 'three';
import DeviceOrientationControls from './controls/DeviceOrientationControls';
import OrbitControls from './controls/OrbitControls';
import SyncServer from './controls/SyncServer';
import StereoEffect from './effects/StereoEffect';
import loadIsland from './island';

const islands = [
    {name: 'CITADEL', skyColor: [0.0, 0.0, 0.0], skyIndex: 12, fogDistance: 800},
    {name: 'CITABAU', skyColor: [0.51, 0.71, 0.84], skyIndex: 14, fogDistance: 1600},
    {name: 'DESERT', skyColor: [0.51, 0.71, 0.84], skyIndex: 14, fogDistance: 1600},
    {name: 'EMERAUDE', skyColor: [0.0, 0.07, 0.10], skyIndex: 15, fogDistance: 800},
    {name: 'OTRINGAL', skyColor: [0.45, 0.41, 0.48], skyIndex: 17, fogDistance: 800},
    {name: 'KNARTAS', skyColor: [0.45, 0.41, 0.48], skyIndex: 17, fogDistance: 800},
    {name: 'ILOTCX', skyColor: [0.45, 0.41, 0.48], skyIndex: 17, fogDistance: 800},
    {name: 'CELEBRAT', skyColor: [0.45, 0.41, 0.48], skyIndex: 17, fogDistance: 800},
    {name: 'ASCENCE', skyColor: [0.45, 0.41, 0.48], skyIndex: 17, fogDistance: 800},
    {name: 'MOSQUIBE', skyColor: [0.44, 0.0, 0.0], skyIndex: 18, fogDistance: 1000},
    {name: 'PLATFORM', skyColor: [0.44, 0.0, 0.0], skyIndex: 18, fogDistance: 1000},
    {name: 'SOUSCELB', skyColor: [0.44, 0.0, 0.0], skyIndex: 18, fogDistance: 1000}
];

let index = 0;

SyncServer.init('192.168.0.19:8081');

export default class Renderer {
    constructor(width, height, container) {
        this.clock = new THREE.Clock();

        // Camera init
        this.camera = new THREE.PerspectiveCamera(90, width / height, 0.001, 100); // 1m = 0.0625 units
        this.camera.position.x = 0;
        this.camera.position.y = 0.1;
        this.camera.position.z = 1;
        this.camera.lookAt(this.camera.position);

        // Scene
        this.scene = new THREE.Scene();

        // Renderer init
        this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: false});
        this.renderer.setClearColor(0x000000);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(width, height);
        this.renderer.autoClear = false;

        this.renderer.domElement.style.position = 'absolute';
        this.renderer.domElement.style.left = 0;
        this.renderer.domElement.style.top = 0;
        this.renderer.domElement.style.opacity = 1.0;

        /*
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.target.set(
            this.camera.position.x,
            this.camera.position.y,
            this.camera.position.z + 0.0000000001
        );
        this.controls.enableZoom = false;
        this.controls.enablePan = false;
        */

        const that = this;

        SyncServer.onMsg('deviceorientation', function(orientation) {
            that.camera.quaternion.set(orientation._x, orientation._y, orientation._z, orientation._w);
        });

        function setOrientationControls(e) {
            if (!e.alpha) {
                return;
            }

            that.controls = new DeviceOrientationControls(that.camera);
            that.controls.connect();
            that.controls.update();

            that.stereoEffect = new StereoEffect(that.renderer);
            that.stereoEffect.eyeSeparation = 0.0019;
            that.stereoEffect.setSize(width, height);

            window.removeEventListener('deviceorientation', setOrientationControls, true);
        }
        window.addEventListener('deviceorientation', setOrientationControls, true);

        // Render loop
        this.animate();

        this.islandGroup = new THREE.Object3D();
        this.islandGroup.add(new THREE.Object3D);
        this.scene.add(this.islandGroup);

        window.addEventListener('keydown', this.onKeyDown.bind(this), false);
        this.refreshIsland();
    }

    onResize(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
        if (this.stereoEffect) {
            this.stereoEffect.setSize(width, height);
        }
    }

    onKeyDown(event) {
        if (event.keyCode == 78) {
            index = (index + 1) % islands.length;
            this.refreshIsland();
        }
    }

    refreshIsland() {
        loadIsland(islands[index], object => {
            console.log('Loaded: ', islands[index].name);
            this.islandGroup.children[0] = object;
        });
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        if (this.controls && this.controls.update) {
            this.controls.update(this.clock.getDelta());
        }
        this.render();
    }

    render() {
        if (this.stereoEffect)
            this.stereoEffect.render(this.scene, this.camera);
        else
            this.renderer.render(this.scene, this.camera);
    }
}
