import THREE from 'three';
import DeviceOrientationControls from './controls/DeviceOrientationControls';
import FirstPersonControls from './controls/FirstPersonControls';
import SyncServer from './controls/SyncServer';
import StereoEffect from './effects/StereoEffect';
import {loadIsland} from './island';

const islands = [
    {name: 'CITADEL', skyColor: [0.0, 0.0, 0.0], skyIndex: 11, fogDistance: 800},
    {name: 'CITABAU', skyColor: [0.51, 0.71, 0.84], skyIndex: 13, fogDistance: 1600},
    {name: 'DESERT', skyColor: [0.51, 0.71, 0.84], skyIndex: 13, fogDistance: 1600},
    {name: 'EMERAUDE', skyColor: [0.0, 0.07, 0.10], skyIndex: 14, fogDistance: 800},
    {name: 'OTRINGAL', skyColor: [0.45, 0.41, 0.48], skyIndex: 16, fogDistance: 800},
    {name: 'KNARTAS', skyColor: [0.45, 0.41, 0.48], skyIndex: 16, fogDistance: 800},
    {name: 'ILOTCX', skyColor: [0.45, 0.41, 0.48], skyIndex: 16, fogDistance: 800},
    {name: 'CELEBRAT', skyColor: [0.45, 0.41, 0.48], skyIndex: 16, fogDistance: 800},
    {name: 'ASCENCE', skyColor: [0.45, 0.41, 0.48], skyIndex: 16, fogDistance: 800},
    {name: 'MOSQUIBE', skyColor: [0.44, 0.0, 0.0], skyIndex: 17, fogDistance: 1000},
    {name: 'PLATFORM', skyColor: [0.44, 0.0, 0.0], skyIndex: 17, fogDistance: 1000},
    {name: 'SOUSCELB', skyColor: [0.44, 0.0, 0.0], skyIndex: 17, fogDistance: 1000}
];

let index = 0;

export default class Renderer {
    constructor(width, height, container) {
        this.clock = new THREE.Clock();
        this.frameCount = 0;

        // Camera init
        this.camera = new THREE.PerspectiveCamera(90, width / height, 0.001, 100); // 1m = 0.0625 units
        this.mobileCamera = new THREE.Object3D();

        this.pcCamera = new THREE.Object3D();
        this.pcCamera.position.x = 0;
        this.pcCamera.position.y = 0.08;
        this.pcCamera.position.z = 1;
        this.pcCamera.lookAt(this.camera.position);

        // Scene
        this.scene = new THREE.Scene();

        // Renderer init
        this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: false});
        this.renderer.setClearColor(0x000000);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(width, height);
        this.renderer.autoClear = true;

        this.renderer.domElement.style.position = 'absolute';
        this.renderer.domElement.style.left = 0;
        this.renderer.domElement.style.top = 0;
        this.renderer.domElement.style.opacity = 1.0;

        this.controls = new FirstPersonControls(this.pcCamera);

        const that = this;

        function setOrientationControls(e) {
            if (!e.alpha) {
                return;
            }
            
            that.pcControls = that.controls;
            that.controls = new DeviceOrientationControls(that.mobileCamera);
            that.controls.connect();
            that.controls.update();

            that.stereoEffect = new StereoEffect(that.renderer);
            that.stereoEffect.eyeSeparation = 0.0019;
            that.stereoEffect.setSize(width, height);

            window.removeEventListener('deviceorientation', setOrientationControls, true);
        }
        window.addEventListener('deviceorientation', setOrientationControls, true);

        window.addEventListener('keydown', onKeyDown, false);

        function onKeyDown(event) {
            if (event.keyCode == 78 || event.keyCode == 13) { // N | Enter
                index = (index + 1) % islands.length;
                that.refreshIsland();
            }
        }

        // Render loop
        this.animate();

        this.islandGroup = new THREE.Object3D();
        this.islandGroup.add(new THREE.Object3D);
        this.scene.add(this.islandGroup);

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

    refreshIsland() {
        loadIsland(islands[index], object => {
            console.log('Loaded: ', islands[index].name);
            this.islandGroup.children[0] = object;
            this.sea = object.getObjectByName('sea');
            const sc = islands[index].skyColor;
            const color = new THREE.Color(sc[0], sc[1], sc[2]);
            this.renderer.setClearColor(color.getHex(), 1);
        });
    }

    animate() {
        const dt = this.clock.getDelta();
        if (this.controls && this.controls.update) {
            this.controls.update(dt);
        }
        if (this.pcControls && this.pcControls.update) {
            this.pcControls.update(dt);
        }

        this.camera.position.copy(this.pcCamera.position);
        this.camera.quaternion.copy(this.pcCamera.quaternion);
        this.camera.quaternion.multiply(this.mobileCamera.quaternion);

        if (this.sea) {
            this.sea.material.uniforms.time.value = this.clock.getElapsedTime();
        }

        this.render();
        this.frameCount++;
        requestAnimationFrame(this.animate.bind(this));
    }

    render() {
        if (this.stereoEffect)
            this.stereoEffect.render(this.scene, this.camera);
        else
            this.renderer.render(this.scene, this.camera);
    }
}
