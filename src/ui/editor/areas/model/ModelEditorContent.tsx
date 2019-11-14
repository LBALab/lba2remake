import * as React from 'react';
import * as THREE from 'three';
import { each } from 'lodash';
import { createRenderer } from '../../../../renderer';
import { fullscreen } from '../../../styles/index';
import FrameListener from '../../../utils/FrameListener';
import { loadModel } from '../../../../model/index';
import {
    loadAnimState,
    updateKeyframe,
    updateKeyframeInterpolation
} from '../../../../model/animState';
import { getAnim } from '../../../../model/entity';
import { loadAnim } from '../../../../model/anim';
import DebugData from '../../DebugData';
import fmod from './utils/fmod';
import {get3DOrbitCamera} from './utils/orbitCamera';
import { TickerProps } from '../../../utils/Ticker';
import NodeProps from '../utils/outliner/NodeProps';

interface Props extends TickerProps {
    mainData: any;
    saveMainData: Function;
    params: any;
    sharedState: {
        entity: number;
        body: number;
        anim: number;
        rotateView: boolean;
        wireframe: boolean;
        grid: boolean;
    };
    stateHandler: any;
}

interface State {
    model?: any;
    renderer?: any;
    scene: any;
    clock: THREE.Clock;
    grid: any;
    animState?: any;
}

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

    constructor(props) {
        super(props);

        this.onLoad = this.onLoad.bind(this);
        this.frame = this.frame.bind(this);
        this.saveData = this.saveData.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onWheel = this.onWheel.bind(this);

        this.mouseSpeed = {
            x: 0,
            y: 0
        };

        this.zoom = 0;

        if (props.mainData) {
            this.state = props.mainData.state;
        } else {
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
                grid
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
                const renderer = createRenderer(
                    this.props.params,
                    this.canvas,
                    {},
                    'models_editor'
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

    async loadModel() {
        const oldModel = this.state.model;
        if (oldModel) {
            this.state.scene.threeScene.remove(oldModel.mesh);
        }
        this.entity = this.props.sharedState.entity;
        this.body = this.props.sharedState.body;
        const animState = loadAnimState();
        const envInfo = {
            skyColor: [0, 0, 0]
        };
        const ambience = {
            lightingAlpha: 309,
            lightingBeta: 2500
        };
        const model = await loadModel(
            {},
            this.props.sharedState.entity,
            this.props.sharedState.body,
            this.props.sharedState.anim,
            animState,
            envInfo,
            ambience
        );
        model.entity = this.entity;
        this.state.scene.threeScene.add(model.mesh);
        this.setState({ animState, model }, this.saveData);
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
        const { entity, body, anim, rotateView, wireframe } = this.props.sharedState;
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
        const time = {
            delta: Math.min(clock.getDelta(), 0.05),
            elapsed: clock.getElapsedTime()
        };
        renderer.stats.begin();
        if (model) {
            const interpolate = this.updateModel(
                model,
                animState,
                entity,
                anim,
                time
            );
            this.updateMovement(grid, animState, time, interpolate, model.mesh.quaternion);
        }
        scene.camera.update(model, rotateView, this.mouseSpeed, this.zoom, time);
        renderer.render(scene);
        renderer.stats.end();
    }

    updateModel(model, animState, entityIdx, animIdx, time) {
        const entity = model.entities[entityIdx];
        const entityAnim = getAnim(entity, animIdx);
        let interpolate = false;
        if (entityAnim !== null) {
            const realAnimIdx = entityAnim.animIndex;
            const anim = loadAnim(model, model.anims, realAnimIdx);
            animState.loopFrame = anim.loopFrame;
            if (animState.prevRealAnimIdx !== -1 && realAnimIdx !== animState.prevRealAnimIdx) {
                updateKeyframeInterpolation(anim, animState, time, realAnimIdx);
                interpolate = true;
            }
            if (realAnimIdx === animState.realAnimIdx || animState.realAnimIdx === -1) {
                updateKeyframe(anim, animState, time, realAnimIdx);
            }
            const q = new THREE.Quaternion();
            const delta = time.delta * 1000;
            let angle = 0;
            if (animState.keyframeLength > 0) {
                angle = (animState.rotation.y * delta) / animState.keyframeLength;
            }
            q.setFromAxisAngle(
                new THREE.Vector3(0, 1, 0),
                angle
            );
            model.mesh.quaternion.multiply(q);
        }
        return interpolate;
    }

    updateMovement(grid, animState, time, interpolate, rotation) {
        const delta = time.delta * 1000;
        const speed = new THREE.Vector3();
        if (animState.keyframeLength > 0) {
            speed.set(
                ((animState.step.x * delta) / animState.keyframeLength),
                ((animState.step.y * delta) / animState.keyframeLength),
                ((animState.step.z * delta) / animState.keyframeLength)
            );
            speed.applyQuaternion(rotation);
        }
        const ts = 0.96;
        const inRange = v => fmod(v + (ts * 4.5), ts * 9) - (ts * 4.5);

        if (!interpolate) {
            grid.position.y = inRange(grid.position.y - speed.y);
        }
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
        </div>;
    }
}
