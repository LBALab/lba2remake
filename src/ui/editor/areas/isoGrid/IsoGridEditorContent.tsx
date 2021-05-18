import * as React from 'react';
import * as THREE from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';

import Renderer from '../../../../renderer';
import { fullscreen } from '../../../styles/index';
import FrameListener from '../../../utils/FrameListener';
import { TickerProps } from '../../../utils/Ticker';
import { getIsometricCamera } from '../../../../cameras/iso';
import IsoScenery from '../../../../game/scenery/isometric/IsoScenery';
import { getIso3DCamera } from '../../../../cameras/iso3d';
import {
    registerResources,
    preloadResources,
    getScene,
    getPalette,
} from '../../../../resources';
import { WORLD_SCALE_B, WORLD_SIZE } from '../../../../utils/lba';
import DebugData from '../../DebugData';
import { getParams } from '../../../../params';
import { hideBrick, updateGridExtraModels } from '../../../../game/scenery/isometric/grid';
import { saveSceneReplacementModel } from '../../../../game/scenery/isometric/metadata';
import FileSelector from '../layouts/FileSelector';
import { loadModel } from '../../../../game/scenery/isometric/metadata/models';
import { loadLUTTexture } from '../../../../utils/lut';
import { loadPaletteTexture } from '../../../../texture';
import { replaceMaterialsForPreview } from '../../../../game/scenery/isometric/metadata/preview';

enum CursorType {
    BRICK,
    MODEL
}

interface Cursor {
    type: CursorType;
    x: number;
    y: number;
    z: number;
}

interface BlockData {
    type: 'block';
    x: number;
    y: number;
    z: number;
    block: {
        layout: number;
        block: number;
    };
}

interface ModelData {
    type: 'model';
    mesh: THREE.Object3D;
    name: string;
}

interface Props extends TickerProps {
    params: any;
    sharedState: {
        isoGridIdx: number;
        cam: number;
    };
    stateHandler: any;
}

interface State {
    isoGrid?: any;
    isoGridIdx: number;
    renderer?: any;
    scene: any;
    clock: THREE.Clock;
    cameras: any[];
    controlsState: {
        cameraLerp: THREE.Vector3;
        cameraLookAtLerp: THREE.Vector3;
        cameraOrientation: THREE.Quaternion;
        cameraHeadOrientation: THREE.Quaternion;
        cameraSpeed: THREE.Vector3;
        freeCamera: boolean;
    };
    cursorObj: THREE.Object3D;
    cursor?: Cursor;
    showCursorGizmo: boolean;
    selectionData?: BlockData | ModelData;
    showOriginal: boolean;
    highlight: boolean;
    updateProgress?: string;
    replacementFiles?: string[];
}

