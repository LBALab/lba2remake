import THREE from 'three';
import DeviceOrientationControls from './controls/DeviceOrientationControls';
import OrbitControls from './controls/OrbitControls';
import SyncServer from './controls/SyncServer';
import StereoEffect from './effects/StereoEffect';
import loadIsland from './island';

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

SyncServer.init('192.168.0.19:8081');
export default class Renderer {
    constructor(width, height, container) {
        this.clock = new THREE.Clock();
        this.frameCount = 0;

        this.movement = [0, 0];
        this.angle = 0.0;

        this.cameraDummy = new THREE.Object3D();
        this.cameraDummy.position.x = 0;
        this.cameraDummy.position.y = 0.08;
        this.cameraDummy.position.z = 1;
        this.cameraDummy.lookAt(this.cameraDummy.position);

        // Camera init
        this.camera = new THREE.PerspectiveCamera(90, width / height, 0.001, 100); // 1m = 0.0625 units

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

        this.controls = new OrbitControls(this.cameraDummy, this.renderer.domElement);
        this.controls.target.set(
            this.cameraDummy.position.x - 0.0000000001,
            this.cameraDummy.position.y,
            this.cameraDummy.position.z
        );
        this.controls.enableZoom = false;
        this.controls.enablePan = false;

        const that = this;

        SyncServer.onMsg(function(buffer) {
            const view = new DataView(buffer);
            const type = view.getUint8(0);
            if (type == SyncServer.DEVICE_ORIENTATION) {
                if (that.controls) {
                    that.controls.dispose();
                    that.controls = null;
                }
                that.cameraDummy.quaternion.set(view.getFloat32(2), view.getFloat32(6), view.getFloat32(10), view.getFloat32(14));
            } else if (type == SyncServer.LOCATION) {
                that.cameraDummy.position.set(view.getFloat32(2), view.getFloat32(6), view.getFloat32(10));
                that.angle = view.getFloat32(14);
                const newIndex = view.getUint8(1);
                if (newIndex != index) {
                    index = newIndex;
                    that.refreshIsland();
                }
            }
        });

        function setOrientationControls(e) {
            if (!e.alpha) {
                return;
            }

            that.controls.dispose();
            that.controls = new DeviceOrientationControls(that.cameraDummy);
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
        window.addEventListener('keyup', this.onKeyUp.bind(this), false);
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
        if (event.keyCode == 90 || event.keyCode == 38) { // Z or Up
            this.movement[0] = 1;
        }
        if (event.keyCode == 83 || event.keyCode == 40) { // S or Down
            this.movement[0] = -1;
        }
        if (event.keyCode == 81 || event.keyCode == 37) { // Q or Left
            this.movement[1] = 1;
        }
        if (event.keyCode == 68 || event.keyCode == 39) { // D or Right
            this.movement[1] = -1;
        }
    }

    onKeyUp(event) {
        if (event.keyCode == 90 || event.keyCode == 83 || event.keyCode == 38 || event.keyCode == 40) { // Z | S | Up | Down
            this.movement[0] = 0;
        }
        if (event.keyCode == 81 || event.keyCode == 68 || event.keyCode == 37 || event.keyCode == 39) { // Q | D | Left | Right
            this.movement[1] = 0;
        }
    }

    refreshIsland() {
        loadIsland(islands[index], object => {
            console.log('Loaded: ', islands[index].name);
            this.islandGroup.children[0] = object;
            const sc = islands[index].skyColor;
            const color = new THREE.Color(sc[0], sc[1], sc[2]);
            this.renderer.setClearColor(color.getHex(), 1);
        });
    }

    animate() {
        const dt = this.clock.getDelta();
        if (this.controls && this.controls.update) {
            this.controls.update(dt);
            if (this.controls instanceof DeviceOrientationControls) {
                const q = this.cameraDummy.quaternion;
                if (this.frameCount % 2 == 0) {
                    const buffer = new ArrayBuffer(18);
                    const view = new DataView(buffer);
                    view.setUint8(0, SyncServer.DEVICE_ORIENTATION);
                    view.setFloat32(2, q.x);
                    view.setFloat32(6, q.y);
                    view.setFloat32(10, q.z);
                    view.setFloat32(14, q.w);
                    SyncServer.send(buffer);
                }
            }
        }
        if (this.movement[0] != 0 || this.movement[1] != 0) {
            this.angle += dt * this.movement[1] * 2.0;
            const dir = new THREE.Vector3(this.movement[0], 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.angle);
            dir.multiplyScalar(dt * 0.2);
            this.cameraDummy.position.add(dir);
            if (this.controls instanceof OrbitControls) {
                this.controls.target.add(dir);
            }
            if (this.frameCount % 2 == 0) {
                const p = this.cameraDummy.position;
                const buffer = new ArrayBuffer(18);
                const view = new DataView(buffer);
                view.setUint8(0, SyncServer.LOCATION);
                view.setUint8(1, index);
                view.setFloat32(2, p.x);
                view.setFloat32(6, p.y);
                view.setFloat32(10, p.z);
                view.setFloat32(14, this.angle);
                SyncServer.send(buffer);
            }
        }
        this.camera.position.copy(this.cameraDummy.position);
        this.camera.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.angle);
        this.camera.quaternion.multiply(this.cameraDummy.quaternion);
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
