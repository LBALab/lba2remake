import * as React from 'react';
import * as THREE from 'three';
import Renderer from '../../../../renderer';
import { fullscreen } from '../../../styles/index';
import FrameListener from '../../../utils/FrameListener';
import DebugData from '../../DebugData';
import { TickerProps } from '../../../utils/Ticker';
import { getIsometricCamera } from '../../../../cameras/iso';
import { loadImageData } from '../../../../iso';
import { loadLibrary } from '../../../../iso/grid';
import { loadBricks } from '../../../../iso/bricks';
import { loadHqr } from '../../../../hqr';
import { OffsetBySide, Side } from '../../../../iso/mapping';
import { compile } from '../../../../utils/shaders';
import brick_vertex from '../../../../iso/shaders/brick.vert.glsl';
import brick_fragment from '../../../../iso/shaders/brick.frag.glsl';

interface Props extends TickerProps {
    mainData: any;
    saveMainData: Function;
    params: any;
    sharedState: {
        layout: number;
        rotateView: boolean;
        wireframe: boolean;
        grid: boolean;
    };
    stateHandler: any;
}

interface State {
    layout?: any;
    renderer?: any;
    scene: any;
    clock: THREE.Clock;
    grid: any;
    controlsState: {
        cameraLerp: THREE.Vector3;
        cameraLookAtLerp: THREE.Vector3;
    };
}

export default class Model extends FrameListener<Props, State> {
    mouseSpeed: {
        x: number;
        y: number;
    };
    zoom: number;
    root: HTMLElement;
    canvas: HTMLCanvasElement;
    layout: number;
    wireframe: boolean;
    moving: boolean;
    moved: boolean;
    mask: ImageData;

