import * as React from 'react';
import * as THREE from 'three';

import Renderer from '../../../../renderer';
import { fullscreen } from '../../../styles/index';
import FrameListener from '../../../utils/FrameListener';
import { loadIslandScenery } from '../../../../island';
import DebugData from '../../DebugData';
import {get3DFreeCamera} from './utils/freeCamera';
import IslandAmbience from './browser/ambience';
import { TickerProps } from '../../../utils/Ticker';
import {
    registerStaticResource,
    registerTransientResource,
    preloadResources
} from '../../../../resources';

interface Props extends TickerProps {
    mainData: any;
    saveMainData: Function;
    params: any;
    sharedState: {
        name: string;
        wireframe: boolean;
    };
    stateHandler: any;
}

interface State {
    island?: any;
    renderer?: any;
    scene: any;
    clock: THREE.Clock;
    cameraOrientation: THREE.Quaternion;
    cameraHeadOrientation: THREE.Quaternion;
    cameraSpeed: {
        x: number;
        z: number;
    };
}
export default class Island extends FrameListener<Props, State> {
    mouseSpeed: {
        x: number;
        y: number;
    };
    zoom: number;
    root: HTMLElement;
    canvas: HTMLCanvasElement;
    mouseEnabled: boolean;
    name: string;
    wireframe: boolean;

    constructor(props) {
        super(props);

        this.onLoad = this.onLoad.bind(this);
        this.frame = this.frame.bind(this);
        this.saveData = this.saveData.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onWheel = this.onWheel.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
        this.onPointerLockChange = this.onPointerLockChange.bind(this);

        document.addEventListener('mousemove', this.onMouseMove, false);
        document.addEventListener('pointerlockchange', this.onPointerLockChange, false);

        this.mouseSpeed = {
            x: 0,
            y: 0
        };

        this.zoom = 0;
        this.mouseEnabled = false;

        if (props.mainData) {
            this.state = props.mainData.state;
        } else {
            const camera = get3DFreeCamera();
            const scene = {
                camera,
                threeScene: new THREE.Scene()
            };
            scene.threeScene.add(camera.controlNode);
            const clock = new THREE.Clock(false);
            this.state = {
                scene,
                clock,
                cameraOrientation: new THREE.Quaternion(),
                cameraHeadOrientation: new THREE.Quaternion(),
                cameraSpeed: {
                    x: 0,
                    z: 0
                },
            };
            clock.start();
        }
    }

