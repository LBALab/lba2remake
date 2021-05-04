import * as React from 'react';
import * as THREE from 'three';
import { omit, cloneDeep, times, each } from 'lodash';
import { saveAs } from 'file-saver';

import { ColladaExporter } from 'three/examples/jsm/exporters/ColladaExporter';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import Renderer from '../../../../renderer';
import { fullscreen } from '../../../styles/index';
import FrameListener from '../../../utils/FrameListener';
import DebugData from '../../DebugData';
import { TickerProps } from '../../../utils/Ticker';
import { getIsometricCamera } from '../../../../cameras/iso';
import { loadLibrary } from '../../../../game/scenery/isometric/grid';
import { OffsetBySide, Side } from '../../../../game/scenery/isometric/mapping';
import { compile } from '../../../../utils/shaders';
import brick_vertex from '../../../../game/scenery/isometric/shaders/brick.vert.glsl';
import brick_fragment from '../../../../game/scenery/isometric/shaders/brick.frag.glsl';
import { loadLUTTexture } from '../../../../utils/lut';
import { loadPaletteTexture } from '../../../../texture';
import { replaceMaterialsForPreview } from '../../../../game/scenery/isometric/metadata/preview';
import { saveSceneReplacementModel } from '../../../../game/scenery/isometric/metadata';
import {
    registerResources,
    preloadResources,
    getPalette,
    getScene,
    getSceneMap,
    getBricksHQR,
    getBricks,
} from '../../../../resources';
import { applyAnimationUpdaters } from '../../../../game/scenery/isometric/metadata/animations';
import { loadBrickMask } from '../../../../game/scenery/isometric/mask';
import { getParams } from '../../../../params';
import { saveTexture, convertTextureForExport } from '../../../../utils/textures';
import FileSelector from './FileSelector';

interface Props extends TickerProps {
    params: any;
    sharedState: {
        library: number;
        layout: number;
        rotateView: boolean;
        wireframe: boolean;
        grid: boolean;
        variant?: any;
    };
    stateHandler: any;
    split: (orientation: number, newContent: any) => void;
}

interface State {
    layout?: any;
    library?: any;
    variant?: any;
    renderer?: any;
    scene: any;
    clock: THREE.Clock;
    grid: any;
    showOriginal: boolean;
    controlsState: {
        cameraLerp: THREE.Vector3;
        cameraLookAtLerp: THREE.Vector3;
    };
    replacementFiles?: string[];
    lSettings?: {
        mirror?: boolean;
        replace?: boolean;
        threeObject?: THREE.Object3D;
        file?: string;
        orientation?: number;
    };
    updateProgress?: string;
}

const canvasStyle = {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 100,
    background: 'black'
};

const infoStyle = {
    position: 'absolute' as const,
    left: 0,
    right: 0,
    bottom: 0,
    height: 100,
    borderTop: '1px solid white'
};

const applyChangesStyle = {
    position: 'absolute' as const,
    left: 0,
    bottom: 100
};

const infoButton = {
    margin: '2px',
    padding: '0.2em 0.4em'
};

const mainInfoButton = {
    margin: '4px',
    padding: '5px 10px',
    color: 'white',
    background: 'rgb(45, 45, 48)'
};

const dataBlock = {
    display: 'inline-block' as const,
    borderRight: '1px dashed black',
    padding: '5px 10px',
    height: '100%'
};

const exporter = new ColladaExporter();
const loader = new GLTFLoader();