const canvasStyle = {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 100,
    cursor: 'move',
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

const mainInfoButton = {
    margin: '4px',
    padding: '5px 10px',
    color: 'white',
    background: 'rgb(45, 45, 48)'
};

const infoButton = {
    margin: '2px',
    padding: '0.2em 0.4em'
};

const UP = new THREE.Vector3(0, 1, 0);
const EULER = new THREE.Euler(0.0, 0.0, 0.0, 'YXZ');
const MAX_X_ANGLE = Math.PI / 2.5;
const DUMMY_OBJ = new THREE.Object3D();

export default class IsoGridEditorContent extends FrameListener<Props, State> {
    root: HTMLElement;
    canvas: HTMLCanvasElement;
    gizmo: TransformControls;
    boxHelper: THREE.BoxHelper;
    models: Set<THREE.Object3D> = new Set();
    gizmoEnabled: boolean = false;
    moving: boolean = false;
    isoGridIdx: number = -1;
    loading: boolean = false;
    clickStart: number = 0;
    zoom: number = 1;
    lastTick = 0;
    angle = 0;
    cam = 0;

    constructor(props) {
        super(props);

        this.onLoad = this.onLoad.bind(this);
        this.frame = this.frame.bind(this);
        this.saveDebugScope = this.saveDebugScope.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onWheel = this.onWheel.bind(this);
        this.setShowOriginal = this.setShowOriginal.bind(this);
        this.setShowCursorGizmo = this.setShowCursorGizmo.bind(this);
        this.toggleGizmoRotation = this.toggleGizmoRotation.bind(this);
        this.setHighlight = this.setHighlight.bind(this);
        this.add3DModel = this.add3DModel.bind(this);
        this.closeReplacement = this.closeReplacement.bind(this);
        this.useFile = this.useFile.bind(this);
        this.applyChanges = this.applyChanges.bind(this);

        const isoCamera = getIsometricCamera();
        const iso3DCamera = getIso3DCamera();
        const cameras = [isoCamera, iso3DCamera, iso3DCamera];
        const camera = cameras[this.cam];
        const scene = {
            camera,
            threeScene: new THREE.Scene(),
            scenery: {},
            target: {
                threeObject: new THREE.Object3D()
            }
        };
        const controlsState = {
            cameraLerp: new THREE.Vector3(),
            cameraLookAtLerp: new THREE.Vector3(),
            cameraOrientation: new THREE.Quaternion(),
            cameraHeadOrientation: new THREE.Quaternion(),
            cameraSpeed: new THREE.Vector3(),
            freeCamera: true,
        };
        scene.threeScene.name = 'GridEditor';
        scene.threeScene.add(isoCamera.threeCamera);
        scene.threeScene.add(iso3DCamera.controlNode);
        const selectionObj = makeSelectionObject();
        selectionObj.name = 'BricksCursor';
        selectionObj.visible = false;
        scene.threeScene.add(selectionObj);
        const clock = new THREE.Clock(false);
        this.state = {
            scene,
            clock,
            controlsState,
            cursorObj: selectionObj,
            showCursorGizmo: true,
            isoGridIdx: 0,
            cameras,
            highlight: false,
            showOriginal: false
        };
        this.boxHelper = new THREE.BoxHelper(DUMMY_OBJ, 0xffff00);
        this.boxHelper.visible = false;
        this.boxHelper.name = 'BB';
        scene.threeScene.add(this.boxHelper);
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
            const camera = this.state.scene.camera.threeCamera;
            this.gizmo = new TransformControls(camera, this.canvas);
            this.gizmo.setRotationSnap(Math.PI / 2);
            this.gizmo.addEventListener('mouseDown', () => {
                this.gizmoEnabled = true;
            });
            this.gizmo.addEventListener('mouseUp', () => {
                this.gizmoEnabled = false;
            });
            this.gizmo.addEventListener('objectChange', async () => {
                const { cursor, isoGrid, selectionData } = this.state;
                const position = this.gizmo.object.position;
                if (cursor && cursor.type === CursorType.BRICK) {
                    const OW = WORLD_SCALE_B;
                    const OH = WORLD_SCALE_B * 0.5;
                    const H_OW = OW * 0.5;
                    const H_OH = OH * 0.5;
                    position.set(
                        Math.round(position.x / OW - H_OW) * OW + H_OW,
                        Math.round(position.y / OH - H_OH) * OH + H_OH,
                        Math.round(position.z / OW - H_OW) * OW + H_OW,
                    );
                    const newCursor = {
                        type: CursorType.BRICK,
                        x: Math.round((position.z / WORLD_SIZE) * 32 - 0.5),
                        y: Math.round((position.y / WORLD_SIZE) * 64 - 0.5),
                        z: Math.round(64.5 - (position.x / WORLD_SIZE) * 32),
                    };
                    if (cursor.x !== newCursor.x ||
                        cursor.y !== newCursor.y ||
                        cursor.z !== newCursor.z) {
                        const newSelection = isoGrid.getBrickInfo(newCursor);
                        this.select(newSelection, newCursor);
                    }
                } else {
                    position.multiplyScalar(2).round().multiplyScalar(0.5);
                    this.boxHelper.update();
                    if (selectionData && selectionData.type === 'model') {
                        const mesh = selectionData.mesh;
                        let changed = false;
                        if (this.gizmo.mode === 'rotate') {
                            if (!mesh.quaternion.equals(mesh.userData.quaternion)) {
                                mesh.traverse((node) => {
                                    node.updateMatrix();
                                    node.updateMatrixWorld(true);
                                    if (node instanceof THREE.Mesh &&
                                        node.material instanceof THREE.RawShaderMaterial) {
                                        const material = node.material as THREE.RawShaderMaterial;
                                        material.uniforms.uNormalMatrix.value.setFromMatrix4(
                                            node.matrixWorld
                                        );
                                    }
                                });
                                changed = true;
                                mesh.userData.quaternion.copy(mesh.quaternion);
                            }
                        } else {
                            if (!mesh.position.equals(mesh.userData.position)) {
                                changed = true;
                                mesh.userData.position.copy(mesh.position);
                            }
                        }
                        if (changed) {
                            const sceneData = await getScene(this.state.isoGridIdx);
                            updateGridExtraModels(sceneData.sceneryIndex, this.models);
                        }
                    }
                }
            });
            this.gizmo.enabled = false;
            this.gizmo.visible = false;
            this.gizmo.name = 'Gizmo';
            this.state.scene.threeScene.add(this.gizmo);
            const renderer = new Renderer(this.canvas, 'iso_grids_editor');
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
        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('keyup', this.onKeyUp);
    }

    componentWillUnmount() {
        if (this.state.renderer) {
            this.state.renderer.dispose();
        }
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('keyup', this.onKeyUp);
        super.componentWillUnmount();
    }

    onKeyDown(event) {
        switch (event.code) {
            case 'ArrowLeft': {
                const newTick = Date.now();
                if (newTick - this.lastTick > 400) {
                    this.lastTick = newTick;
                    this.angle -= 1;
                    if (this.angle < 0) {
                        this.angle = 3;
                    }
                    this.state.scene.camera.rotateLeft();
                }
                break;
            }
            case 'ArrowRight': {
                const newTick = Date.now();
                if (newTick - this.lastTick > 400) {
                    this.lastTick = newTick;
                    this.angle = (this.angle + 1) % 4;
                    this.state.scene.camera.rotateRight();
                }
                break;
            }
            case 'ArrowUp': {
                const { cursor, isoGrid } = this.state;
                if (cursor && cursor.type === CursorType.BRICK && isoGrid) {
                    const { x, y, z } = cursor;
                    if (y >= 24) {
                        break;
                    }
                    const newCursor = { type: CursorType.BRICK, x, y: y + 1, z };
                    const newSelection = isoGrid.getBrickInfo(newCursor);
                    this.select(newSelection, newCursor);
                }
                break;
            }
            case 'ArrowDown': {
                const { cursor, isoGrid } = this.state;
                if (cursor && cursor.type === CursorType.BRICK && isoGrid) {
                    const { x, y, z } = cursor;
                    if (y <= 0) {
                        break;
                    }
                    const newCursor = { type: CursorType.BRICK, x, y: y - 1, z };
                    const newSelection = isoGrid.getBrickInfo(newCursor);
                    this.select(newSelection, newCursor);
                }
                break;
            }
            case 'KeyC':
                this.props.stateHandler.setCam((this.props.sharedState.cam + 1) % 3);
            break;
            case 'KeyW':
                this.state.controlsState.cameraSpeed.z = 1;
                break;
            case 'KeyS':
                this.state.controlsState.cameraSpeed.z = -1;
                break;
            case 'KeyA':
                this.state.controlsState.cameraSpeed.x = 1;
                break;
            case 'KeyD':
                this.state.controlsState.cameraSpeed.x = -1;
                break;
            case 'KeyH':
                const s = this.state.selectionData;
                if (s && s.type === 'block' && this.state.isoGrid) {
                    const isoGrid = this.state.isoGrid;
                    getScene(this.isoGridIdx).then((sceneData) => {
                        hideBrick(sceneData.sceneryIndex, isoGrid, `${s.x}x${s.y}x${s.z}`);
                    });
                }
                break;
            case 'KeyX':
            case 'Delete':
                const { selectionData } = this.state;
                if (selectionData.type === 'model') {
                    this.state.isoGrid.threeObject.remove(selectionData.mesh);
                    this.models.delete(selectionData.mesh);
                    this.gizmo.object = undefined;
                    this.setState({ selectionData: null, cursor: null });
                    getScene(this.state.isoGridIdx).then((sceneData) => {
                        updateGridExtraModels(sceneData.sceneryIndex, this.models);
                    });
                }
                break;
            case 'KeyM':
                this.add3DModel();
                break;
            case 'KeyT':
                this.toggleGizmoRotation();
                break;
            case 'Escape': {
                if (this.state.replacementFiles) {
                    this.closeReplacement();
                }
                break;
            }
        }
    }

    toggleGizmoRotation() {
        if (!(this.state.cursor && this.state.cursor.type === CursorType.MODEL)) {
            return;
        }

        if (this.gizmo.mode === 'translate') {
            this.gizmo.setMode('rotate');
            this.gizmo.showX = false;
            this.gizmo.showZ = false;
        } else {
            this.gizmo.setMode('translate');
            this.gizmo.showX = true;
            this.gizmo.showZ = true;
        }
    }

    onKeyUp(event) {
        switch (event.code) {
            case 'ArrowLeft':
            case 'ArrowRight': {
                this.lastTick = 0;
            }
            case 'KeyW':
                if (this.state.controlsState.cameraSpeed.z === 1)
                    this.state.controlsState.cameraSpeed.z = 0;
                break;
            case 'KeyS':
                if (this.state.controlsState.cameraSpeed.z === -1)
                    this.state.controlsState.cameraSpeed.z = 0;
                break;
            case 'KeyA':
                if (this.state.controlsState.cameraSpeed.x === 1)
                    this.state.controlsState.cameraSpeed.x = 0;
                break;
            case 'KeyD':
                if (this.state.controlsState.cameraSpeed.x === -1)
                    this.state.controlsState.cameraSpeed.x = 0;
                break;
        }
    }

    pick(event) {
        const { scene, isoGrid } = this.state;
        if (scene && isoGrid && this.canvas) {
            const rect = this.canvas.getBoundingClientRect();
            const mouse = new THREE.Vector2();
            mouse.x = ((event.clientX - rect.left) / (rect.width - rect.left)) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / (rect.bottom - rect.top)) * 2 + 1;
            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, scene.camera.threeCamera);
            const objResult = this.pickObject(raycaster);
            if (objResult) {
                this.selectModel(objResult.object);
                return;
            }
            const selectionData = isoGrid.pickBrick(raycaster);
            this.select(selectionData);
        }
    }

    select(selectionData: BlockData, cursor: Cursor = null) {
        if (selectionData) {
            const { x, y, z } = selectionData;
            this.setBrickCursor(selectionData);
            this.setState({
                selectionData,
                cursor: { type: CursorType.BRICK, x, y, z }
            }, this.saveDebugScope);
        } else {
            if (cursor) {
                this.setBrickCursor(cursor);
            }
            this.setState({ selectionData: null, cursor }, this.saveDebugScope);
        }
    }

    setBrickCursor({ x, y, z}) {
        this.state.cursorObj.position.set(
            (64.5 - z) / 32,
            (y + 0.5) / 64,
            (x + 0.5) / 32
        );
        this.state.cursorObj.position.multiplyScalar(WORLD_SIZE);
        this.gizmo.attach(this.state.cursorObj);
        this.gizmo.setMode('translate');
        this.gizmo.showX = true;
        this.gizmo.showZ = true;
    }

    pickObject(raycaster: THREE.Raycaster) {
        const models = Array.from(this.models);
        const intersections = raycaster.intersectObjects(models, true);
        if (intersections.length === 0) {
            return null;
        }
        let object = intersections[0].object;
        while (object) {
            if (this.models.has(object)) {
                break;
            }
            object = object.parent;
        }
        if (!object) {
            return null;
        }
        return {
            object
        };
    }

    async loadIsoGrid(isoGridIdx, repositionCamera = true) {
        if (this.loading) {
            return;
        }
        this.loading = true;
        this.isoGridIdx = isoGridIdx;
        const sceneData = await getScene(isoGridIdx);
        const isoGrid = await IsoScenery.loadForEditor(sceneData);
        const { isoGrid: oldIsoGrid } = this.state;
        if (oldIsoGrid) {
            this.state.scene.threeScene.remove(oldIsoGrid.threeObject);
        }
        this.state.scene.threeScene.add(isoGrid.threeObject);
        if (repositionCamera) {
            const heroProps = sceneData.actors[0];
            if (heroProps) {
                const {pos} = heroProps;
                this.state.scene.target.threeObject.position.set(
                    pos[0],
                    pos[1],
                    pos[2]
                );
                this.state.scene.target.threeObject.updateWorldMatrix();
            }
        }
        this.models = isoGrid.editorData.models;
        this.loading = false;
        this.setState({isoGrid, isoGridIdx}, this.saveDebugScope);
        return isoGrid;
    }

    frame() {
        const {
            renderer,
            clock,
            scene,
            cameras,
            controlsState,
            isoGrid,
            highlight,
            cursor,
            showOriginal,
            showCursorGizmo,
        } = this.state;
        const { cam, isoGridIdx } = this.props.sharedState;
        if (this.isoGridIdx !== isoGridIdx && isoGridIdx !== undefined) {
            this.loadIsoGrid(isoGridIdx);
        }
        if (this.cam !== cam && cam !== undefined) {
            this.cam = cam;
            scene.camera = cameras[cam];
            if (this.gizmo) {
                this.gizmo.camera = scene.camera.threeCamera;
            }
            if (cam === 2) {
                this.resetCameraState();
            }
        }
        controlsState.freeCamera = this.cam === 2;
        this.checkResize();
        const time = {
            delta: Math.min(clock.getDelta(), 0.05),
            elapsed: clock.getElapsedTime()
        };
        if (isoGrid) {
            const editorData = isoGrid.editorData;
            editorData.mode.value = 0;
            if (showOriginal) {
                editorData.mode.value = 1;
            }
            if (highlight) {
                editorData.mode.value = 2;
            }
            if (editorData.replacementMesh) {
                editorData.replacementMesh.visible = !showOriginal;
            }
            isoGrid.update(null, scene, time);
        }
        if (this.gizmo) {
            const showGizmo = showCursorGizmo && !!cursor;
            this.gizmo.enabled = showGizmo;
            this.gizmo.visible = showGizmo;
        }
        this.boxHelper.visible = !!cursor && cursor.type === CursorType.MODEL;
        this.state.cursorObj.visible = !!cursor && cursor.type === CursorType.BRICK;
        renderer.stats.begin();
        scene.camera.update(scene, controlsState, time);
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

    onMouseDown() {
        if (!this.gizmoEnabled) {
            this.moving = true;
            this.clickStart = Date.now();
        }
    }

    INFO = [
        { x: 'movementX', z: 'movementY', sx: -1, sz: 1 },
        { x: 'movementY', z: 'movementX', sx: 2, sz: -0.5 },
        { x: 'movementX', z: 'movementY', sx: 1, sz: -1 },
        { x: 'movementY', z: 'movementX', sx: -2, sz: 0.5 }
    ];

    onMouseMove(e) {
        if (this.moving) {
            if (this.cam === 2) {
                const movementX = e.movementX || 0;
                const movementY = -e.movementY || 0;

                EULER.setFromQuaternion(this.state.controlsState.cameraHeadOrientation, 'YXZ');
                EULER.y = 0;
                EULER.x = Math.min(
                    Math.max(EULER.x - (movementY * 0.002), -MAX_X_ANGLE),
                    MAX_X_ANGLE
                );
                this.state.controlsState.cameraHeadOrientation.setFromEuler(EULER);
                EULER.setFromQuaternion(this.state.controlsState.cameraOrientation, 'YXZ');
                EULER.x = 0;
                EULER.y -= movementX * 0.002;
                this.state.controlsState.cameraOrientation.setFromEuler(EULER);
            } else {
                const tgtObject = this.state.scene.target.threeObject;
                const speedX = new THREE.Vector3().set(
                    3.6,
                    0,
                    3.6
                );
                const info = this.INFO[this.angle];
                speedX.applyAxisAngle(UP, this.angle * Math.PI / 2);
                speedX.multiplyScalar(e[info.x] * 0.002 * info.sx);
                const speedZ = new THREE.Vector3().set(
                    5,
                    0,
                    -5
                );
                speedX.applyAxisAngle(UP, this.angle * Math.PI / 2);
                speedZ.multiplyScalar(e[info.z] * 0.002 * info.sz);
                tgtObject.position.add(speedZ);
                tgtObject.position.add(speedX);
                tgtObject.updateMatrixWorld();
            }
        }
    }

    onMouseUp(event) {
        this.moving = false;
        if (Date.now() - this.clickStart < 150) {
            this.pick(event);
        }
    }

    onWheel(e) {
        this.zoom += e.deltaY * 0.01;
        this.zoom = Math.min(Math.max(-1, this.zoom), 8);
    }

    resetCameraState() {
        const camera = this.state.scene.camera;
        const controlNode = camera.controlNode;
        if (!controlNode)
            return;

        const baseEuler = new THREE.Euler(0.0, 0.0, 0.0, 'YXZ');
        const headEuler = new THREE.Euler(0.0, 0.0, 0.0, 'YXZ');
        baseEuler.setFromQuaternion(controlNode.quaternion, 'YXZ');
        headEuler.copy(baseEuler);

        headEuler.y = 0;
        this.state.controlsState.cameraHeadOrientation.setFromEuler(headEuler);

        baseEuler.x = 0;
        this.state.controlsState.cameraOrientation.setFromEuler(baseEuler);
    }

    setShowOriginal(e) {
        this.setState({ showOriginal: e.target.checked }, this.saveDebugScope);
    }

    setShowCursorGizmo(e) {
        this.setState({ showCursorGizmo: e.target.checked }, this.saveDebugScope);
    }

    setHighlight(e) {
        this.setState({ highlight: e.target.checked }, this.saveDebugScope);
    }

    async add3DModel() {
        if (!this.state.cursor) {
            return;
        }

        const data = await fetch(`/layout_models/${getParams().game}`);
        const files = await data.json();
        this.setState({ replacementFiles: files }, this.saveDebugScope);
    }

    render() {
        const { replacementFiles } = this.state;
        return <div
            id="renderZone"
            style={fullscreen}
        >
            <div ref={this.onLoad}
                    style={canvasStyle}
                    onMouseDown={this.onMouseDown}
                    onMouseUp={this.onMouseUp}
                    onMouseMove={this.onMouseMove}
                    onMouseLeave={this.onMouseUp}
                    onWheel={this.onWheel}/>
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
        const { cursor, highlight, showOriginal, showCursorGizmo } = this.state;
        return <div style={infoStyle}>
            <div>
                <div>Cursor: {this.renderCursorInfo()}</div>
                {cursor && <div>
                    <label style={{cursor: 'pointer', userSelect: 'none'}}>
                        <input type="checkBox"
                                checked={showCursorGizmo}
                                onChange={this.setShowCursorGizmo} />
                        Show gizmo
                    </label>
                    {showCursorGizmo && cursor.type === CursorType.MODEL &&
                        <React.Fragment>
                            <br/>
                            <button onClick={this.toggleGizmoRotation}>
                                Toggle translate/rotate
                            </button>
                        </React.Fragment>}
                </div>}
                <br/>
                {this.renderSelectionData()}
            </div>
            <div style={{position: 'absolute', right: 0, top: 2, textAlign: 'right'}}>
                <label style={{cursor: 'pointer', userSelect: 'none'}}>
                    <input type="checkBox"
                            checked={showOriginal}
                            onChange={this.setShowOriginal} />
                    Show original bricks
                </label><br/>
                <label style={{cursor: 'pointer', userSelect: 'none'}}>
                    <input type="checkBox"
                            checked={highlight}
                            onChange={this.setHighlight} />
                    Highlight <span style={{color: '#FF0000'}}>replaced</span><br/>
                    and <span style={{color: '#00FF00'}}>hidden</span> bricks
                </label><br/>
                {cursor && <button style={infoButton} onClick={this.add3DModel}>
                    Add 3D model
                </button>}
            </div>
        </div>;
    }

    renderCursorInfo() {
        const { cursor } = this.state;
        if (!cursor) {
            return <span style={{color: '#8a2727'}}>Disabled</span>;
        }
        if (cursor.type === CursorType.MODEL) {
            return <span style={{color: '#ff4949'}}>3D Model</span>;
        }
        return <span style={{color: '#8a2727'}}>
            <span style={{color: '#ff4949'}}>{cursor.x}</span>
            x
            <span style={{color: '#ff4949'}}>{cursor.y}</span>
            x
            <span style={{color: '#ff4949'}}>{cursor.z}</span>
        </span>;
    }

    renderSelectionData() {
        const { selectionData, cursor } = this.state;
        if (!selectionData) {
            if (cursor && cursor.type === CursorType.BRICK) {
                return <span style={{color: '#49d2ff'}}>Empty block</span>;
            }
            return null;
        }
        if (selectionData.type === 'block') {
            return <React.Fragment>
                <div>Layout:&nbsp;
                    <span style={{color: '#49d2ff'}}>{selectionData.block.layout}</span>
                </div>
                <div title="(in layout)">Block:&nbsp;
                    <span style={{color: '#49d2ff'}}>{selectionData.block.block}</span>
                </div>
            </React.Fragment>;
        }
        return <div>Model:&nbsp;
            <span style={{color: '#49d2ff'}}>{selectionData.name}</span>
        </div>;
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

    closeReplacement() {
        this.setState({ replacementFiles: null }, this.saveDebugScope);
    }

    async useFile(file) {
        this.setState({ replacementFiles: null }, this.saveDebugScope);
        const { game } = getParams();
        const gridObject = this.state.isoGrid.threeObject;
        const model = await loadModel(`/models/${game}/layouts/${file}`);
        const mesh = model.scene;
        mesh.position.copy(this.state.cursorObj.position);
        mesh.position.y += WORLD_SCALE_B * 0.25;
        const m = gridObject.matrix.clone().invert();
        mesh.position.applyMatrix4(m);
        mesh.scale.setScalar(1 / 0.75);
        const [palette, lutTexture] = await Promise.all([
            getPalette(),
            await loadLUTTexture(),
        ]);
        const paletteTexture = loadPaletteTexture(palette);
        const sceneData = await getScene(this.isoGridIdx);
        const light = getLightVector(sceneData.ambience);
        const shaderData = {lutTexture, paletteTexture, light};
        gridObject.add(mesh);
        replaceMaterialsForPreview(mesh, shaderData);
        mesh.name = file;
        mesh.userData.quaternion = mesh.quaternion.clone();
        mesh.userData.position = mesh.position.clone();
        this.models.add(mesh);
        updateGridExtraModels(sceneData.sceneryIndex, this.models);
        this.selectModel(mesh);
    }

    selectModel(mesh: THREE.Object3D) {
        this.gizmo.attach(mesh);
        this.boxHelper.setFromObject(mesh);
        this.setState({
            selectionData: {
                type: 'model',
                mesh,
                name: mesh.name
            },
            cursor: {
                type: CursorType.MODEL,
                x: 0,
                y: 0,
                z: 0
            }
        });
    }

    async applyChanges() {
        if (!window.isLocalServer) {
            return;
        }
        this.setState({ updateProgress: 'Applying changes...' }, this.saveDebugScope);
        const sceneData = await getScene(this.isoGridIdx);
        await saveSceneReplacementModel(sceneData.sceneryIndex, sceneData.ambience);
        await this.loadIsoGrid(this.isoGridIdx, false);
        this.setState({ updateProgress: null }, this.saveDebugScope);
    }
}

function makeSelectionObject() {
    const geometry = new THREE.BoxBufferGeometry(WORLD_SCALE_B, WORLD_SCALE_B * 0.5, WORLD_SCALE_B);
    const edges = new THREE.EdgesGeometry(geometry);
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({
        color: 0xffffff
    }));
    return line;
}

function getLightVector(ambience) {
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
