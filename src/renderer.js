import THREE from 'three';
import FirstPersonControls from './controls/FirstPersonControls'

export default class Renderer {
    constructor(width, height) {
        this.clock = new THREE.Clock();

        // Camera init
        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        this.camera.position.x = 10;
        this.camera.position.y = 2;
        this.camera.position.z = 2;
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

        // Render loop
        this.animate();
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
