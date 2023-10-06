import * as React from 'react';
import * as THREE from 'three';
import { each } from 'lodash';
import Renderer from '../../../../renderer';
import { fullscreen } from '../../../styles/index';
import FrameListener from '../../../utils/FrameListener';
import { loadModel } from '../../../../model/index';
import AnimState from '../../../../model/anim/AnimState';
import fmod from './utils/fmod';
import {get3DOrbitCamera} from './utils/orbitCamera';
import { TickerProps } from '../../../utils/Ticker';
import {
    registerResources,
    preloadResources,
} from '../../../../resources';
import { loadEntities, getEntities } from './browser/entitities';
import DebugData from '../../DebugData';
import { getParams } from '../../../../params';
import { exportModel } from '../../../../model/exporter';
import { saveAs } from 'file-saver';

interface Props extends TickerProps {
    params: any;
    sharedState: {
        entity: number;
        body: number;
        anim: number;
        rotateView: boolean;
        wireframe: boolean;
        grid: boolean;
        playbackSpeed: number;
    };
    area: any;
    stateHandler: any;
}

interface State {
    model?: any;
    renderer?: any;
    scene: any;
    clock: THREE.Clock;
    grid: any;
    animState?: AnimState;
}

const exportButtonWrapperStyle = {
    position: 'absolute' as const,
    right: 10,
    bottom: 10
};

const mainInfoButton = {
    margin: '4px',
    padding: '5px 10px',
    color: 'white',
    background: 'rgb(45, 45, 48)'
};

export default class Model extends FrameListener<Props, State> {
    mouseSpeed: {
        x: number;
        y: number;
    };
    zoom: number;
    root: HTMLElement;
    canvas: HTMLCanvasElement;
    entity: number;
    body: number;
    wireframe: boolean;
    moving: boolean;
    moved: boolean;
    anim: number;
    capture: any;
    recording: boolean;

    constructor(props) {
        super(props);

        this.onLoad = this.onLoad.bind(this);
        this.frame = this.frame.bind(this);
        this.saveDebugScope = this.saveDebugScope.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onWheel = this.onWheel.bind(this);
        this.export = this.export.bind(this);
        this.exportAll = this.exportAll.bind(this);
        this.record = this.record.bind(this);

        this.mouseSpeed = {
            x: 0,
            y: 0
        };

        this.zoom = 0;

        const camera = get3DOrbitCamera();
        const scene = {
            camera,
            threeScene: new THREE.Scene()
        };
        const grid = new THREE.Object3D();
        for (let x = -4; x <= 4; x += 1) {
            for (let z = -4; z <= 4; z += 1) {
                const tile = new THREE.GridHelper(0.96, 2);
                tile.position.x = x * 0.96;
                tile.position.z = z * 0.96;
                (tile.material as THREE.LineBasicMaterial).transparent = true;
                (tile.material as THREE.LineBasicMaterial).opacity = 1;
                grid.add(tile);
            }
        }
        scene.threeScene.add(grid);
        scene.threeScene.add(camera.controlNode);
        const clock = new THREE.Clock(false);
        this.state = {
            scene,
            clock,
            grid,
        };
        clock.start();

        this.capture = null;
        this.recording = false;
    }

    componentWillUnmount() {
        if (this.state.renderer) {
            this.state.renderer.dispose();
        }
        super.componentWillUnmount();
    }

    saveDebugScope() {
        DebugData.scope = this.state;
    }

    async preload() {
        const { game } = getParams();
        await registerResources(game, 'EN', 'EN');
        await preloadResources();
        loadEntities();
    }

    async onLoad(root) {
        if (!this.root && root) {
            await this.preload();
            this.canvas = document.createElement('canvas');
            this.canvas.tabIndex = 0;
            const renderer = new Renderer(this.canvas, 'models_editor');
            renderer.threeRenderer.setAnimationLoop(() => {
                this.props.ticker.frame();
            });
            this.setState({ renderer }, this.saveDebugScope);
            this.root = root;
            this.root.appendChild(this.canvas);
        }
    }

    async loadModel() {
        const oldModel = this.state.model;
        if (oldModel) {
            this.state.scene.threeScene.remove(oldModel.mesh);
        }
        this.entity = this.props.sharedState.entity;
        this.body = this.props.sharedState.body;
        const animState = new AnimState();
        const envInfo = {
            skyColor: [0, 0, 0]
        };
        const ambience = {
            lightingAlpha: 309,
            lightingBeta: 2500
        };
        const model = await loadModel(
            this.props.sharedState.entity,
            this.props.sharedState.body,
            this.props.sharedState.anim,
            animState,
            envInfo,
            ambience
        );
        model.entity = this.entity;
        this.state.scene.threeScene.add(model.mesh);
        this.setState({ animState, model }, this.saveDebugScope);
        this.wireframe = false;
    }

    onMouseDown() {
        this.moving = true;
        this.moved = false;
    }