    constructor(props) {
        super(props);

        this.onLoad = this.onLoad.bind(this);
        this.frame = this.frame.bind(this);
        this.saveData = this.saveData.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onWheel = this.onWheel.bind(this);
        this.listener = this.listener.bind(this);

        this.mouseSpeed = {
            x: 0,
            y: 0
        };

        this.zoom = 0;
        this.layout = -1;

        if (props.mainData) {
            this.state = props.mainData.state;
        } else {
            const camera = getIsometricCamera();
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
            const gridScale = 0.75;
            const grid = new THREE.Object3D();
            for (let x = -4; x <= 4; x += 1) {
                for (let z = -4; z <= 4; z += 1) {
                    const tile = new THREE.GridHelper(gridScale, 2);
                    tile.position.x = x * gridScale;
                    tile.position.z = z * gridScale;
                    (tile.material as THREE.LineBasicMaterial).transparent = true;
                    (tile.material as THREE.LineBasicMaterial).opacity = 1;
                    grid.add(tile);
                }
            }
            scene.threeScene.add(grid);
            scene.threeScene.add(camera.threeCamera);
            const clock = new THREE.Clock(false);
            this.state = {
                scene,
                clock,
                grid,
                controlsState
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
                const renderer = new Renderer(
                    this.props.params,
                    this.canvas,
                    {},
                    'layouts_editor'
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
        window.addEventListener('keydown', this.listener);
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.listener);
        super.componentWillUnmount();
    }

    listener(event) {
        const key = event.code || event.which || event.keyCode;
        switch (key) {
            case 37: // left
            case 'ArrowLeft': {
                const newLayout = Math.max(0, this.props.sharedState.layout - 1);
                this.props.stateHandler.setLayout(newLayout);
                break;
            }
            case 39: // right
            case 'ArrowRight': {
                const newLayout = Math.min(174, this.props.sharedState.layout + 1);
                this.props.stateHandler.setLayout(newLayout);
                break;
            }
        }
    }

    async loadLayout(layout) {
        this.layout = layout;
        const [ress, bkg] = await Promise.all([
            loadHqr('RESS.HQR'),
            loadHqr('LBA_BKG.HQR'),
        ]);
        if (!this.mask) {
            this.mask = await loadImageData('images/brick_mask.png');
        }
        const palette = new Uint8Array(ress.getEntry(0));
        const bricks = loadBricks(bkg);
        const library = loadLibrary(bkg, bricks, this.mask, palette, 0);
        const layoutMesh = loadLayoutMesh(library, this.props.sharedState.layout);
        const layoutObj = {
            threeObject: layoutMesh
        };
        const oldLayout = this.state.layout;
        if (oldLayout) {
            this.state.scene.threeScene.remove(oldLayout.threeObject);
        }
        this.state.scene.threeScene.add(layoutObj.threeObject);
        this.setState({ layout: layoutObj }, this.saveData);
        this.wireframe = false;
    }

    onMouseDown() {
        this.moving = true;
        this.moved = false;
    }

    onMouseMove(e) {
        if (this.moving) {
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
        const { layout: layoutObj, renderer, clock, scene, grid } = this.state;
        const { layout, wireframe } = this.props.sharedState;
        if (this.layout !== layout) {
            this.loadLayout(layout);
        }
        if (this.wireframe !== wireframe && layoutObj) {
            layoutObj.threeObject.traverse((obj) => {
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
        scene.camera.update(scene, this.state.controlsState, time);
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

function loadLayoutMesh(library, layoutIdx) {
    const h = 0.5;
    const positions = [];
    const uvs = [];
    const {width, height} = library.texture.image;
    const {nX, nY, nZ, blocks} = library.layouts[layoutIdx];
    let idx = 0;
    for (let z = 0; z < nZ; z += 1) {
        for (let y = 0; y < nY; y += 1) {
            for (let x = 0; x < nX; x += 1) {
                const pY = y * h + 0.5;
                const block = blocks[idx];
                if (block && block.brick in library.bricksMap) {
                    const {u, v} = library.bricksMap[block.brick];
                    const pushUv = (u0, v0, side) => {
                        const o = OffsetBySide[side];
                        uvs.push((u + u0 + o.x) / width, (v + v0 + o.y) / height);
                    };

                    positions.push(x, pY, z);
                    pushUv(24, -0.5, Side.TOP);
                    positions.push(x, pY, z + 1);
                    pushUv(48, 11.5, Side.TOP);
                    positions.push(x + 1, pY, z + 1);
                    pushUv(24, 23.5, Side.TOP);
                    positions.push(x, pY, z);
                    pushUv(24, -0.5, Side.TOP);
                    positions.push(x + 1, pY, z + 1);
                    pushUv(24, 23.5, Side.TOP);
                    positions.push(x + 1, pY, z);
                    pushUv(0, 11.5, Side.TOP);

                    positions.push(x + 1, pY, z);
                    pushUv(0, 11.5, Side.LEFT);
                    positions.push(x + 1, pY, z + 1);
                    pushUv(24, 23.5, Side.LEFT);
                    positions.push(x + 1, pY - h, z + 1);
                    pushUv(24, 38.5, Side.LEFT);
                    positions.push(x + 1, pY, z);
                    pushUv(0, 11.5, Side.LEFT);
                    positions.push(x + 1, pY - h, z + 1);
                    pushUv(24, 38.5, Side.LEFT);
                    positions.push(x + 1, pY - h, z);
                    pushUv(0, 26.5, Side.LEFT);

                    positions.push(x, pY, z + 1);
                    pushUv(48, 11.5, Side.RIGHT);
                    positions.push(x + 1, pY - h, z + 1);
                    pushUv(24, 38.5, Side.RIGHT);
                    positions.push(x + 1, pY, z + 1);
                    pushUv(24, 23.5, Side.RIGHT);
                    positions.push(x, pY, z + 1);
                    pushUv(48, 11.5, Side.RIGHT);
                    positions.push(x, pY - h, z + 1);
                    pushUv(48, 26.5, Side.RIGHT);
                    positions.push(x + 1, pY - h, z + 1);
                    pushUv(24, 38.5, Side.RIGHT);
                }
                idx += 1;
            }
        }
    }

    const bufferGeometry = new THREE.BufferGeometry();
    bufferGeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array(positions), 3)
    );
    bufferGeometry.setAttribute(
        'uv',
        new THREE.BufferAttribute(new Float32Array(uvs), 2)
    );
    const mesh = new THREE.Mesh(bufferGeometry, new THREE.RawShaderMaterial({
        vertexShader: compile('vert', brick_vertex),
        fragmentShader: compile('frag', brick_fragment),
        transparent: true,
        uniforms: {
            library: {value: library.texture}
        }
    }));

    const scale = 0.75;
    mesh.scale.set(scale, scale, scale);
    mesh.position.set(nZ * 0.5 * scale, 0, -nX * 0.5 * scale);
    mesh.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2.0);
    mesh.frustumCulled = false;
    mesh.name = `layout_${layoutIdx}`;

    return mesh;
}
