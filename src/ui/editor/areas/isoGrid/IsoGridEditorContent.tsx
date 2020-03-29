import * as React from 'react';
import * as THREE from 'three';
import Renderer from '../../../../renderer';
import { fullscreen } from '../../../styles/index';
import FrameListener from '../../../utils/FrameListener';
import DebugData from '../../DebugData';
import { TickerProps } from '../../../utils/Ticker';
import { getIsometricCamera } from '../../../../cameras/iso';
import { loadIsometricScenery } from '../../../../iso';
import { loadSceneMapData } from '../../../../scene/map';
import { getLanguageConfig } from '../../../../lang';
import { loadSceneData } from '../../../../scene';
import { getIso3DCamera } from '../../../../cameras/iso3d';
import { registerStaticResource, preloadResources } from '../../../../resources';

interface Props extends TickerProps {
    mainData: any;
    saveMainData: Function;
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
    };
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

/*
const infoButton = {
    margin: '2px 4px',
    padding: '5px 10px'
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
*/

const UP = new THREE.Vector3(0, 1, 0);

export default class IsoGridEditorContent extends FrameListener<Props, State> {
    root: HTMLElement;
    canvas: HTMLCanvasElement;
    moving: boolean = false;
    isoGridIdx: number = -1;
    loading: boolean = false;
    zoom: number = 1;
    lastTick = 0;
    angle = 0;
    cam = 0;

    constructor(props) {
        super(props);

        this.onLoad = this.onLoad.bind(this);
        this.frame = this.frame.bind(this);
        this.saveData = this.saveData.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onWheel = this.onWheel.bind(this);

        if (props.mainData) {
            this.state = props.mainData.state;
        } else {
            const isoCamera = getIsometricCamera();
            const iso3DCamera = getIso3DCamera();
            const cameras = [isoCamera, iso3DCamera];
            const camera = cameras[this.cam];
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
            scene.threeScene.add(isoCamera.threeCamera);
            scene.threeScene.add(iso3DCamera.controlNode);
            const clock = new THREE.Clock(false);
            this.state = {
                scene,
                clock,
                controlsState,
                isoGridIdx: 0,
                cameras
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

    preload() {
        registerStaticResource('RESS', 'RESS.HQR');
        registerStaticResource('BRICKS', 'LBA_BKG.HQR');
        registerStaticResource('SCENE', 'SCENE.HQR');
        registerStaticResource('TEXT', 'TEXT.HQR');

        preloadResources();
    }

    onLoad(root) {
        this.preload();
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
                    'iso_grids_editor'
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
        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('keyup', this.onKeyUp);
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('keyup', this.onKeyUp);
        super.componentWillUnmount();
    }

    onKeyDown(event) {
        const key = event.code || event.which || event.keyCode;
        switch (key) {
            case 37: // left
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
            case 39: // right
            case 'ArrowRight': {
                const newTick = Date.now();
                if (newTick - this.lastTick > 400) {
                    this.lastTick = newTick;
                    this.angle = (this.angle + 1) % 4;
                    this.state.scene.camera.rotateRight();
                }
                break;
            }
            case 27: // escape
            case 'Escape': {
                break;
            }
        }
    }

    onKeyUp(event) {
        const key = event.code || event.which || event.keyCode;
        switch (key) {
            case 37: // left
            case 'ArrowLeft':
            case 39: // right
            case 'ArrowRight': {
                this.lastTick = 0;
            }
        }
    }

    async loadIsoGrid(isoGridIdx) {
        if (this.loading) {
            return;
        }
        this.loading = true;
        this.isoGridIdx = isoGridIdx;
        const sceneData = await loadSceneData(getLanguageConfig().language, isoGridIdx);
        const sceneMap = await loadSceneMapData();
        const isoGrid = await loadIsometricScenery(
            sceneMap[isoGridIdx].index,
            sceneData.ambience,
            true
        );
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
        this.setState({isoGrid, isoGridIdx});
        return isoGrid;
    }

    frame() {
        const { renderer, clock, scene, cameras, controlsState } = this.state;
        const { cam } = this.props.sharedState;
        const { isoGridIdx } = DebugData.scope;
        if (this.isoGridIdx !== isoGridIdx && isoGridIdx !== undefined) {
            this.loadIsoGrid(isoGridIdx);
        }
        if (this.cam !== cam && cam !== undefined) {
            this.cam = cam;
            scene.camera = cameras[cam];
        }
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
    }

    INFO = [
        { x: 'movementX', z: 'movementY', sx: -1, sz: 1 },
        { x: 'movementY', z: 'movementX', sx: 2, sz: -0.5 },
        { x: 'movementX', z: 'movementY', sx: 1, sz: -1 },
        { x: 'movementY', z: 'movementX', sx: -2, sz: 0.5 }
    ];

    onMouseMove(e) {
        if (this.moving) {
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

    onMouseUp() {
        this.moving = false;
    }

    onWheel(e) {
        this.zoom += e.deltaY * 0.01;
        this.zoom = Math.min(Math.max(-1, this.zoom), 8);
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
        const {isoGrid} = this.state;
        if (isoGrid) {
            return <div style={infoStyle}>

            </div>;
        }
        return null;
    }
}
