import * as React from 'react';
import * as THREE from 'three';
import { omit, cloneDeep } from 'lodash';
import { saveAs } from 'file-saver';
import { ColladaExporter } from 'three/examples/jsm/exporters/ColladaExporter';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import Renderer from '../../../../renderer';
import { fullscreen } from '../../../styles/index';
import FrameListener from '../../../utils/FrameListener';
import DebugData from '../../DebugData';
import { TickerProps } from '../../../utils/Ticker';
import { getIsometricCamera } from '../../../../cameras/iso';
import { loadImageData } from '../../../../iso';
import { loadLibrary } from '../../../../iso/grid';
import { loadBricks } from '../../../../iso/bricks';
import { loadHqr } from '../../../../hqr';
import { OffsetBySide, Side } from '../../../../iso/mapping';
import { compile } from '../../../../utils/shaders';
import brick_vertex from '../../../../iso/shaders/brick.vert.glsl';
import brick_fragment from '../../../../iso/shaders/brick.frag.glsl';

interface Props extends TickerProps {
    mainData: any;
    saveMainData: Function;
    params: any;
    sharedState: {
        library: number;
        layout: number;
        rotateView: boolean;
        wireframe: boolean;
        grid: boolean;
    };
    stateHandler: any;
}

interface State {
    layout?: any;
    library?: any;
    renderer?: any;
    scene: any;
    clock: THREE.Clock;
    grid: any;
    controlsState: {
        cameraLerp: THREE.Vector3;
        cameraLookAtLerp: THREE.Vector3;
    };
    replacementFiles?: string[];
    replacement?: {
        threeObject: THREE.Object3D;
        file: string;
        orientation: number;
    };
}

const canvasStyle = {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 100
};

const infoStyle = {
    position: 'absolute' as const,
    left: 0,
    right: 0,
    bottom: 0,
    height: 100
};

const infoButton = {
    margin: '2px 4px',
    padding: '5px 10px'
};

const fileSelectorWrapper = Object.assign({}, fullscreen, {
    background: 'rgba(0, 0, 0, 0.75)',
    padding: 20,
    textAlign: 'left' as const,
});

const fileInnerWrapper = {
    position: 'absolute' as const,
    right: 20,
    top: 20,
    bottom: 20,
    padding: 20,
    background: 'grey',
    overflowY: 'auto' as const
};

const fileStyle = {
    cursor: 'pointer' as const,
    fontSize: 24,
    lineHeight: '32px',
};

const dataBlock = {
    display: 'inline-block' as const,
    borderRight: '1px dashed black',
    padding: '5px 10px',
    height: '100%'
};

const closeStyle = {
    position: 'absolute' as const,
    top: 2,
    right: 8,
    width: 24,
    height: 24,
    cursor: 'pointer' as const
};

const exporter = new ColladaExporter();
const loader = new GLTFLoader();

let replacementData = null;

export default class LayoutsEditorContent extends FrameListener<Props, State> {
    mouseSpeed: {
        x: number;
        y: number;
    };
    zoom: number;
    root: HTMLElement;
    canvas: HTMLCanvasElement;
    library: number;
    layout: number;
    wireframe: boolean;
    moving: boolean;
    moved: boolean;
    mask: ImageData;
    loading: boolean = false;

    constructor(props) {
        super(props);

        this.onLoad = this.onLoad.bind(this);
        this.frame = this.frame.bind(this);
        this.saveData = this.saveData.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onWheel = this.onWheel.bind(this);
        this.listener = this.listener.bind(this);
        this.export = this.export.bind(this);
        this.exportTexture = this.exportTexture.bind(this);
        this.replaceByModel = this.replaceByModel.bind(this);
        this.closeReplacement = this.closeReplacement.bind(this);
        this.resetToIso = this.resetToIso.bind(this);
        this.changeAngle = this.changeAngle.bind(this);

        this.mouseSpeed = {
            x: 0,
            y: 0
        };

        this.zoom = 0;
        this.layout = -1;

        if (props.mainData) {
            this.state = props.mainData.state;
        } else {
            const camera = getIsometricCamera();
            const scene = {
                camera,
                threeScene: new THREE.Scene(),
                target: {
                    threeObject: new THREE.Object3D()
                }
            };
            const controlsState = {
                cameraLerp: new THREE.Vector3(),
                cameraLookAtLerp: new THREE.Vector3()
            };
            const gridScale = 0.75;
            const grid = new THREE.Object3D();
            for (let x = -4; x <= 4; x += 1) {
                for (let z = -4; z <= 4; z += 1) {
                    const tile = new THREE.GridHelper(gridScale, 2);
                    tile.position.x = x * gridScale;
                    tile.position.z = z * gridScale;
                    (tile.material as THREE.LineBasicMaterial).transparent = true;
                    (tile.material as THREE.LineBasicMaterial).opacity = 1;
                    grid.add(tile);
                }
            }
            scene.threeScene.add(grid);
            scene.threeScene.add(camera.threeCamera);
            const ambience = {
                lightingAlpha: 414,
                lightingBeta: 136
            };
            const light = new THREE.DirectionalLight();
            light.name = 'light';
            light.position.set(-1000, 0, 0);
            light.position.applyAxisAngle(
                new THREE.Vector3(0, 0, 1),
                -(ambience.lightingAlpha * 2 * Math.PI) / 0x1000
            );
            light.position.applyAxisAngle(
                new THREE.Vector3(0, 1, 0),
                -(ambience.lightingBeta * 2 * Math.PI) / 0x1000
            );
            light.updateMatrix();
            light.matrixAutoUpdate = false;
            light.intensity = 10;
            scene.threeScene.add(light);
            scene.threeScene.add(new THREE.AmbientLight(0xFFFFFF, 0.2));
            const clock = new THREE.Clock(false);
            this.state = {
                scene,
                clock,
                grid,
                controlsState
            };
            clock.start();
        }
    }

