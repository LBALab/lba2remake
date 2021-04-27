import * as React from 'react';
import * as THREE from 'three';

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
} from '../../../../resources';
import { WORLD_SCALE_B, WORLD_SIZE } from '../../../../utils/lba';
import DebugData from '../../DebugData';
import { getParams } from '../../../../params';

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
    selectionObj: THREE.Object3D;
    selectionData?: any;
}

const canvasStyle = {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 100,
    cursor: 'move'
};

const infoStyle = {
    position: 'absolute' as const,
    left: 0,
    right: 0,
    bottom: 0,
    height: 100
};

const dataBlock = {
    display: 'inline-block' as const,
    borderRight: '1px dashed black',
    padding: '5px 10px',
    height: '100%'
};

/*
const infoButton = {
    margin: '2px 4px',
    padding: '5px 10px'
};

const closeStyle = {
    position: 'absolute' as const,
    top: 2,
    right: 8,
    width: 24,
    height: 24,
    cursor: 'pointer' as const
};
*/

const UP = new THREE.Vector3(0, 1, 0);
const EULER = new THREE.Euler(0.0, 0.0, 0.0, 'YXZ');
const MAX_X_ANGLE = Math.PI / 2.5;

export default class IsoGridEditorContent extends FrameListener<Props, State> {
    root: HTMLElement;
    canvas: HTMLCanvasElement;
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
        scene.threeScene.add(isoCamera.threeCamera);
        scene.threeScene.add(iso3DCamera.controlNode);
        const selectionObj = makeSelectionObject();
        selectionObj.visible = false;
        scene.threeScene.add(selectionObj);
        const clock = new THREE.Clock(false);
        this.state = {
            scene,
            clock,
            controlsState,
            selectionObj,
            isoGridIdx: 0,
            cameras
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
                const { selectionData, isoGrid } = this.state;
                if (selectionData && isoGrid) {
                    const { x, y, z } = selectionData;
                    const newSelection = isoGrid.getBrickInfo({ x, y: y + 1, z });
                    if (newSelection) {
                        this.select(newSelection);
                    }
                }
                break;
            }
            case 'ArrowDown': {
                const { selectionData, isoGrid } = this.state;
                if (selectionData && isoGrid) {
                    const { x, y, z } = selectionData;
                    const newSelection = isoGrid.getBrickInfo({ x, y: y - 1, z });
                    if (newSelection) {
                        this.select(newSelection);
                    }
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
            case 'Escape': {
                break;
            }
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
            const selectionData = isoGrid.pickBrick(raycaster);
            this.select(selectionData);
        }
    }

    select(selectionData) {
        if (selectionData) {
            const { x, y, z } = selectionData;
            this.state.selectionObj.visible = true;
            this.state.selectionObj.position.set(
                (64.5 - z) / 32,
                (y + 0.5) / 64,
                (x + 0.5) / 32
            );
            this.state.selectionObj.position.multiplyScalar(WORLD_SIZE);
            this.setState({ selectionData }, this.saveDebugScope);
        } else {
            this.state.selectionObj.visible = false;
            this.setState({ selectionData: null }, this.saveDebugScope);
        }
    }

    async loadIsoGrid(isoGridIdx) {
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
        this.loading = false;
        this.setState({isoGrid, isoGridIdx}, this.saveDebugScope);
        return isoGrid;
    }

    frame() {
        const { renderer, clock, scene, cameras, controlsState } = this.state;
        const { cam, isoGridIdx } = this.props.sharedState;
        if (this.isoGridIdx !== isoGridIdx && isoGridIdx !== undefined) {
            this.loadIsoGrid(isoGridIdx);
        }
        if (this.cam !== cam && cam !== undefined) {
            this.cam = cam;
            scene.camera = cameras[cam];
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
        this.moving = true;
        this.clickStart = Date.now();
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

    render() {
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
            <div id="stats" style={{position: 'absolute', top: 0, left: 0, width: '50%'}}/>
        </div>;
    }

    renderInfo() {
        const { selectionData } = this.state;
        if (selectionData) {
            return <div style={infoStyle}>
                <div style={dataBlock}>
                    <div>Selection:</div><br/>
                    <div>X: {selectionData.x}</div>
                    <div>Y: {selectionData.y}</div>
                    <div>Z: {selectionData.z}</div>
                </div>
                <div style={dataBlock}>
                    <div>Layout: {selectionData.block.layout}</div>
                    <div>Block (in layout): {selectionData.block.block}</div>
                </div>
            </div>;
        }
        return null;
    }
}

function makeSelectionObject() {
    const geometry = new THREE.BoxBufferGeometry(WORLD_SCALE_B, WORLD_SCALE_B * 0.5, WORLD_SCALE_B);
    const edges = new THREE.EdgesGeometry(geometry);
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({
        color: 0xff0000
    }));
    return line;
}
