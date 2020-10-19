import * as React from 'react';
import * as THREE from 'three';

import Renderer from '../../../../renderer';
import { fullscreen } from '../../../styles/index';
import FrameListener from '../../../utils/FrameListener';
import { loadIslandScenery } from '../../../../island';
import {get3DFreeCamera} from './utils/freeCamera';
import IslandAmbience from './browser/ambience';
import { TickerProps } from '../../../utils/Ticker';
import {
    registerResources,
    preloadResources,
} from '../../../../resources';
import islandOffsets from './data/islandOffsets';
import { setCurrentFog } from '../../fog';
import DebugData from '../../DebugData';

interface Props extends TickerProps {
    params: any;
    sharedState: {
        name: string;
        wireframe: boolean;
        fog: boolean;
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
    fog: boolean;

    constructor(props) {
        super(props);

        this.onLoad = this.onLoad.bind(this);
        this.frame = this.frame.bind(this);
        this.saveDebugScope = this.saveDebugScope.bind(this);
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

    saveDebugScope() {
        DebugData.scope = this.state;
    }

    componentWillUnmount() {
        document.removeEventListener('pointerlockchange', this.onPointerLockChange);
        document.removeEventListener('mousemove', this.onMouseMove);
    }

    async preload() {
        await registerResources('lba2', 'EN', 'EN');
        await preloadResources();
    }

    async onLoad(root) {
        if (!this.root && root) {
            await this.preload();
            this.canvas = document.createElement('canvas');
            this.canvas.tabIndex = 0;
            const renderer = new Renderer(this.canvas, 'islands_editor');
            renderer.threeRenderer.setAnimationLoop(() => {
                this.props.ticker.frame();
            });
            this.setState({ renderer }, this.saveDebugScope);
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

        const offset = islandOffsets[island.name];
        this.state.scene.camera.controlNode.position.set(
            offset.position.x, offset.position.y, offset.position.z
        );

        this.state.cameraOrientation.set(
            offset.quartenion.x,
            offset.quartenion.y,
            offset.quartenion.z,
            offset.quartenion.w,
        );
        this.state.cameraHeadOrientation.set(
            offset.headQuartenion.x,
            offset.headQuartenion.y,
            offset.headQuartenion.z,
            offset.headQuartenion.w,
        );

        this.state.scene.threeScene.add(island.threeObject);
        this.setState({ island }, this.saveDebugScope);
        this.wireframe = false;
        this.fog = true;
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
        this.setState({ cameraSpeed }, this.saveDebugScope);
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
        this.setState({ cameraSpeed }, this.saveDebugScope);
    }

    setFog(fog: boolean) {
        const { island } = this.state;
        if (this.fog !== fog && island && island.threeObject) {
            island.threeObject.traverse((obj) => {
                if (obj && obj.material && obj instanceof THREE.Mesh &&
                    (obj.material as THREE.RawShaderMaterial).uniforms) {
                    (obj.material as THREE.RawShaderMaterial).uniforms.fogDensity.value =
                        fog ? island.props.envInfo.fogDensity : 0;
                }
            });
            this.fog = fog;
            setCurrentFog(fog);
        }
    }

    frame() {
        const { renderer, clock, island, scene } = this.state;
        const { name, wireframe, fog } = this.props.sharedState;
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
        this.setFog(fog);
        this.checkResize();
        const time = {
            delta: Math.min(clock.getDelta(), 0.05),
            elapsed: clock.getElapsedTime()
        };
        renderer.stats.begin();
        scene.camera.update(island, this.state, time);
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
