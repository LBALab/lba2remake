import React from 'react';
import * as THREE from 'three';
import { createRenderer } from '../../../../renderer';
import { fullscreen } from '../../../styles/index';
import FrameListener from '../../../utils/FrameListener';
import { loadIslandScenery } from '../../../../island/index';
import DebugData from '../../DebugData';
import {get3DOrbitCamera} from './utils/orbitCamera';
import IslandAmbience from './browser/ambience';

export default class Island extends FrameListener {
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
            scene.threeScene.add(camera.controlNode);
            const clock = new THREE.Clock(false);
            this.state = {
                scene,
                clock,
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
                const renderer = createRenderer(this.props.params, this.canvas, {}, 'islands_editor');
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
        this.entity = this.props.sharedState.entity;
        const island = await loadIslandScenery(
            { editor: true },
            this.props.sharedState.entity,
            IslandAmbience[this.props.sharedState.entity],
        );
        island.entity = this.entity;
        this.state.scene.threeScene.add(island.threeObject);
        this.setState({ island }, this.saveData);
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
        this.zoom = Math.min(Math.max(-1, this.zoom), 18);
    }

    frame() {
        const { renderer, clock, island, scene } = this.state;
        const { entity, rotateView, wireframe } = this.props.sharedState;
        if (this.entity !== entity) {
            this.loadIsland();
        }
        if (this.wireframe !== wireframe && island) {
            island.threeObject.traverse((obj) => {
                if (obj instanceof THREE.Mesh) {
                    obj.material.wireframe = wireframe;
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
        scene.camera.update(island, rotateView, this.mouseSpeed, this.zoom, time);
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