let layoutsMetadata = null;

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
    variant: any;
    wireframe: boolean;
    moving: boolean;
    moved: boolean;
    mask: ImageData;
    mixer: THREE.AnimationMixer;
    loading: boolean = false;

    constructor(props) {
        super(props);

        this.onLoad = this.onLoad.bind(this);
        this.frame = this.frame.bind(this);
        this.saveDebugScope = this.saveDebugScope.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onWheel = this.onWheel.bind(this);
        this.listener = this.listener.bind(this);
        this.export = this.export.bind(this);
        this.exportTexture = this.exportTexture.bind(this);
        this.replaceByModel = this.replaceByModel.bind(this);
        this.useFile = this.useFile.bind(this);
        this.closeReplacement = this.closeReplacement.bind(this);
        this.resetToIso = this.resetToIso.bind(this);
        this.changeAngle = this.changeAngle.bind(this);
        this.setMirror = this.setMirror.bind(this);
        this.setShowOriginal = this.setShowOriginal.bind(this);
        this.applyChanges = this.applyChanges.bind(this);

        this.mouseSpeed = {
            x: 0,
            y: 0
        };

        this.zoom = 0;
        this.layout = -1;

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
        const clock = new THREE.Clock(false);
        this.state = {
            scene,
            clock,
            grid,
            controlsState,
            showOriginal: false,
            updateProgress: null
        };
        clock.start();
    }

    saveDebugScope() {
        DebugData.scope = this.state;
    }

    async preload() {
        const { game } = getParams();
        await registerResources(game, 'EN', 'EN');
        await preloadResources();
    }

    async onLoad(root) {
        if (!this.root && root) {
            await this.preload();
            this.canvas = document.createElement('canvas');
            this.canvas.tabIndex = 0;
            const renderer = new Renderer(this.canvas, 'layouts_editor');
            renderer.threeRenderer.setAnimationLoop(() => {
                this.props.ticker.frame();
            });
            this.setState({ renderer }, this.saveDebugScope);
            this.root = root;
            this.root.appendChild(this.canvas);
        }
    }

    componentWillMount() {
        super.componentWillMount();
        window.addEventListener('keydown', this.listener);
    }

    componentWillUnmount() {
        if (this.state.renderer) {
            this.state.renderer.dispose();
        }
        window.removeEventListener('keydown', this.listener);
        super.componentWillUnmount();
    }

    listener(event) {
        if (this.state.library) {
            switch (event.code) {
                case 'ArrowLeft': {
                    const newLayout = Math.max(0, this.props.sharedState.layout - 1);
                    this.props.stateHandler.setLayout(newLayout);
                    break;
                }
                case 'ArrowRight': {
                    const newLayout = Math.min(
                        this.state.library.layouts.length - 1,
                        this.props.sharedState.layout + 1
                    );
                    this.props.stateHandler.setLayout(newLayout);
                    break;
                }
                case 'Escape': {
                    if (this.state.replacementFiles) {
                        this.closeReplacement();
                    }
                    break;
                }
                case 'Semicolon': {
                    this.toggleMirror();
                    break;
                }
                case 'KeyM': {
                    this.replaceByModel();
                    break;
                }
            }
        }
    }

    async loadLayout(libraryIdx, layoutIdx, variant = null) {
        if (this.loading) {
            return;
        }
        this.loading = true;
        this.layout = layoutIdx;
        this.library = libraryIdx;
        this.variant = variant;
        const [palette, bricks, lutTexture] = await Promise.all([
            getPalette(),
            getBricks(),
            await loadLUTTexture(),
        ]);
        const paletteTexture = loadPaletteTexture(palette);
        const light = getLightVector();
        if (!this.mask) {
            this.mask = await loadBrickMask();
        }
        const shaderData = {lutTexture, paletteTexture, light};
        const library = await loadLibrary(bricks, this.mask, palette, libraryIdx);
        const layoutProps = library.layouts[layoutIdx];
        const layoutMesh = variant
            ? await loadVariantMesh(library, variant)
            : await loadLayoutMesh(library, layoutIdx);
        const layoutObj = {
            index: layoutIdx,
            props: layoutProps,
            threeObject: layoutMesh,
            variant
        };
        const {
            layout: oldLayout,
            lSettings: oldSettings
        } = this.state;
        if (oldLayout) {
            this.state.scene.threeScene.remove(oldLayout.threeObject);
        }
        if (oldSettings) {
            this.state.scene.threeScene.remove(oldSettings.threeObject);
        }
        if (!layoutsMetadata) {
            const { game } = getParams();
            const rawRD = await fetch(`/metadata/${game}/layouts.json`);
            layoutsMetadata = await rawRD.json();
        }
        DebugData.scope.layoutsMetadata = layoutsMetadata;
        let lSettings = null;
        if (libraryIdx in layoutsMetadata) {
            if (variant) {
                const key = `${layoutIdx}:${variant.key}`;
                lSettings = cloneDeep(layoutsMetadata[libraryIdx][key]);
            } else if (layoutIdx in layoutsMetadata[libraryIdx]) {
                lSettings = cloneDeep(layoutsMetadata[libraryIdx][layoutIdx]);
            }
        }
        if (lSettings && lSettings.replace) {
            const model = await loadModel(lSettings.file);
            const angle = (Math.PI / 2.0) * lSettings.orientation;
            model.scene.quaternion.setFromAxisAngle(
                new THREE.Vector3(0, 1, 0),
                angle
            );
            lSettings.threeObject = model.scene;
            replaceMaterialsForPreview(lSettings.threeObject, shaderData);
            this.animateModel(model);
            this.state.scene.threeScene.add(lSettings.threeObject);
            layoutObj.threeObject.visible = false;
        }
        this.state.scene.threeScene.add(layoutObj.threeObject);
        this.setState({
            showOriginal: false,
            library,
            layout: layoutObj,
            lSettings
        }, this.saveDebugScope);
        DebugData.scope = this.state;
        this.wireframe = false;
        this.loading = false;
    }

    animateModel(model) {
        this.mixer = new THREE.AnimationMixer(model.scene);
        applyAnimationUpdaters(model.scene, model.animations);
        each(model.animations, (clip) => {
            this.mixer.clipAction(clip).play();
        });
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
        const { layout, library, variant, wireframe } = this.props.sharedState;
        if (this.library !== library || this.layout !== layout || this.variant !== variant) {
            this.loadLayout(library, layout, variant);
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
        if (this.mixer) {
            this.mixer.update(time.delta);
        }
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
        const { variant } = this.props.sharedState;
        if (library && layout) {
            const meshToExport = variant
                ? await loadVariantMesh(library, variant, true)
                : await loadLayoutMesh(library, layout.index, true);
            exporter.parse(meshToExport, (dae) => {
                const blob = new Blob([dae.data], {type: 'application/xml;charset=utf-8'});
                const suffix = variant
                    ? `_variant${variant.id}`
                    : '';
                saveAs(blob, `layout_${library.index}_${layout.index}${suffix}.dae`);
            }, {});
        }
    }

    async exportTexture() {
        const { library } = this.state;
        if (library) {
            await saveTexture(library.texture, `library_${library.index}.png`);
        }
    }

    async replaceByModel() {
        const data = await fetch(`/layout_models/${getParams().game}`);
        const files = await data.json();
        this.setState({ replacementFiles: files }, this.saveDebugScope);
    }

    async resetToIso() {
        const { threeScene } = this.state.scene;
        const oldSettings = this.state.lSettings;
        if (oldSettings) {
            threeScene.remove(oldSettings.threeObject);
        }
        this.state.layout.threeObject.visible = true;
        const { library, layout, variant } = this.props.sharedState;
        const key = variant
            ? `${layout}:${variant.key}`
            : layout;
        delete layoutsMetadata[library][key];
        await this.saveMetadata();
        this.setState({ lSettings: null , showOriginal: true }, this.saveDebugScope);
    }

    closeReplacement() {
        this.setState({ replacementFiles: null }, this.saveDebugScope);
    }

    async useFile(file) {
        this.setState({ replacementFiles: null }, this.saveDebugScope);
        const model = await loadModel(file);
        const { variant } = this.props.sharedState;
        const { threeScene } = this.state.scene;
        const oldSettings = this.state.lSettings;
        if (oldSettings) {
            threeScene.remove(oldSettings.threeObject);
        } else {
            this.state.layout.threeObject.visible = false;
        }
        const lSettings = {
            replace: true,
            threeObject: model.scene,
            file,
            orientation: 0
        };
        const [palette, lutTexture] = await Promise.all([
            getPalette(),
            await loadLUTTexture(),
        ]);
        const paletteTexture = loadPaletteTexture(palette);
        const light = getLightVector();
        const shaderData = {lutTexture, paletteTexture, light};
        replaceMaterialsForPreview(lSettings.threeObject, shaderData);
        this.animateModel(model);
        const { library, layout } = this.props.sharedState;
        if (!(library in layoutsMetadata)) {
            layoutsMetadata[library] = {};
        }
        const key = variant
            ? `${layout}:${variant.key}`
            : layout;
        layoutsMetadata[library][key] = omit(lSettings, 'threeObject');
        await this.saveMetadata();
        threeScene.add(lSettings.threeObject);
        this.setState({ lSettings, showOriginal: false }, this.saveDebugScope);
    }

    async saveMetadata() {
        const { game } = getParams();
        if (!window.isLocalServer) {
            return;
        }
        return fetch(`/metadata/${game}`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'layouts',
                content: layoutsMetadata
            })
        });
    }

    render() {
        const { replacementFiles } = this.state;
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
            {this.renderApplyButton()}
            <div id="stats" style={{position: 'absolute', top: 0, left: 0, width: '50%'}}/>
            {replacementFiles
                && <FileSelector files={replacementFiles}
                                    useFile={this.useFile}
                                    close={this.closeReplacement} />}
        </div>;
    }

    renderInfo() {
        const {layout, lSettings} = this.state;
        if (layout) {
            const {variant} = this.props.sharedState;
            const info = variant ? variant : layout.props;
            return <div style={infoStyle}>
                <div style={dataBlock}>
                    Layout {layout.index}<br/>
                    {variant &&
                        <span style={{color: 'rgb(0, 200, 255)'}}>
                            &nbsp;&nbsp;Variant {variant.id}
                        </span>}<br/>
                    Width (x): {info.nX}<br/>
                    Height (y): {info.nY}<br/>
                    Depth (z): {info.nZ}
                </div>
                {this.renderLayoutOptions()}
                {this.renderReplacementData()}
                <div style={{position: 'absolute', right: 0, top: 2, textAlign: 'right'}}>
                    <button style={infoButton} onClick={this.export}>
                        Download {variant ? 'variant' : 'layout'}
                    </button>
                    <br/>
                    <button style={infoButton} onClick={this.exportTexture}>
                        Download library texture
                    </button>
                    <br/>
                    {(lSettings && lSettings.replace)
                        ? <React.Fragment>
                            <small>{lSettings.file}</small>&nbsp;
                            <button style={infoButton} onClick={this.resetToIso}>
                                Reset to iso
                            </button>
                        </React.Fragment>
                        : <button style={infoButton} onClick={this.replaceByModel}>
                            Replace by 3D model
                        </button>}
                </div>
            </div>;
        }
        return null;
    }

    renderApplyButton() {
        if (!window.isLocalServer) {
            return null;
        }
        const progressStyle = {
            background: '#222222',
            color: 'red',
            padding: 5
        };
        return <div style={applyChangesStyle}>
            {this.state.updateProgress
                ? <div style={progressStyle}>{this.state.updateProgress}</div>
                : <button style={mainInfoButton} onClick={this.applyChanges}>
                    Apply changes
                </button>
            }
        </div>;
    }

    async applyChanges() {
        if (!window.isLocalServer) {
            return;
        }
        const { library } = this.props.sharedState;
        const scenes = getParams().game === 'lba1'
            ? [library]
            : await findScenesUsingLibrary(library);
        this.setState({
            updateProgress: `Applied changes to 0 / ${scenes.length} scenes...`
        }, this.saveDebugScope);
        const sceneMap = await getSceneMap();
        let count = 0;
        const promises = scenes.map(async (scene) => {
            const sceneData = await getScene(scene);
            await saveSceneReplacementModel(sceneMap[scene].sceneryIndex, sceneData.ambience);
            count += 1;
            this.setState({
                updateProgress: `Applied changes to ${count} / ${scenes.length} scenes...`
            }, this.saveDebugScope);
        });
        await Promise.all(promises);
        this.setState({ updateProgress: null }, this.saveDebugScope);
    }

    async changeAngle(e) {
        const { lSettings } = this.state;
        if (!lSettings || !lSettings.replace) {
            return;
        }
        const { library, layout, variant } = this.props.sharedState;
        lSettings.orientation = Number(e.target.value);
        lSettings.threeObject.quaternion.setFromAxisAngle(
            new THREE.Vector3(0, 1, 0),
            (Math.PI / 2.0) * lSettings.orientation
        );
        lSettings.threeObject.traverse((node) => {
            node.updateMatrix();
            node.updateMatrixWorld(true);
            if (node instanceof THREE.Mesh &&
                node.material instanceof THREE.RawShaderMaterial) {
                const material = node.material as THREE.RawShaderMaterial;
                material.uniforms.uNormalMatrix.value.setFromMatrix4(node.matrixWorld);
            }
        });
        this.setState({lSettings}, this.saveDebugScope);
        const key = variant
            ? `${layout}:${variant.key}`
            : layout;
        layoutsMetadata[library][key].orientation = lSettings.orientation;
        await this.saveMetadata();
    }

    async setMirror(e) {
        const { library, layout, variant } = this.props.sharedState;
        this.setState({lSettings: { mirror: e.target.checked }}, this.saveDebugScope);
        if (!(library in layoutsMetadata)) {
            layoutsMetadata[library] = {};
        }
        const key = variant
            ? `${layout}:${variant.key}`
            : layout;
        layoutsMetadata[library][key] = { mirror: e.target.checked };
        await this.saveMetadata();
    }

    async toggleMirror() {
        const { library, layout, variant } = this.props.sharedState;
        const mirror = this.state.lSettings ? !this.state.lSettings.mirror : true;
        this.setState({lSettings: { mirror }}, this.saveDebugScope);
        if (!(library in layoutsMetadata)) {
            layoutsMetadata[library] = {};
        }
        const key = variant
            ? `${layout}:${variant.key}`
            : layout;
        layoutsMetadata[library][key] = { mirror };
        await this.saveMetadata();
    }

    async setShowOriginal(e) {
        this.state.layout.threeObject.visible = e.target.checked;
        this.setState({showOriginal: e.target.checked}, this.saveDebugScope);
    }

    renderLayoutOptions() {
        const {lSettings} = this.state;
        if (!lSettings || !lSettings.replace) {
            return <div style={dataBlock}>
                <label>
                    <input type="checkbox"
                        checked={(lSettings && lSettings.mirror) ? true : false}
                        onChange={this.setMirror}/>
                    Mirror
                </label>
            </div>;
        }
        return null;
    }

    renderReplacementData() {
        const {lSettings, showOriginal} = this.state;
        if (lSettings && lSettings.replace) {
            return <div style={dataBlock}>
                Replacement:<br/><br/>

                <label style={{cursor: 'pointer', userSelect: 'none'}}>
                    <input type="checkBox"
                            checked={showOriginal}
                            onChange={this.setShowOriginal} />
                    Show original
                </label><br/>
                Angle: <select onChange={this.changeAngle} value={lSettings.orientation}>
                    {[0, 1, 2, 3].map(v => <option key={v} value={v}>
                        {v * 90}°
                    </option>)}
                </select>
            </div>;
        }
        return null;
    }
}

