import * as THREE from 'three';
import StatsHandler from './stats';
import { pure } from '../utils/decorators';

const RSIZE = new THREE.Vector2();
const PIXEL_RATIOS = [0.25, 0.5, 1, 2];

interface RendererOptions {
    vr?: boolean;
    preserveDrawingBuffer?: boolean;
}

export default class Renderer {
    private pixelRatio: number;
    readonly canvas: HTMLCanvasElement;
    readonly threeRenderer: THREE.WebGLRenderer;
    readonly vr: boolean;
    readonly type: string;
    readonly stats: StatsHandler;
    private keyListener: EventListenerObject;

    constructor(
        params,
        canvas,
        rendererOptions: RendererOptions = {},
        type = 'unknown'
    ) {
        this.type = type;
        this.pixelRatio = 1;
        this.threeRenderer = setupThreeRenderer(
            this.pixelRatio,
            canvas,
            params.webgl2,
            rendererOptions
        );
        this.canvas = canvas;
        this.stats = new StatsHandler();

        if (rendererOptions.vr) {
            this.threeRenderer.xr.enabled = true;
        }
        this.vr = rendererOptions.vr || false;

        const prInfo = `pixelRatio: ${this.pixelRatio}`;
        const glInfo = `webgl: ${(this.threeRenderer as any).webglVersion}`;
        // tslint:disable-next-line:no-console
        console.log(`[Starting renderer(${type})]\n\t${prInfo}\n\t${glInfo}`);
        this.keyListener = keyListener.bind(this);
        window.addEventListener('keydown', this.keyListener);
    }

    render(scene) {
        this.threeRenderer.getSize(RSIZE);
        scene.camera.resize(RSIZE.x, RSIZE.y);
        if (scene.camera.preRender) {
            scene.camera.preRender();
        }
        this.threeRenderer.render(scene.threeScene, scene.camera.threeCamera);
    }

    applySceneryProps(props) {
        const sc = props.envInfo.skyColor;
        const color = new THREE.Color(sc[0], sc[1], sc[2]);
        const opacity = props.opacity !== undefined ? props.opacity : 1;
        this.threeRenderer.setClearColor(color.getHex(), opacity);
    }

    setClearColor(color: number) {
        this.threeRenderer.setClearColor(color);
    }

    resize(width = 0, height = 0) {
        if (!width || !height) {
            this.threeRenderer.getSize(RSIZE);
            width |= RSIZE.x;
            height |= RSIZE.y;
        }
        this.threeRenderer.setSize(width, height);
    }

    dispose() {
        // tslint:disable-next-line:no-console
        console.log(`[Stopping renderer(${this.type})]`);
        this.threeRenderer.dispose();
        window.removeEventListener('keydown', this.keyListener);
    }

    @pure()
    isPresenting() {
        if (!this.threeRenderer.xr.enabled)
            return false;

        return this.threeRenderer.xr.isPresenting;
    }
}

function keyListener(event) {
    if (event.code === 'KeyR' && !event.ctrlKey && !event.metaKey) {
        const idx = PIXEL_RATIOS.indexOf(this.pixelRatio);
        this.pixelRatio = PIXEL_RATIOS[(idx + 1) % PIXEL_RATIOS.length];
        this.threeRenderer.setPixelRatio(this.pixelRatio);
        // tslint:disable-next-line:no-console
        console.log('pixelRatio:', this.pixelRatio);
        this.resize();
    }
}

function setupThreeRenderer(pixelRatio, canvas, webgl2, rendererOptions) {
    const options = {
        alpha: false,
        canvas,
        preserveDrawingBuffer: rendererOptions.preserveDrawingBuffer,
        antialias: true,
        context: null
    };
    let webglVersion = -1;
    if (webgl2 && window.WebGL2RenderingContext) {
        options.context = canvas.getContext('webgl2', {
            xrCompatible: rendererOptions.vr ? true : false
        });
        webglVersion = 2;
    } else {
        webglVersion = 1;
    }
    const renderer = new THREE.WebGLRenderer(options);

    (renderer as any).outputEncoding = THREE.GammaEncoding;
    renderer.gammaFactor = 2.2;
    renderer.setClearColor(0x000000);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(0, 0);
    renderer.autoClear = true;
    (renderer as any).webglVersion = webglVersion;

    if (!(window.WebGL2RenderingContext
            && renderer.getContext() instanceof window.WebGL2RenderingContext)) {
        renderer.getContext().getExtension('EXT_shader_texture_lod');
        renderer.getContext().getExtension('OES_standard_derivatives');
    }
    return renderer;
}