    saveData() {
        if (this.props.saveMainData) {
            DebugData.scope = this.state;
            this.props.saveMainData({
                state: this.state,
                canvas: this.canvas
            });
        }
    }

    onLoad(root) {
        if (!this.root) {
            if (this.props.mainData) {
                this.canvas = this.props.mainData.canvas;
            } else {
                this.canvas = document.createElement('canvas');
                this.canvas.tabIndex = 0;
                const renderer = new Renderer(
                    this.props.params,
                    this.canvas,
                    {},
                    'layouts_editor'
                );
                renderer.threeRenderer.setAnimationLoop(() => {
                    this.props.ticker.frame();
                });
                this.setState({ renderer }, this.saveData);
            }
            this.root = root;
            this.root.appendChild(this.canvas);
        }
    }

    componentWillMount() {
        super.componentWillMount();
        window.addEventListener('keydown', this.listener);
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.listener);
        super.componentWillUnmount();
    }

    listener(event) {
        if (this.state.library) {
            const key = event.code || event.which || event.keyCode;
            switch (key) {
                case 37: // left
                case 'ArrowLeft': {
                    const newLayout = Math.max(0, this.props.sharedState.layout - 1);
                    this.props.stateHandler.setLayout(newLayout);
                    break;
                }
                case 39: // right
                case 'ArrowRight': {
                    const newLayout = Math.min(
                        this.state.library.layouts.length - 1,
                        this.props.sharedState.layout + 1
                    );
                    this.props.stateHandler.setLayout(newLayout);
                    break;
                }
                case 27: // escape
                case 'Escape': {
                    if (this.state.replacementFiles) {
                        this.closeReplacement();
                    }
                    break;
                }
            }
        }
    }

    async loadLayout(libraryIdx, layoutIdx) {
        if (this.loading) {
            return;
        }
        this.loading = true;
        this.layout = layoutIdx;
        this.library = libraryIdx;
        const [ress, bkg] = await Promise.all([
            loadHqr('RESS.HQR'),
            loadHqr('LBA_BKG.HQR'),
        ]);
        if (!this.mask) {
            this.mask = await loadImageData('images/brick_mask.png');
        }
        const palette = new Uint8Array(ress.getEntry(0));
        const bricks = loadBricks(bkg);
        const library = loadLibrary(bkg, bricks, this.mask, palette, libraryIdx);
        const layoutProps = library.layouts[layoutIdx];
        const layoutMesh = await loadLayoutMesh(library, layoutIdx);
        const layoutObj = {
            index: layoutIdx,
            props: layoutProps,
            threeObject: layoutMesh
        };
        const {
            layout: oldLayout,
            replacement: oldReplacement
        } = this.state;
        if (oldLayout) {
            this.state.scene.threeScene.remove(oldLayout.threeObject);
        }
        if (oldReplacement) {
            this.state.scene.threeScene.remove(oldReplacement.threeObject);
        }
        if (!replacementData) {
            const rawRD = await fetch('/metadata/layout_replacements.json');
            replacementData = await rawRD.json();
        }
        let replacement = null;
        if (libraryIdx in replacementData
            && layoutIdx in replacementData[libraryIdx]) {
            replacement = cloneDeep(replacementData[libraryIdx][layoutIdx]);
        }
        if (replacement) {
            const model = await loadModel(replacement.file);
            model.scene.quaternion.setFromAxisAngle(
                new THREE.Vector3(0, 1, 0),
                (Math.PI / 2.0) * replacement.orientation
            );
            replacement.threeObject = model.scene;
            this.state.scene.threeScene.add(replacement.threeObject);
            layoutObj.threeObject.visible = false;
        }
        this.state.scene.threeScene.add(layoutObj.threeObject);
        this.setState({
            library,
            layout: layoutObj,
            replacement
        }, this.saveData);
        this.wireframe = false;
        this.loading = false;
    }

    onMouseDown() {
        this.moving = true;
        this.moved = false;
    }

    onMouseMove(e) {
        if (this.moving) {
            this.mouseSpeed.x = e.movementX;
            this.mouseSpeed.y = e.movementY;
            this.moved = true;
        }
    }

    onMouseUp() {
        this.moving = false;
        if (!this.moved) {
            this.mouseSpeed.x = 0;
        }
        this.mouseSpeed.y = 0;
    }

    onWheel(e) {
        this.zoom += e.deltaY * 0.01;
        this.zoom = Math.min(Math.max(-1, this.zoom), 8);
    }

    frame() {
        const { layout: layoutObj, renderer, clock, scene, grid } = this.state;
        const { layout, library, wireframe } = this.props.sharedState;
        if (this.library !== library || this.layout !== layout) {
            this.loadLayout(library, layout);
        }
        if (this.wireframe !== wireframe && layoutObj) {
            layoutObj.threeObject.traverse((obj) => {
                if (obj instanceof THREE.Mesh) {
                    (obj.material as THREE.RawShaderMaterial).wireframe = wireframe;
                }
            });
            this.wireframe = wireframe;
        }
        grid.visible = this.props.sharedState.grid || false;
        this.checkResize();
        const time = {
            delta: Math.min(clock.getDelta(), 0.05),
            elapsed: clock.getElapsedTime()
        };
        renderer.stats.begin();
        scene.camera.update(scene, this.state.controlsState, time);
        renderer.render(scene);
        renderer.stats.end();
    }

    checkResize() {
        if (this.root && this.canvas && this.state.renderer) {
            const roundedWidth = Math.floor(this.root.clientWidth * 0.5) * 2;
            const roundedHeight = Math.floor(this.root.clientHeight * 0.5) * 2;
            const rWidth = `${roundedWidth}px`;
            const rHeight = `${roundedHeight}px`;
            const cvWidth = this.canvas.style.width;
            const cvHeight = this.canvas.style.height;
            if (rWidth !== cvWidth || rHeight !== cvHeight) {
                this.state.renderer.resize(roundedWidth, roundedHeight);
            }
        }
    }

    async export() {
        const { layout, library } = this.state;
        if (library && layout) {
            const meshToExport = await loadLayoutMesh(library, layout.index, true);
            exporter.parse(meshToExport, (dae) => {
                const blob = new Blob([dae.data], {type: 'application/xml;charset=utf-8'});
                saveAs(blob, `layout_${library.index}_${layout.index}.dae`);
            }, {});
        }
    }

    async exportTexture() {
        const { library } = this.state;
        if (library) {
            const data = await textureToPNG(library.texture);
            const blob = new Blob([data], {type: 'image/png;charset=utf-8'});
            saveAs(blob, `library_${library.index}.png`);
        }
    }

    async replaceByModel() {
        const data = await fetch('/layout_models');
        const files = await data.json();
        this.setState({ replacementFiles: files });
    }

    async resetToIso() {
        const { threeScene } = this.state.scene;
        const oldReplacement = this.state.replacement;
        if (oldReplacement) {
            threeScene.remove(oldReplacement.threeObject);
        }
        this.state.layout.threeObject.visible = true;
        const { library, layout } = this.props.sharedState;
        delete replacementData[library][layout];
        await this.saveMetadata();
        this.setState({ replacement: null });
    }

    closeReplacement() {
        this.setState({ replacementFiles: null });
    }

    async useFile(file) {
        this.setState({ replacementFiles: null });
        const model = await loadModel(file);
        const { threeScene } = this.state.scene;
        const oldReplacement = this.state.replacement;
        if (oldReplacement) {
            threeScene.remove(oldReplacement.threeObject);
        } else {
            this.state.layout.threeObject.visible = false;
        }
        const replacement = {
            threeObject: model.scene,
            file,
            orientation: 0
        };
        const { library, layout } = this.props.sharedState;
        if (!(library in replacementData)) {
            replacementData[library] = {};
        }
        replacementData[library][layout] = omit(replacement, 'threeObject');
        await this.saveMetadata();
        threeScene.add(replacement.threeObject);
        this.setState({ replacement });
    }

    async saveMetadata() {
        return fetch('/metadata', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'layouts',
                content: replacementData
            })
        });
    }

    render() {
        return <div
            id="renderZone"
            style={fullscreen}
            onMouseDown={this.onMouseDown}
            onMouseUp={this.onMouseUp}
            onMouseMove={this.onMouseMove}
            onMouseLeave={this.onMouseUp}
            onWheel={this.onWheel}
        >
            <div ref={this.onLoad} style={canvasStyle}/>
            {this.renderInfo()}
            {this.renderFileSelector()}
            <div id="stats" style={{position: 'absolute', top: 0, left: 0, width: '50%'}}/>
        </div>;
    }

    renderInfo() {
        const {layout, replacement} = this.state;
        if (layout) {
            return <div style={infoStyle}>
                <div style={dataBlock}>
                    Layout {layout.index}<br/><br/>
                    Width (x): {layout.props.nX}<br/>
                    Height (x): {layout.props.nY}<br/>
                    Depth (z): {layout.props.nZ}
                </div>
                {this.renderReplacementData()}
                <div style={{position: 'absolute', right: 0, top: 2, textAlign: 'right'}}>
                    <button style={infoButton} onClick={this.export}>
                        Download layout
                    </button>
                    <br/>
                    <button style={infoButton} onClick={this.exportTexture}>
                        Download library texture
                    </button>
                    <br/>
                    {replacement
                        ? <button style={infoButton} onClick={this.resetToIso}>
                            Reset to iso
                        </button>
                        : <button style={infoButton} onClick={this.replaceByModel}>
                            Replace by 3D model
                        </button>}
                </div>
            </div>;
        }
        return null;
    }

    async changeAngle(e) {
        const { replacement } = this.state;
        if (!replacement) {
            return;
        }
        const { library, layout } = this.props.sharedState;
        replacement.orientation = Number(e.target.value);
        replacement.threeObject.quaternion.setFromAxisAngle(
            new THREE.Vector3(0, 1, 0),
            (Math.PI / 2.0) * replacement.orientation
        );
        this.setState({replacement});
        replacementData[library][layout].orientation = replacement.orientation;
        await this.saveMetadata();
    }

    renderReplacementData() {
        const {replacement} = this.state;
        if (replacement) {
            return <div style={dataBlock}>
                Replacement:<br/><br/>
                Angle: <select onChange={this.changeAngle} value={replacement.orientation}>
                    {[0, 1, 2, 3].map(v => <option key={v} value={v}>
                        {v * 90}°
                    </option>)}
                </select>
            </div>;
        }
        return null;
    }

    renderFileSelector() {
        const {replacementFiles} = this.state;
        if (replacementFiles) {
            return <div style={fileSelectorWrapper} onClick={e => e.stopPropagation()}>
                <div style={fileInnerWrapper}>
                    {replacementFiles.map(f =>
                        <div key={f}
                                style={fileStyle}
                                onClick={this.useFile.bind(this, f)}>
                            <img src="editor/icons/gltf.svg" style={{height: 20}}/>
                            {f}
                        </div>)}
                </div>
                <img style={closeStyle}
                        src="./editor/icons/close.svg"
                        onClick={this.closeReplacement}/>
            </div>;
        }
        return null;
    }
}