async function loadModel(file) : Promise<GLTF> {
    return new Promise((resolve) => {
        const { game } = getParams();
        loader.load(`/models/${game}/layouts/${file}`, resolve);
    });
}

async function loadLayoutMesh(library, layoutIdx, loadForExporting = false) {
    const defaultVariant = {
        id: layoutIdx,
        ...library.layouts[layoutIdx]
    };
    return loadVariantMesh(library, defaultVariant, loadForExporting);
}

async function loadVariantMesh(library, group, loadForExporting = false) {
    const h = 0.5;
    const positions = [];
    const uvs = [];
    const {width, height} = library.texture.image;
    const {id, nX, nY, nZ, blocks} = group;
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
            map: await convertTextureForExport(library.texture, library.index)
        })
        : new THREE.RawShaderMaterial({
            vertexShader: compile('vert', brick_vertex),
            fragmentShader: compile('frag', brick_fragment),
            transparent: true,
            uniforms: {
                library: {value: library.texture}
            },
            glslVersion: Renderer.getGLSLVersion()
        });
    const mesh = new THREE.Mesh(bufferGeometry, material);

    const scale = 0.75;
    mesh.scale.set(scale, scale, scale);
    mesh.position.set(nZ * 0.5 * scale, 0, -nX * 0.5 * scale);
    mesh.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2.0);
    mesh.frustumCulled = false;
    mesh.name = `layout_${id}`;

    return mesh;
}

const ambience = {
    lightingAlpha: 414,
    lightingBeta: 136
};

function getLightVector() {
    const lightVector = new THREE.Vector3(-1, 0, 0);
    lightVector.applyAxisAngle(
        new THREE.Vector3(0, 0, 1),
        -(ambience.lightingAlpha * 2 * Math.PI) / 0x1000
    );
    lightVector.applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        -(ambience.lightingBeta * 2 * Math.PI) / 0x1000
    );
    return lightVector;
}

async function findScenesUsingLibrary(library): Promise<number[]> {
    const bkg = await getBricksHQR();
    const sceneMap = await getSceneMap();
    const scenes = [];
    each(times(222), async (scene) => {
        const indexInfo = sceneMap[scene];
        if (indexInfo.isIsland) {
            return;
        }
        const gridData = new DataView(bkg.getEntry(indexInfo.sceneryIndex + 1));
        const libIndex = gridData.getUint8(0);
        if (libIndex === library) {
            scenes.push(scene);
        }
    });
    return scenes;
}
