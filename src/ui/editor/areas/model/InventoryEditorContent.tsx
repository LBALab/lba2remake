import * as React from 'react';
import * as THREE from 'three';
import Renderer from '../../../../renderer';
import { fullscreen } from '../../../styles/index';
import FrameListener from '../../../utils/FrameListener';
import {get3DOrbitCamera} from './utils/orbitCamera';
import { TickerProps } from '../../../utils/Ticker';
import {
    registerResources,
    preloadResources,
} from '../../../../resources';
import DebugData, { loadGameMetaData } from '../../DebugData';
import { getParams } from '../../../../params';
import { loadInventoryModel } from '../../../../model/inventory';
// import { exportModel } from '../../../../model/exporter';

const envInfo = {
    skyColor: [0, 0, 0]
};
const ambience = {
    lightingAlpha: 309,
    lightingBeta: 2500
};

interface Props extends TickerProps {
    params: any;
    sharedState: {
        inventory: number;
        rotateView: boolean;
        wireframe: boolean;
        grid: boolean;
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
}

const exportButtonWrapperStyle = {
    position: 'absolute' as const,
    right: 10,
    bottom: 10
};

// const mainInfoButton = {
//     margin: '4px',
//     padding: '5px 10px',
//     color: 'white',
//     background: 'rgb(45, 45, 48)'
// };

export default class Inventory extends FrameListener<Props, State> {
    mouseSpeed: {
        x: number;
        y: number;
    };
    zoom: number;
    root: HTMLElement;
    canvas: HTMLCanvasElement;
    inventory: number;
    wireframe: boolean;
    moving: boolean;
    moved: boolean;

    constructor(props) {
        super(props);

        this.onLoad = this.onLoad.bind(this);
        this.frame = this.frame.bind(this);
        this.saveDebugScope = this.saveDebugScope.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onWheel = this.onWheel.bind(this);
        // this.exportModel = this.exportModel.bind(this);

        this.mouseSpeed = {
            x: 0,
            y: 0
        };

        this.zoom = 5;

        const camera = get3DOrbitCamera(0.2);
        const scene = {
            camera,
            threeScene: new THREE.Scene()
        };
        const grid = new THREE.Object3D();
        for (let x = -4; x <= 4; x += 1) {
            for (let z = -4; z <= 4; z += 1) {
                const tile = new THREE.GridHelper(2.96, 2);
                tile.position.x = x * 2.96;
                tile.position.z = z * 2.96;
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
        await loadGameMetaData();
        await loadInventoryModel(
            {},
            0,
            envInfo,
            ambience
        );
    }

    async onLoad(root) {
        if (!this.root && root) {
            await this.preload();
            this.canvas = document.createElement('canvas');
            this.canvas.tabIndex = 0;
            const renderer = new Renderer(this.canvas, 'inventory_editor');
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
        this.inventory = this.props.sharedState.inventory;
        const model = await loadInventoryModel(
            {},
            this.props.sharedState.inventory,
            envInfo,
            ambience
        );
        model.inventory = this.inventory;
        this.setState({ model }, this.saveDebugScope);
        this.state.scene.threeScene.add(model.mesh);
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
        const { renderer, clock, model, scene, grid } = this.state;
        const { inventory, rotateView, wireframe } = this.props.sharedState;
        if (this.inventory !== inventory) {
            this.loadModel();
        }
        if (model) {
            grid.position.y = model.boundingBox.min.y - 0.01;
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
        scene.camera.update(model, rotateView, this.mouseSpeed, this.zoom, time);
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
            <div style={exportButtonWrapperStyle}>
                {/* <button style={mainInfoButton} onClick={this.exportInventory}>
                    Export
                </button> */}
            </div>
        </div>;
    }

    // async exportInventory() {
    //     exportInventory(
    //         this.props.sharedState.inventory,
    //     );
    // }
}
