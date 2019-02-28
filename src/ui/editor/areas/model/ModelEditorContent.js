import React from 'react';
import * as THREE from 'three';
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

function updateModel(model, animState, entityIdx, animIdx, time) {
    const entity = model.entities[entityIdx];
    const entityAnim = getAnim(entity, animIdx);
    if (entityAnim !== null) {
        const realAnimIdx = entityAnim.animIndex;
        const anim = loadAnim(model, model.anims, realAnimIdx);
        animState.loopFrame = anim.loopFrame;
        if (animState.prevRealAnimIdx !== -1 && realAnimIdx !== animState.prevRealAnimIdx) {
            updateKeyframeInterpolation(anim, animState, time, realAnimIdx);
        }
        if (realAnimIdx === animState.realAnimIdx || animState.realAnimIdx === -1) {
            updateKeyframe(anim, animState, time, realAnimIdx);
        }
    }
}

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
            const grid = new THREE.GridHelper(0.2, 10);
            scene.threeScene.add(grid);
            const clock = new THREE.Clock(false);
            this.state = {
                scene,
                clock
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
                this.loadModel();
            }
            this.root = root;
            this.root.appendChild(this.canvas);
        }
    }

    async loadModel() {
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
            0,
            1,
            0,
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
        const { renderer, animState, clock, model, scene } = this.state;
        this.checkResize();
        const time = {
            delta: Math.min(clock.getDelta(), 0.05),
            elapsed: clock.getElapsedTime()
        };
        renderer.stats.begin();
        if (model) {
            updateModel(model, animState, 0, 0, time);
        }
        scene.camera.update(model, time);
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
