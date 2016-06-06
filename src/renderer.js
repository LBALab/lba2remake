import THREE from 'three';
import FirstPersonControls from './controls/FirstPersonControls'
import HQR from './hqr';

export default class Renderer {
    constructor(width, height) {
        this.clock = new THREE.Clock();

        // Camera init
        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        this.camera.position.x = 0;
        this.camera.position.y = 0;
        this.camera.position.z = 10;
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));

        // Scene
        this.scene = new THREE.Scene();
        var geometry = new THREE.BoxGeometry(1, 1, 1);
        var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
        var cube = new THREE.Mesh(geometry, material);
        this.scene.add(cube);

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

        this.controls = new FirstPersonControls(this.camera);
        this.controls.lookSpeed = 0.1;
        this.controls.movementSpeed = 10;
        this.controls.enabled = false;

        // Render loop
        this.animate();

        const that = this;

        window.ress = new HQR().load('data/RESS.HQR', function() {
            const palette = new Uint8Array(this.getEntry(0));
            window.citabau = new HQR().load('data/CITABAU.ILE', function() {
                const layout = new Uint8Array(this.getEntry(0));
                const ground_texture = new Uint8Array(this.getEntry(1));
                const image_data = new Uint8Array(256 * 256 * 4);
                for (let i = 0; i < 65536; ++i) { // 256 * 256
                    image_data[i * 4] = palette[ground_texture[i] * 3];
                    image_data[i * 4 + 1] = palette[ground_texture[i] * 3 + 1];
                    image_data[i * 4 + 2] = palette[ground_texture[i] * 3 + 2];
                    image_data[i * 4 + 3] = 0xFF;
                }
                const geometry = new THREE.PlaneGeometry(10, 10);
                const material = new THREE.MeshBasicMaterial({
                    side: THREE.DoubleSide,
                    map: new THREE.DataTexture(image_data, 256, 256)
                });
                material.map.needsUpdate = true;
                var plane = new THREE.Mesh(geometry, material);
                that.scene.add(plane);
            });
        });
    }

    onResize(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.controls.update(this.clock.getDelta());
        this.render();
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}