    componentWillUnmount() {
        document.removeEventListener('pointerlockchange', this.onPointerLockChange);
        document.removeEventListener('mousemove', this.onMouseMove);
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

        registerTransientResource('ASCENCE-ILE',  'ASCENCE.ILE');
        registerTransientResource('ASCENCE-OBL',  'ASCENCE.OBL');
        registerTransientResource('CELEBRA2-ILE', 'CELEBRA2.ILE');
        registerTransientResource('CELEBRA2-OBL', 'CELEBRA2.OBL');
        registerTransientResource('CELEBRAT-ILE', 'CELEBRAT.ILE');
        registerTransientResource('CELEBRAT-OBL', 'CELEBRAT.OBL');
        registerTransientResource('CITABAU-ILE',  'CITABAU.ILE');
        registerTransientResource('CITABAU-OBL',  'CITABAU.OBL');
        registerTransientResource('CITADEL-ILE',  'CITADEL.ILE');
        registerTransientResource('CITADEL-OBL',  'CITADEL.OBL');
        registerTransientResource('DESERT-ILE',   'DESERT.ILE');
        registerTransientResource('DESERT-OBL',   'DESERT.OBL');
        registerTransientResource('EMERAUDE-ILE', 'EMERAUDE.ILE');
        registerTransientResource('EMERAUDE-OBL', 'EMERAUDE.OBL');
        registerTransientResource('ILOTCX-ILE',   'ILOTCX.ILE');
        registerTransientResource('ILOTCX-OBL',   'ILOTCX.OBL');
        registerTransientResource('KNARTAS-ILE',  'KNARTAS.ILE');
        registerTransientResource('KNARTAS-OBL',  'KNARTAS.OBL');
        registerTransientResource('MOON-ILE',     'MOON.ILE');
        registerTransientResource('MOON-OBL',     'MOON.OBL');
        registerTransientResource('MOSQUIBE-ILE', 'MOSQUIBE.ILE');
        registerTransientResource('MOSQUIBE-OBL', 'MOSQUIBE.OBL');
        registerTransientResource('OTRINGAL-ILE', 'OTRINGAL.ILE');
        registerTransientResource('OTRINGAL-OBL', 'OTRINGAL.OBL');
        registerTransientResource('PLATFORM-ILE', 'PLATFORM.ILE');
        registerTransientResource('PLATFORM-OBL', 'PLATFORM.OBL');
        registerTransientResource('SOUSCELB-ILE', 'SOUSCELB.ILE');
        registerTransientResource('SOUSCELB-OBL', 'SOUSCELB.OBL');

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
                    'islands_editor'
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

    async loadIsland() {
        const oldIsland = this.state.island;
        if (oldIsland) {
            this.state.scene.threeScene.remove(oldIsland.threeObject);
        }
        this.name = this.props.sharedState.name;
        const ambience = IslandAmbience[this.props.sharedState.name];
        const island = await loadIslandScenery(
            { editor: true },
            this.props.sharedState.name,
            ambience,
        );
        island.name = this.name;
        this.state.renderer.applySceneryProps(island.props);

        this.state.scene.threeScene.add(island.threeObject);
        this.setState({ island }, this.saveData);
        this.wireframe = false;
    }

    handleClick() {
        document.body.requestPointerLock();
    }

    onPointerLockChange() {
        this.mouseEnabled = document.pointerLockElement === document.body;
    }

    onMouseMove(e) {
        if (this.mouseEnabled) {
            handleMouseEvent(this.state, e);
        }
    }

    onWheel(e) {
        this.zoom += e.deltaY * 0.05;
        this.zoom = Math.min(Math.max(-1, this.zoom), 50);
    }

    onKeyDown(e) {
        const key = e.nativeEvent.code || e.which || e.keyCode;
        const cameraSpeed = {
            x: this.state.cameraSpeed.x,
            z: this.state.cameraSpeed.z,
        };
        switch (key) {
            case 87: // w
            case 'KeyW':
                cameraSpeed.z = 1;
                break;
            case 83: // s
            case 'KeyS':
                cameraSpeed.z = -1;
                break;
            case 65: // a
            case 'KeyA':
                cameraSpeed.x = 1;
                break;
            case 68: // d
            case 'KeyD':
                cameraSpeed.x = -1;
                break;
        }
        this.setState({ cameraSpeed }, this.saveData);
    }

    onKeyUp(e) {
        const key = e.nativeEvent.code || e.which || e.keyCode;
        const cameraSpeed = {
            x: this.state.cameraSpeed.x,
            z: this.state.cameraSpeed.z,
        };
        switch (key) {
            case 87: // w
            case 'KeyW':
                if (cameraSpeed.z === 1)
                    cameraSpeed.z = 0;
                break;
            case 83: // s
            case 'KeyS':
                if (cameraSpeed.z === -1)
                    cameraSpeed.z = 0;
                break;
            case 65: // a
            case 'KeyA':
                if (cameraSpeed.x === 1)
                    cameraSpeed.x = 0;
                break;
            case 68: // d
            case 'KeyD':
                if (cameraSpeed.x === -1)
                    cameraSpeed.x = 0;
                break;
        }
        this.setState({ cameraSpeed }, this.saveData);
    }

    frame() {
        const { renderer, clock, island, scene } = this.state;
        const { name, wireframe } = this.props.sharedState;
        if (this.name !== name) {
            this.loadIsland();
        }
        if (this.wireframe !== wireframe && island) {
            island.threeObject.traverse((obj) => {
                if (obj instanceof THREE.Mesh) {
                    (obj.material as THREE.RawShaderMaterial).wireframe = wireframe;
                }
            });
            this.wireframe = wireframe;
        }
        this.checkResize();
        const time = {
            delta: Math.min(clock.getDelta(), 0.05),
            elapsed: clock.getElapsedTime()
        };
        renderer.stats.begin();
        scene.camera.update(island, this.state, time);
        // if (island) {
        //     island.updateSeaTime(time); // FIXME looks like it does not exist anymore
        // }
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

    render() {
        return <div
            id="renderZone"
            style={fullscreen}
            onWheel={this.onWheel}
            onKeyDown={this.onKeyDown}
            onKeyUp={this.onKeyUp}
            onClick={this.handleClick}
        >
            <div ref={this.onLoad} style={fullscreen}/>
            <div id="stats" style={{position: 'absolute', top: 0, left: 0, width: '50%'}}/>
        </div>;
    }
}

const euler = new THREE.Euler(0.0, 0.0, 0.0, 'YXZ');
const MAX_X_ANGLE = Math.PI / 2.5;

function handleMouseEvent(controlsState, event) {
    const movementX = event.movementX || 0;
    const movementY = -event.movementY || 0;

    euler.setFromQuaternion(controlsState.cameraHeadOrientation, 'YXZ');
    euler.y = 0;
    euler.x = Math.min(Math.max(euler.x - (movementY * 0.002), -MAX_X_ANGLE), MAX_X_ANGLE);
    controlsState.cameraHeadOrientation.setFromEuler(euler);

    euler.setFromQuaternion(controlsState.cameraOrientation, 'YXZ');
    euler.x = 0;
    euler.y -= movementX * 0.002;
    controlsState.cameraOrientation.setFromEuler(euler);
}
