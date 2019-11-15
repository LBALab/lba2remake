import * as THREE from 'three';
import {map} from 'lodash';
import setupStats from './stats';
import {EngineError} from '../crash_reporting';
import { pure } from '../utils/decorators';

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

interface RendererOptions {
    vr?: boolean;
    preserveDrawingBuffer?: boolean;
}

const RSIZE = new THREE.Vector2();

export default class Renderer {
    private pixelRatioP: any;
    private keyListener: EventListenerObject;
    readonly canvas: HTMLCanvasElement;
    readonly threeRenderer: THREE.WebGLRenderer;
    readonly vr: boolean;
    readonly type: string;
    readonly stats;

    constructor(
        params,
        canvas,
        rendererOptions: RendererOptions = {},
        type = 'unknown'
    ) {
        this.type = type;
        this.pixelRatioP = PixelRatio[2]; // SET NORMAL AS DEFAULT
        this.threeRenderer = setupThreeRenderer(
            this.pixelRatioP,
            canvas,
            params.webgl2,
            rendererOptions
        );
        this.canvas = canvas;
        this.stats = setupStats();

        if (rendererOptions.vr) {
            this.threeRenderer.vr.enabled = true;
            this.threeRenderer.vr.setReferenceSpaceType('eye-level');
        }
        this.vr = rendererOptions.vr || false;

        const prInfo = `pixelRatio: ${this.pixelRatioP.getValue()}`;
        const glInfo = `webgl: ${(this.threeRenderer as any).webglVersion}`;
        // tslint:disable-next-line:no-console
        console.log(`[Starting renderer(${type})]\n\t${prInfo}\n\t${glInfo}`);
        this.keyListener = keyListener.bind(this);
        window.addEventListener('keydown', this.keyListener);
    }

    render(scene) {
        this.threeRenderer.getSize(RSIZE);
        scene.camera.resize(RSIZE.x, RSIZE.y);
        this.threeRenderer.render(scene.threeScene, scene.camera.threeCamera);
    }

    applySceneryProps(props) {
        const sc = props.envInfo.skyColor;
        const color = new THREE.Color(sc[0], sc[1], sc[2]);
        const opacity = props.opacity !== undefined ? props.opacity : 1;
        this.threeRenderer.setClearColor(color.getHex(), opacity);
    }

    resize(
        width = this.threeRenderer.getSize(RSIZE).width,
        height = this.threeRenderer.getSize(RSIZE).height
    ) {
        this.threeRenderer.setSize(width, height);
    }

    @pure()
    pixelRatio() {
        return this.pixelRatioP.getValue();
    }

    setPixelRatio(value) {
        this.threeRenderer.setPixelRatio(value);
    }

    dispose() {
        // tslint:disable-next-line:no-console
        console.log(`[Stopping renderer(${this.type})]`);
        this.threeRenderer.dispose();
        window.removeEventListener('keydown', this.keyListener);
    }

    @pure()
    isPresenting() {
        if (!this.threeRenderer.vr.enabled)
            return false;

        const device = this.threeRenderer.vr.getDevice();
        return device && device.isPresenting;
    }
}

function keyListener(event) {
    if (event.code === 'KeyR' && !event.ctrlKey && !event.metaKey) {
        this.pixelRatioP = PixelRatio[(this.pixelRatioP.index + 1) % PixelRatio.length];
        this.threeRenderer.setPixelRatio(this.pixelRatioP.getValue());
        // tslint:disable-next-line:no-console
        console.log('pixelRatio:', this.pixelRatioP.getValue());
        this.resize();
    }
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