    onMouseMove(e) {
        if (this.moving) {
            if (!this.moved) {
                this.props.stateHandler.setRotateView(false);
            }
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
        const { renderer, animState, clock, model, scene, grid } = this.state;
        const { entity, body, anim, rotateView, wireframe, playbackSpeed } = this.props.sharedState;
        if (this.entity !== entity || this.body !== body) {
            this.loadModel();
            grid.position.y = 0;
        }
        if (this.anim !== anim) {
            grid.position.y = 0;
            this.anim = anim;
        }
        if (this.wireframe !== wireframe && model) {
            model.mesh.traverse((obj) => {
                if (obj instanceof THREE.Mesh) {
                    (obj.material as THREE.RawShaderMaterial).wireframe = wireframe;
                }
            });
            this.wireframe = wireframe;
        }
        grid.visible = this.props.sharedState.grid || false;
        this.checkResize();
        const pbs = playbackSpeed || 1;
        const time = {
            delta: Math.min(clock.getDelta(), 0.05) * pbs,
            elapsed: clock.getElapsedTime() * pbs
        };
        renderer.stats.begin();
        if (model) {
            this.updateModel(
                model,
                animState,
                entity,
                anim,
                time
            );
            this.updateMovement(grid, animState, time, model.mesh.quaternion);
        }
        scene.camera.update(model, rotateView, this.mouseSpeed, this.zoom, time);
        renderer.render(scene);
        renderer.stats.end();
    }

    updateModel(model, animState: AnimState, entityIdx, animIdx, time) {
        animState.update(time, entityIdx, animIdx);
        const q = new THREE.Quaternion();
        const angle = animState.rotation.y * time.delta;
        q.setFromAxisAngle(
            new THREE.Vector3(0, 1, 0),
            angle
        );
        model.mesh.quaternion.multiply(q);
    }

    updateMovement(grid, animState, time, rotation) {
        const speed = new THREE.Vector3();
        speed.copy(animState.step);
        speed.multiplyScalar(time.delta);
        speed.applyQuaternion(rotation);
        const ts = 0.96;
        const inRange = v => fmod(v + (ts * 4.5), ts * 9) - (ts * 4.5);

        grid.position.y = inRange(grid.position.y - speed.y);
        each(grid.children, (tile) => {
            const pos = tile.position;
            pos.x = inRange(pos.x - speed.x);
            pos.z = inRange(pos.z - speed.z);
            const p = Math.max(
                Math.max(Math.abs(pos.x), Math.abs(pos.z)),
                Math.abs(grid.position.y)
            );
            tile.material.opacity = Math.min((3.84 - p) / 3.84, 1);
        });
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
            onMouseDown={this.onMouseDown}
            onMouseUp={this.onMouseUp}
            onMouseMove={this.onMouseMove}
            onMouseLeave={this.onMouseUp}
            onWheel={this.onWheel}
        >
            <div ref={this.onLoad} style={fullscreen}/>
            <div id="stats" style={{position: 'absolute', top: 0, left: 0, width: '50%'}}/>
            <div style={exportButtonWrapperStyle}>
                <button style={mainInfoButton} onClick={this.export}>
                    Export
                </button>
                <button id="exporting" style={mainInfoButton} onClick={this.exportAll}>
                    Export All
                </button>
                <button id="recording" style={mainInfoButton} onClick={this.record}>
                    Record
                </button>
            </div>
        </div>;
    }

    async export() {
        exportModel(
            this.props.sharedState.entity,
            this.props.sharedState.body,
        );
    }

    async exportAll() {
        if (confirm('Exporting all models is a long running process. Are you sure you want to continue?') === true) {
            await loadEntities();
            const entities = getEntities();
            for (const entity of entities) {
                for (const body of entity.bodies) {
                    exportModel(entity.index, body.index);
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
        }
    }

    async record() {
        const button = document.getElementById('recording');
        if (this.recording) {
            this.capture.stop();
            this.recording = false;
            button.style.background = 'rgb(45, 45, 48)';
            button.innerText = 'Record';
            return;
        }
        this.recording = true;
        button.style.background = 'red';
        button.innerText = 'Stop';
        const stream = this.state.renderer.threeRenderer.domElement.captureStream(60);
        this.capture = new MediaRecorder(stream, {
            mimeType: 'video/webm; codecs=vp9'
        });
        const chunks = [];
        this.capture.ondataavailable = (e) => {
            chunks.push(e.data);
        };
        this.capture.onstop = () => {
            const filename = `${DebugData.metadata.entities[this.props.sharedState.entity]}_${DebugData.metadata.bodies[this.props.sharedState.body]}_${DebugData.metadata.anims[this.props.sharedState.anim]}` || `entity_${this.props.sharedState.entity}_body_${this.props.sharedState.body}_anim_${this.props.sharedState.anim}.webm}`;
            const blob = new Blob(chunks, {
                type: 'video/webm'
            });
            saveAs(blob, filename);
        };
        this.capture.start();
    }
}
