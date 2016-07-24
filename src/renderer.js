import THREE from 'three';
import OrbitControls from './controls/OrbitControls';
import loadIsland from './island';
import model from './model';

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

let index = 0; // 92-Baldino
let current;

export default class Renderer {
    constructor(width, height) {
        this.clock = new THREE.Clock();

        // Camera init
        this.camera = new THREE.PerspectiveCamera(90, width / height, 0.001, 100);
        this.camera.position.x = 0;
        this.camera.position.y = 2;
        this.camera.position.z = 8;
        this.camera.lookAt(new THREE.Vector3());
        this.camera.zoom = 70; //TODO remove this piece when merged into master branch

        // Scene
        this.scene = new THREE.Scene();

        // Renderer init
        this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: false});
        this.renderer.setClearColor(0x000000, 1);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(width, height);
        this.renderer.autoClear = true;

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
        //this.islandGroup = new THREE.Object3D();
        //this.islandGroup.add(new THREE.Object3D);
        //this.scene.add(this.islandGroup);

        window.addEventListener('keydown', this.onKeyDown.bind(this), false);
        //this.refreshIsland();
    }

    onResize(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    onKeyDown(event) {
        if (event.keyCode == 78) {
            index = (index + 1)
            if (index > 468)
                index = 0;
            model(index, (object) => {
                this.scene.remove(current);
                current = object;
                this.scene.add(object);
            });
            //this.refreshIsland();
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
        requestAnimationFrame(this.animate.bind(this));
        this.render();
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}
