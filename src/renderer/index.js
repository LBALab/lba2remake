import THREE from 'three';
import StereoEffect from './effects/StereoEffect';
import EffectComposer from './effects/postprocess/EffectComposer';
import SMAAPass from './effects/postprocess/SMAAPass';
import RenderPass from './effects/postprocess/RenderPass';
import setupStats from './stats';
import Cardboard from './utils/Cardboard';
import {GameEvents} from '../game/events';
import {map} from 'lodash';

const PixelRatioMode = {
    DEVICE: () => window.devicePixelRatio,
    DOUBLE: () => 2.0,
    NORMAL: () => 1.0,
    HALF: () => 0.5,
    QUARTER: () => 0.25
};

const PixelRatio = map(['DEVICE', 'DOUBLE', 'NORMAL', 'HALF', 'QUARTER'], (name, idx) => ({
    getValue: PixelRatioMode[name],
    index: idx,
    name: name
}));

export function createRenderer(useVR) {
    let pixelRatio = PixelRatio[0];
    let antialias = false;
    const displayRenderMode = () => console.log(`Renderer mode: pixelRatio=${pixelRatio.name}(${pixelRatio.getValue()}x), antialiasing(${antialias})`);
    const baseRenderer = setupBaseRenderer(pixelRatio);
    const renderer = useVR ? setupVR(baseRenderer) : baseRenderer;
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.001, 100); // 1m = 0.0625 units
    const resizer = setupResizer(renderer, camera);
    let smaa = setupSMAA(renderer, pixelRatio);
    const stats = setupStats(useVR);

    window.addEventListener('keydown', event => {
        if (event.code == 'KeyH') {
            antialias = !antialias;
            displayRenderMode();
            window.dispatchEvent(new CustomEvent('resize'));
        }
        if (event.code == 'KeyR') {
            pixelRatio = PixelRatio[(pixelRatio.index + 1) % PixelRatio.length];
            baseRenderer.setPixelRatio(pixelRatio.getValue());
            smaa = setupSMAA(renderer, pixelRatio);
            displayRenderMode();
            window.dispatchEvent(new CustomEvent('resize'));
        }
    });

    displayRenderMode();

    return {
        domElement: baseRenderer.domElement,
        render: scene => {
            renderer.antialias = antialias;
            if (antialias) {
                smaa.render(scene, camera);
            }
            else {
                renderer.render(scene, camera);
            }
        },
        dispose: () => {
            resizer.dispose();
            stats.dispose();
        },
        stats: stats,
        camera: camera
    };
}

function setupBaseRenderer(pixelRatio) {
    const renderer = new THREE.WebGLRenderer({antialias: false, alpha: false, logarithmicDepthBuffer: true});
    renderer.setClearColor(0x000000);
    renderer.setPixelRatio(pixelRatio.getValue());
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.autoClear = true;

    renderer.context.getExtension('EXT_shader_texture_lod');
    renderer.context.getExtension('OES_standard_derivatives');

    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.left = 0;
    renderer.domElement.style.top = 0;
    renderer.domElement.style.opacity = 1.0;

    GameEvents.scene.sceneLoaded.addListener(scene => {
        const sc = scene.envInfo.skyColor;
        const color = new THREE.Color(sc[0], sc[1], sc[2]);
        renderer.setClearColor(color.getHex(), 1);
    });

    return renderer;
}

function setupSMAA(renderer, pixelRatio) {
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass();
    composer.addPass(renderPass);

    const pass = new SMAAPass(window.innerWidth * pixelRatio.getValue(), window.innerHeight * pixelRatio.getValue());
    pass.renderToScreen = true;
    composer.addPass(pass);
    return {
        render(scene, camera) {
            renderPass.scene = scene;
            renderPass.camera = camera;
            composer.render();
        }
    }
}

function setupResizer(renderer, camera) {
    function resize() {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }

    window.addEventListener('resize', resize);
    return {dispose: () => { window.removeEventListener('resize', resize) }};
}

function setupVR(baseRenderer) {
    const params = Cardboard.uriToParams('https://vr.google.com/cardboard/download/?p=CgdUd2luc3VuEgRBZHJpHfT91DwlYOVQPSoQAAC0QgAAtEIAALRCAAC0QlgANQIrBz06CClcjz0K1yM8UABgAA');
    console.log(params);
    const stereoEffect = new StereoEffect(baseRenderer, params);
    stereoEffect.eyeSeparation = 0.006;
    stereoEffect.setSize(window.innerWidth, window.innerHeight);
    return stereoEffect;
}
