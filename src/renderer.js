import THREE from 'three';
import OrbitControls from './controls/OrbitControls';
import island from './island';

export default class Renderer {
    constructor(width, height) {
        this.clock = new THREE.Clock();

        // Camera init
        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        this.camera.position.x = 0;
        this.camera.position.y = 64;
        this.camera.position.z = 256;
        this.camera.lookAt(new THREE.Vector3());

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

        // Render loop
        this.animate();

        island('CITABAU', (object) => {
            this.scene.add(object);
        });
        console.log(this.renderer);
    }

    onResize(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        //this.controls.update();
        this.render();
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}
