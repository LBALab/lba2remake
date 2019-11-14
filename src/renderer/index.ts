import * as THREE from 'three';
import {map} from 'lodash';
import setupStats from './stats';
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

const TGT_SIZE = new THREE.Vector2();

interface RendererOptions {
    vr?: boolean;
    preserveDrawingBuffer?: boolean;
}

export function createRenderer(
    params,
    canvas,
    rendererOptions: RendererOptions = {},
    type = 'unknown'
) {
    let pixelRatio = PixelRatio[2]; // SET NORMAL AS DEFAULT
    const getPixelRatio = () => pixelRatio.getValue();
    const threeRenderer = setupThreeRenderer(pixelRatio, canvas, params.webgl2, rendererOptions);
    const stats = setupStats();

    if (rendererOptions.vr) {
        threeRenderer.vr.enabled = true;
        threeRenderer.vr.setReferenceSpaceType('eye-level');
    }

    // tslint:disable-next-line:no-console
    const displayRenderMode = () => console.log(`[Starting renderer(${type})]
    pixelRatio: ${pixelRatio.getValue()}
    webgl: ${(threeRenderer as any).webglVersion}`);
    displayRenderMode();

    function keyListener(event) {
        if (event.code === 'KeyR' && !event.ctrlKey && !event.metaKey) {
            pixelRatio = PixelRatio[(pixelRatio.index + 1) % PixelRatio.length];
            threeRenderer.setPixelRatio(pixelRatio.getValue());
            // tslint:disable-next-line:no-console
            console.log('pixelRatio:', pixelRatio.getValue());
            renderer.resize();
        }
    }

    const rSize = new THREE.Vector2();

    const renderer = {
        canvas,

        /* @inspector(locate) */
        render: (scene) => {
            threeRenderer.getSize(rSize);
            scene.camera.resize(rSize.x, rSize.y);
            threeRenderer.render(scene.threeScene, scene.camera.threeCamera);
        },

        /* @inspector(locate) */
        applySceneryProps: (props) => {
            const sc = props.envInfo.skyColor;
            const color = new THREE.Color(sc[0], sc[1], sc[2]);
            const opacity = props.opacity !== undefined ? props.opacity : 1;
            threeRenderer.setClearColor(color.getHex(), opacity);
        },

        stats,

        /* @inspector(locate) */
        resize: (
            width = threeRenderer.getSize(TGT_SIZE).width,
            height = threeRenderer.getSize(TGT_SIZE).height
        ) => {
            threeRenderer.setSize(width, height);
        },

        /* @inspector(locate, pure) */
        pixelRatio: () => getPixelRatio(),

        /* @inspector(locate) */
        setPixelRatio(value) { threeRenderer.setPixelRatio(value); },

        /* @inspector(locate) */
        dispose() {
            // tslint:disable-next-line:no-console
            console.log(`[Stopping renderer(${type})]`);
            threeRenderer.dispose();
            window.removeEventListener('keydown', keyListener);
        },

        threeRenderer,

        vr: threeRenderer.vr.enabled,

        isPresenting: () => {
            if (!threeRenderer.vr.enabled)
                return false;

            const device = threeRenderer.vr.getDevice();
            return device && device.isPresenting;
        }
    };

    window.addEventListener('keydown', keyListener);

    return renderer;
}

function setupThreeRenderer(pixelRatio, canvas, webgl2, rendererOptions) {
    try {
        const options = {
            alpha: false,
            canvas,
            preserveDrawingBuffer: rendererOptions.preserveDrawingBuffer,
            antialias: true,
            context: null
        };
        let webglVersion = -1;
        if (webgl2 && window.WebGL2RenderingContext) {
            options.context = canvas.getContext('webgl2');
            webglVersion = 2;
        } else {
            webglVersion = 1;
        }
        const renderer = new THREE.WebGLRenderer(options);

        renderer.setClearColor(0x000000);
        renderer.setPixelRatio(pixelRatio.getValue());
        renderer.setSize(0, 0);
        renderer.autoClear = true;
        (renderer as any).webglVersion = webglVersion;

        if (!(window.WebGL2RenderingContext
                && renderer.getContext() instanceof window.WebGL2RenderingContext)) {
            renderer.getContext().getExtension('EXT_shader_texture_lod');
            renderer.getContext().getExtension('OES_standard_derivatives');
        }
        return renderer;
    } catch (err) {
        throw new EngineError('webgl');
    }
}
