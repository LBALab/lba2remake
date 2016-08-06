import THREE from 'three';
import DeviceOrientationControls from './controls/DeviceOrientationControls';
import FirstPersonControls from './controls/FirstPersonControls';
import SyncServer from './controls/SyncServer';
import StereoEffect from './effects/StereoEffect';
import {loadIsland} from './island';
import Stats from './utils/Stats';

const islands = [
    {name: 'CITADEL', skyColor: [0.0, 0.0, 0.0], skyIndex: 11, fogDensity: 0.3, pos: [0, 1]},
    {name: 'CITABAU', skyColor: [0.51, 0.71, 0.84], skyIndex: 13, fogDensity: 0.2, pos: [0, 1]},
    {name: 'DESERT', skyColor: [0.51, 0.71, 0.84], skyIndex: 13, fogDensity: 0.2, pos: [0.8, 1.7]},
    {name: 'EMERAUDE', skyColor: [0.0, 0.07, 0.10], skyIndex: 14, fogDensity: 0.4, pos: [1.4, 0.5]},
    {name: 'OTRINGAL', skyColor: [0.45, 0.41, 0.48], skyIndex: 16, fogDensity: 0.4, pos: [0.8, -1.2]},
    {name: 'KNARTAS', skyColor: [0.45, 0.41, 0.48], skyIndex: 16, fogDensity: 0.4, pos: [1, 0.8]},
    {name: 'ILOTCX', skyColor: [0.45, 0.41, 0.48], skyIndex: 16, fogDensity: 0.4, pos: [3.3, -1.2]},
    {name: 'CELEBRAT', skyColor: [0.45, 0.41, 0.48], skyIndex: 16, fogDensity: 0.4, pos: [3.1, -1.4]},
    {name: 'ASCENCE', skyColor: [0.45, 0.41, 0.48], skyIndex: 16, fogDensity: 0.4, pos: [2.5, -1.1]},
    {name: 'MOSQUIBE', skyColor: [0.44, 0.0, 0.0], skyIndex: 17, fogDensity: 0.4, pos: [0.75, 1.24]},
    {name: 'PLATFORM', skyColor: [0.44, 0.0, 0.0], skyIndex: 17, fogDensity: 0.4, pos: [1.78, 1.47]},
    {name: 'SOUSCELB', skyColor: [0.44, 0.0, 0.0], skyIndex: 17, fogDensity: 0.4, pos: [1.39, 1.1]}
];

let index = 0;

export default class Renderer {
    constructor(width, height, container) {
        this.clock = new THREE.Clock();
        this.frameCount = 0;

        // Camera init
        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.001, 100); // 1m = 0.0625 units
        this.mobileCamera = new THREE.Object3D();

        this.pcCamera = new THREE.Object3D();
        this.pcCamera.position.x = 0;
        this.pcCamera.position.y = 0.08;
        this.pcCamera.position.z = 1;
        this.pcCamera.lookAt(this.camera.position);

        // Scene
        this.scene = new THREE.Scene();

        this.getHeight = function() { return 0.0; }

        // Renderer init
        this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: false});
        this.renderer.setClearColor(0x000000);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(width, height);
        this.renderer.autoClear = true;

        // Enable extensions
        this.renderer.context.getExtension('EXT_shader_texture_lod');
        this.renderer.context.getExtension('OES_standard_derivatives');

        this.renderer.domElement.style.position = 'absolute';
        this.renderer.domElement.style.left = 0;
        this.renderer.domElement.style.top = 0;
        this.renderer.domElement.style.opacity = 1.0;

        this.controls = new FirstPersonControls(this.pcCamera, this, container);

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
            that.stereoEffect.eyeSeparation = 0.006;
            that.stereoEffect.setSize(width, height);

            window.removeEventListener('deviceorientation', setOrientationControls, true);
        }

        window.addEventListener('deviceorientation', setOrientationControls, true);
        window.addEventListener('keydown', onKeyDown, false);
        window.addEventListener('gamepadbuttonpressed', onButtonPressed, false);

        function onKeyDown(event) {
            switch (event.code) {
                case 'PageDown':
                    index = (index + 1) % islands.length;
                    that.refreshIsland();
                    break;
                case 'PageUp':
                    index = index - 1;
                    if (index < 0)
                        index = islands.length - 1;
                    that.refreshIsland();
                    break;
                case 'KeyF':
                    that.switchStats();
                    break;
            }
        }

        function onButtonPressed(event) {
            if (event.detail.name == 'buttonB' && event.detail.isPressed) {
                index = (index + 1) % islands.length;
                that.refreshIsland();
            }
            else if (event.detail.name == 'buttonX' && event.detail.isPressed) {
                index = index - 1;
                if (index < 0)
                    index = islands.length - 1;
                that.refreshIsland();
            }
            else if (event.detail.name == 'buttonY' && event.detail.isPressed) {
                that.pcControls.setFront(that.controls.alpha);
            }
            else if (event.detail.name == 'leftTrigger' && event.detail.isPressed) {
                that.switchStats();
            }
            else if (event.detail.name == 'rightTrigger' && event.detail.isPressed) {
                if (that.stats) {
                    that.stats.setMode(1 - that.stats.mode);
                }
            }
        }

        // Render loop
        this.animate();

        this.islandGroup = new THREE.Object3D();
        this.islandGroup.add(new THREE.Object3D);
        this.scene.add(this.islandGroup);

        this.refreshIsland();    
    }

    switchStats() {
        if (this.stats) {
            document.getElementById('stats1').removeChild(this.stats.widgets[0].domElement);
            if (this.stats.widgets.length == 2) {
                document.getElementById('stats2').removeChild(this.stats.widgets[1].domElement);
            }
            this.stats = null;
        }
        else {
            if (this.controls instanceof DeviceOrientationControls) {
                this.stats = new Stats(2);
                this.stats.setMode(1); // 0: fps, 1: ms
                this.stats.widgets[0].domElement.style.left = '50%';
                this.stats.widgets[0].domElement.style.top = '100px';
                this.stats.widgets[1].domElement.style.left = '50%';
                this.stats.widgets[1].domElement.style.top = '100px';
                document.getElementById('stats1').appendChild(this.stats.widgets[0].domElement);
                document.getElementById('stats2').appendChild(this.stats.widgets[1].domElement);
            }
            else {
                this.stats = new Stats(1);
                this.stats.setMode(1); // 0: fps, 1: ms
                this.stats.widgets[0].domElement.style.left = '45px';
                document.getElementById('stats1').appendChild(this.stats.widgets[0].domElement);
            }
        }
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
        loadIsland(islands[index], ({object, getHeight}) => {
            console.log('Loaded: ', islands[index].name);
            this.getHeight = getHeight;
            this.islandGroup.children[0] = object;
            this.sea = object.getObjectByName('sea');
            const sc = islands[index].skyColor;
            const color = new THREE.Color(sc[0], sc[1], sc[2]);
            this.renderer.setClearColor(color.getHex(), 1);
            this.pcCamera.position.x = islands[index].pos[0];
            this.pcCamera.position.z = islands[index].pos[1];
            this.pcCamera.position.y = this.getHeight(this.pcCamera.position.x, this.pcCamera.position.z) + 0.08;
        });
    }

    animate() {
        if (this.stats) {
            this.stats.begin();
        }
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
        if (this.stats) {
            this.stats.end();
        }
        requestAnimationFrame(this.animate.bind(this));
    }

    render() {
        if (this.stereoEffect)
            this.stereoEffect.render(this.scene, this.camera);
        else
            this.renderer.render(this.scene, this.camera);
    }
}