interface GLTFModel {
    scene: THREE.Scene;
}

async function loadModel(file) : Promise<GLTFModel> {
    return new Promise((resolve) => {
        loader.load(`/models/layouts/${file}`, resolve);
    });
}

async function loadLayoutMesh(library, layoutIdx, loadForExporting = false) {
    const h = 0.5;
    const positions = [];
    const uvs = [];
    const {width, height} = library.texture.image;
    const {nX, nY, nZ, blocks} = library.layouts[layoutIdx];
    let idx = 0;
    for (let z = 0; z < nZ; z += 1) {
        for (let y = 0; y < nY; y += 1) {
            for (let x = 0; x < nX; x += 1) {
                const pY = y * h + 0.5;
                const block = blocks[idx];
                if (block && block.brick in library.bricksMap) {
                    const {u, v} = library.bricksMap[block.brick];
                    const pushUv = (u0, v0, side) => {
                        const o = OffsetBySide[side];
                        if (loadForExporting) {
                            uvs.push((u + u0 + o.x) / width, 1 - ((v + v0 + o.y) / height));
                        } else {
                            uvs.push((u + u0 + o.x) / width, (v + v0 + o.y) / height);
                        }
                    };

                    positions.push(x, pY, z);
                    pushUv(24, -0.5, Side.TOP);
                    positions.push(x, pY, z + 1);
                    pushUv(48, 11.5, Side.TOP);
                    positions.push(x + 1, pY, z + 1);
                    pushUv(24, 23.5, Side.TOP);
                    positions.push(x, pY, z);
                    pushUv(24, -0.5, Side.TOP);
                    positions.push(x + 1, pY, z + 1);
                    pushUv(24, 23.5, Side.TOP);
                    positions.push(x + 1, pY, z);
                    pushUv(0, 11.5, Side.TOP);

                    positions.push(x + 1, pY, z);
                    pushUv(0, 11.5, Side.LEFT);
                    positions.push(x + 1, pY, z + 1);
                    pushUv(24, 23.5, Side.LEFT);
                    positions.push(x + 1, pY - h, z + 1);
                    pushUv(24, 38.5, Side.LEFT);
                    positions.push(x + 1, pY, z);
                    pushUv(0, 11.5, Side.LEFT);
                    positions.push(x + 1, pY - h, z + 1);
                    pushUv(24, 38.5, Side.LEFT);
                    positions.push(x + 1, pY - h, z);
                    pushUv(0, 26.5, Side.LEFT);

                    positions.push(x, pY, z + 1);
                    pushUv(48, 11.5, Side.RIGHT);
                    positions.push(x + 1, pY - h, z + 1);
                    pushUv(24, 38.5, Side.RIGHT);
                    positions.push(x + 1, pY, z + 1);
                    pushUv(24, 23.5, Side.RIGHT);
                    positions.push(x, pY, z + 1);
                    pushUv(48, 11.5, Side.RIGHT);
                    positions.push(x, pY - h, z + 1);
                    pushUv(48, 26.5, Side.RIGHT);
                    positions.push(x + 1, pY - h, z + 1);
                    pushUv(24, 38.5, Side.RIGHT);
                }
                idx += 1;
            }
        }
    }

    const bufferGeometry = new THREE.BufferGeometry();
    bufferGeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array(positions), 3)
    );
    bufferGeometry.setAttribute(
        'uv',
        new THREE.BufferAttribute(new Float32Array(uvs), 2)
    );
    const material = loadForExporting
        ? new THREE.MeshStandardMaterial({
            transparent: true,
            map: await convertTextureForExport(library.texture, library.index)
        })
        : new THREE.RawShaderMaterial({
            vertexShader: compile('vert', brick_vertex),
            fragmentShader: compile('frag', brick_fragment),
            transparent: true,
            uniforms: {
                library: {value: library.texture}
            }
        });
    const mesh = new THREE.Mesh(bufferGeometry, material);

    const scale = 0.75;
    mesh.scale.set(scale, scale, scale);
    mesh.position.set(nZ * 0.5 * scale, 0, -nX * 0.5 * scale);
    mesh.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2.0);
    mesh.frustumCulled = false;
    mesh.name = `layout_${layoutIdx}`;

    return mesh;
}

