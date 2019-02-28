import React from 'react';
import * as THREE from 'three';
import { each } from 'lodash';
import { createRenderer } from '../../../../renderer';
import { fullscreen } from '../../../styles/index';
import FrameListener from '../../../utils/FrameListener';
import { loadModel } from '../../../../model/index.ts';
import {
    loadAnimState,
    updateKeyframe,
    updateKeyframeInterpolation
} from '../../../../model/animState';
import { getAnim } from '../../../../model/entity.ts';
import { loadAnim } from '../../../../model/anim.ts';
import DebugData from '../../DebugData';

export default class Model extends FrameListener {
    constructor(props) {
        super(props);

        this.onLoad = this.onLoad.bind(this);
        this.frame = this.frame.bind(this);
        this.saveData = this.saveData.bind(this);

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
                    const tile = new THREE.GridHelper(0.04, 2);
                    tile.position.x = x * 0.04;
                    tile.position.z = z * 0.04;
                    tile.material.transparent = true;
                    tile.material.opacity = 1;
                    grid.add(tile);
                }
            }
            scene.threeScene.add(grid);
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
                const renderer = createRenderer(this.props.params, this.canvas);
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
        this.state.scene.threeScene.add(model.mesh);
        this.setState({ animState, model }, this.saveData);
    }

    componentWillReceiveProps(newProps) {
        if (newProps.params.vr !== this.props.params.vr && this.canvas) {
            this.state.renderer.dispose();
            this.setState({
                renderer: createRenderer(newProps.params, this.canvas)
            }, this.saveData);
        }
    }

    frame() {
        const { renderer, animState, clock, model, scene, grid } = this.state;
        const { entity, body, anim } = this.props.sharedState;
        if (this.entity !== entity || this.body !== body) {
            this.loadModel();
            grid.position.y = 0;
        }
        if (this.anim !== anim) {
            grid.position.y = 0;
            this.anim = anim;
        }
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
            this.updateMovement(grid, animState, time, interpolate);
        }
        scene.camera.update(model, time);
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
        }
        return interpolate;
    }

    updateMovement(grid, animState, time, interpolate) {
        const delta = time.delta * 1000;
        const speedZ = ((animState.step.z * delta) / animState.keyframeLength);
        const speedY = ((animState.step.y * delta) / animState.keyframeLength);
        const speedX = ((animState.step.x * delta) / animState.keyframeLength);
        const ts = 0.04;
        const inRange = v => fmod(v + (ts * 4.5), ts * 9) - (ts * 4.5);

        if (!interpolate) {
            grid.position.y = inRange(grid.position.y - speedY);
        }
        each(grid.children, (tile) => {
            const pos = tile.position;
            pos.x = inRange(pos.x - speedX);
            pos.z = inRange(pos.z - speedZ);
            const p = Math.max(
                Math.max(Math.abs(pos.x), Math.abs(pos.z)),
                Math.abs(grid.position.y)
            );
            tile.material.opacity = Math.min((0.16 - p) / 0.16, 1);
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
        return <div style={fullscreen}>
            <div ref={this.onLoad} style={fullscreen}/>
            <div id="stats1" style={{position: 'absolute', top: 0, left: 0, width: '50%'}}/>
            <div id="stats2" style={{position: 'absolute', top: 0, left: '50%', width: '50%'}}/>
        </div>;
    }
}

function get3DOrbitCamera() {
    const camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.001,
        100
    ); // 1m = 0.0625 units
    return {
        threeCamera: camera,
        resize: (width, height) => {
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        },
        update: (model, time) => {
            let height = 0;
            if (model) {
                const bb = model.boundingBox;
                height = bb.max.y - bb.min.y;
            }
            const dt = -time.elapsed * 0.5;
            camera.position.set(
                Math.cos(dt) * 0.2,
                height + 0.05,
                Math.sin(dt) * 0.2);
            camera.lookAt(new THREE.Vector3(0, height * 0.5, 0));
        }
    };
}

function fmod(a, b) {
    return Number((a - (Math.floor(a / b) * b)).toPrecision(8));
}
