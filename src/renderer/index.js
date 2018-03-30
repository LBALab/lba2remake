import * as THREE from 'three';
import {map} from 'lodash';
import StereoEffect from './effects/StereoEffect';
import EffectComposer from './effects/postprocess/EffectComposer';
import SMAAPass from './effects/postprocess/SMAAPass';
import RenderPass from './effects/postprocess/RenderPass';
import setupStats from './stats';
import {
    get3DCamera,
    resize3DCamera,
    getIsometricCamera,
    resizeIsometricCamera
} from './cameras';
import Cardboard from './utils/Cardboard';
import {EngineError} from '../crash_reporting';

const PixelRatioMode = {
    DEVICE: () => window.devicePixelRatio || 1.0,
    DOUBLE: () => 2.0,
    NORMAL: () => 1.0,
    HALF: () => 0.5,
    QUARTER: () => 0.25
};

export const PixelRatio = map(['DEVICE', 'DOUBLE', 'NORMAL', 'HALF', 'QUARTER'], (name, idx) => ({
    getValue: PixelRatioMode[name],
    index: idx,
    name
}));

export function createRenderer(params, canvas) {
    let pixelRatio = PixelRatio[2]; // SET NORMAL AS DEFAULT
    const getPixelRatio = () => pixelRatio.getValue();
    let antialias = false;
    // eslint-disable-next-line no-console
    const displayRenderMode = () => console.log(`Renderer mode: pixelRatio=${pixelRatio.name}(${pixelRatio.getValue()}x), antialiasing(${antialias})`);
    const baseRenderer = setupBaseRenderer(pixelRatio, canvas);
    const tgtRenderer = params.vr ? setupVR(baseRenderer) : baseRenderer;
    const camera3D = get3DCamera();
    const cameraIso = getIsometricCamera(pixelRatio.getValue());
    let smaa = setupSMAA(tgtRenderer, pixelRatio);
    const stats = setupStats(params.vr);

    displayRenderMode();

    const renderer = {
        canvas,
        render: (scene) => {
            tgtRenderer.antialias = antialias;
            const camera = scene.isIsland ? camera3D : cameraIso;
            if (antialias) {
                smaa.render(scene.threeScene, camera);
            } else {
                tgtRenderer.render(scene.threeScene, camera);
            }
        },
        applySceneryProps: (props) => {
            const sc = props.envInfo.skyColor;
            const color = new THREE.Color(sc[0], sc[1], sc[2]);
            baseRenderer.setClearColor(color.getHex(), 1);
        },
        stats,
        cameras: {
            camera3D,
            isoCamera: cameraIso
        },
        resize: (width = tgtRenderer.getSize().width, height = tgtRenderer.getSize().height) => {
            tgtRenderer.setSize(width, height);
            resize3DCamera(camera3D, width, height);
            resizeIsometricCamera(cameraIso, getPixelRatio(), width, height);
        },
        getMainCamera: scene => (scene.isIsland ? camera3D : cameraIso),
        pixelRatio: getPixelRatio,
        setPixelRatio(value) { baseRenderer.setPixelRatio(value); }
    };

    function keyListener(event) {
        if (event.code === 'KeyH') {
            antialias = !antialias;
            displayRenderMode();
            renderer.resize();
        }
        if (event.code === 'KeyR') {
            pixelRatio = PixelRatio[(pixelRatio.index + 1) % PixelRatio.length];
            baseRenderer.setPixelRatio(pixelRatio.getValue());
            smaa = setupSMAA(tgtRenderer, pixelRatio);
            displayRenderMode();
            renderer.resize();
        }
    }

    window.addEventListener('keydown', keyListener);

    renderer.dispose = () => {
        window.removeEventListener('keydown', keyListener);
    };

    return renderer;
}

function setupBaseRenderer(pixelRatio, canvas) {
    try {
        const renderer = new THREE.WebGLRenderer({
            antialias: false,
            alpha: false,
            logarithmicDepthBuffer: true,
            canvas
        });

        renderer.setClearColor(0x000000);
        renderer.setPixelRatio(pixelRatio.getValue());
        renderer.setSize(0, 0);
        renderer.autoClear = true;

        renderer.context.getExtension('EXT_shader_texture_lod');
        renderer.context.getExtension('OES_standard_derivatives');
        return renderer;
    } catch (err) {
        throw new EngineError('webgl');
    }
}

function setupSMAA(renderer, pixelRatio) {
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass();
    composer.addPass(renderPass);

    const pass = new SMAAPass(
        window.innerWidth * pixelRatio.getValue(),
        window.innerHeight * pixelRatio.getValue()
    );
    pass.renderToScreen = true;
    composer.addPass(pass);
    return {
        render(scene, camera) {
            renderPass.scene = scene;
            renderPass.camera = camera;
            composer.render();
        }
    };
}

function setupVR(baseRenderer) {
    const params = Cardboard.uriToParams('https://vr.google.com/cardboard/download/?p=CgdUd2luc3VuEgRBZHJpHfT91DwlYOVQPSoQAAC0QgAAtEIAALRCAAC0QlgANQIrBz06CClcjz0K1yM8UABgAA');
    // eslint-disable-next-line no-console
    console.log('Cardboard params:', params);
    const stereoEffect = new StereoEffect(baseRenderer, params);
    stereoEffect.eyeSeparation = -0.0012;
    stereoEffect.focalLength = 0.0122;
    stereoEffect.setSize(0, 0);
    return stereoEffect;
}