async function convertTextureForExport(texture, index) {
    const newTexture = texture.clone();
    newTexture.image = await extractImageFromTexture(texture);
    newTexture.name = `library_${index}`;
    return newTexture;
}

async function extractImageFromTexture(texture) {
    const {width, height, data: image_data} = texture.image;
    const arr = new Uint8ClampedArray(width * height * 4);
    for (let i = 0; i < arr.length; i += 1) {
        arr[i] = image_data[i];
    }
    const imageData = new ImageData(arr, width, height);
    const img = await createImageBitmap(imageData);
    (img as any).naturalWidth = width;
    (img as any).naturalHeight = height;
    return img;
}

let expCanvas;
let expCtx;

async function textureToPNG(texture) {
    const image = await extractImageFromTexture(texture);
    expCanvas = expCanvas || document.createElement('canvas');
    expCtx = expCtx || expCanvas.getContext('2d');

    expCanvas.width = (image as any).naturalWidth;
    expCanvas.height = (image as any).naturalHeight;

    expCtx.drawImage(image, 0, 0);

    // Get the base64 encoded data
    const base64data = expCanvas
        .toDataURL('image/png', 1)
        .replace(/^data:image\/png;base64,/, '');

    // Convert to a uint8 array
    return base64ToBuffer(base64data);
}

function base64ToBuffer(str) {
    const b = atob(str);
    const buf = new Uint8Array(b.length);

    for (let i = 0, l = buf.length; i < l; i += 1) {
        buf[i] = b.charCodeAt(i);
    }

    return buf;
}
