import * as React from 'react';
import * as THREE from 'three';
import { extend } from 'lodash';

import {
    generateLUTTexture,
    resetLUTTexture,
    loadLUTTexture,
    LUT_DIM,
    distSq
} from '../../../../../utils/lut';
import { editor, fullscreen } from '../../../../styles';
import { getPalette } from '../../../../../resources';
import FrameListener from '../../../../utils/FrameListener';
import { TickerProps } from '../../../../utils/Ticker';
import { areResourcesPreloaded } from '../../../../../resources/load';
import DebugData from '../../../DebugData';
import Renderer from '../../../../../renderer';

const style = extend({
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: 8,
    userSelect: 'none',
    cursor: 'default',
    fontWeight: 'normal'
}, fullscreen);

const buttonStyle = extend({}, editor.button, {
    padding: 4,
    margin: 2
});

declare global {
    interface Window {
        isLocalServer?: boolean;
    }
}

interface State {
    generating: boolean;
    progress: string;
    useLabColors: boolean;
    saving: boolean;
    slice: number;
    intensity: number;
    activeColor: string;
    selectedColor: string;
    lutBuffer?: ArrayBuffer;
    eyeDropping: boolean;
}

export default class PaletteAreaContent extends FrameListener<TickerProps, State> {
    ramp: number;
    palette: Uint8Array;
    lutTexture: THREE.DataTexture;
    bbs: {
        xMin: number;
        xMax: number;
        yMin: number;
        yMax: number;
    }[];
    bbIndex: number;
    ctx: CanvasRenderingContext2D;
    ctxLUT: CanvasRenderingContext2D;
    ctxCurves: CanvasRenderingContext2D;
    dragging: boolean;
    waitForLoading: boolean;

    constructor(props) {
        super(props);

        this.generate = this.generate.bind(this);
        this.onCanvasRef = this.onCanvasRef.bind(this);
        this.onCanvasLUTRef = this.onCanvasLUTRef.bind(this);
        this.onCanvasCurvesRef = this.onCanvasCurvesRef.bind(this);
        this.saveLUT = this.saveLUT.bind(this);
        this.reset = this.reset.bind(this);
        this.eyeDrop = this.eyeDrop.bind(this);

        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);

        this.state = {
            generating: false,
            progress: null,
            useLabColors: false,
            saving: false,
            slice: 0,
            intensity: 0,
            activeColor: null,
            selectedColor: null,
            eyeDropping: false
        };

        this.ramp = 0;
        this.dragging = false;
        this.waitForLoading = true;

        this.bbs = [
            {
                xMin: 0,
                xMax: 15,
                yMin: 1,
                yMax: 14
            }
        ];
    }

    async load() {
        const pal = await getPalette();
        this.palette = pal.getBufferUint8();
        this.draw();
        this.lutTexture = await loadLUTTexture();
        this.drawLUT();
        this.drawCurves();
    }

    frame() {
        if (this.waitForLoading) {
            if (areResourcesPreloaded()) {
                this.waitForLoading = false;
                this.load();
            }
        }
    }

    render() {
        return <div style={style}>
            {this.renderButtons()}
            {this.renderOptions()}
            {this.renderProgress()}
            {this.renderCanvas()}
        </div>;
    }

    renderButtons() {
        if (this.state.generating) {
            return null;
        }

        let saveButton = null;
        if (!this.state.saving && this.state.lutBuffer && window.isLocalServer) {
            saveButton = <button style={buttonStyle} onClick={this.saveLUT}>
                Save to <i style={{color: 'blue'}}>lut.dat</i>
            </button>;
        } else if (this.state.saving) {
            saveButton = <i>&nbsp;(Saving...)</i>;
        }

        let resetButton = null;
        if (this.state.lutBuffer) {
            resetButton = <button style={buttonStyle} onClick={this.reset}>
                Reset
            </button>;
        }

        return <div>
            <button style={buttonStyle} onClick={this.generate}>
                Generate Look-Up Table
            </button>
            {!this.state.eyeDropping && <button style={buttonStyle} onClick={this.eyeDrop}>
                <img src="editor/eyedropper.svg" style={{width: 12, height: 12, marginRight: 4}}/>
                Eye dropper
            </button>}
            <div>
                {saveButton}
                {resetButton}
            </div>
        </div>;
    }

    renderOptions() {
        if (this.state.generating) {
            return null;
        }

        const onChangeCIELAB = (e) => {
            this.setState({ useLabColors: e.target.checked });
        };

        return <div>
            <label>
                <input type="checkbox" onChange={onChangeCIELAB} checked={this.state.useLabColors}/>
                Use CIELAB (slow)
            </label>
        </div>;
    }

    renderProgress() {
        if (this.state.progress === null)
            return null;

        return <div>
            Generating LUT: {this.state.progress}%
        </div>;
    }

    renderCanvas() {
        const wrapperStyle = {
            margin: 5,
            padding: 5,
            border: '1px solid black',
            background: 'black',
            display: 'inline-block',
            verticalAlign: 'top'
        };

        const canvasStyle = {
            width: '100%',
            cursor: 'crosshair',
            maxWidth: '256px'
        };

        const onSlide = (e) => {
            this.setState({ slice: e.target.value }, () => {
                this.drawLUT();
            });
        };

        const onSlideI = (e) => {
            this.setState({ intensity: e.target.value }, () => {
                this.drawLUT();
            });
        };

        const colStyle = {
            width: '100%',
            height: '1em',
            lineHeight: '1em',
            whiteSpace: 'nowrap' as const,
            overflow: 'hidden' as const,
            color: '#BBBBBB',
            userSelect: 'text' as const,
            cursor: 'text'
        };

        const { activeColor, selectedColor } = this.state;

        const color = activeColor || selectedColor;

        return <div>
            <div style={wrapperStyle}>
                <b>Palette</b><hr/>
                <div style={colStyle}>{color}</div>
                <canvas
                    style={canvasStyle}
                    ref={this.onCanvasRef}
                    onMouseDown={this.onMouseDown}
                    onMouseMove={this.onMouseMove}
                    onMouseUp={this.onMouseUp}
                    onMouseLeave={this.onMouseUp}
                />
            </div>
            <div style={wrapperStyle}>
                <b>Color curves</b><hr/>
                <canvas
                    style={canvasStyle}
                    ref={this.onCanvasCurvesRef}
                />
            </div>
            <div style={wrapperStyle}>
                <b>LUT slice</b><hr/>
                Intensity: {this.state.intensity}<br/>
                <input type="range"
                        min="0"
                        max="15"
                        value={this.state.intensity}
                        onChange={onSlideI}
                        style={{width: '100%', maxWidth: '256px'}}/>
                <br/>
                Blue level: {this.state.slice}<br/>
                <input type="range"
                        min="0"
                        max={LUT_DIM - 1}
                        value={this.state.slice}
                        onChange={onSlide}
                        style={{width: '100%', maxWidth: '256px'}}/>
                <br/>
                <canvas
                    style={canvasStyle}
                    ref={this.onCanvasLUTRef}
                />
            </div>
        </div>;
    }

    eyeDrop() {
        const { renderer, scene } = DebugData.scope as { renderer: Renderer; scene: any; };
        if (renderer && scene) {
            this.setState({ eyeDropping: true });
            renderer.canvas.style.cursor = 'crosshair';
            const that = this;
            function eventListener(event) {
                renderer.canvas.removeEventListener('click', eventListener);
                renderer.canvas.style.cursor = 'default';

                const { threeRenderer } = renderer;

                const rect = renderer.canvas.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                const color = new Uint8Array(4);

                const pickingTexture = new THREE.WebGLRenderTarget(1, 1);

                const { threeCamera } = scene.camera;
                const size = threeRenderer.getSize(new THREE.Vector2());
                threeCamera.setViewOffset(
                    size.x,
                    size.y,
                    x,
                    y,
                    1,
                    1
                );

                threeRenderer.setRenderTarget(pickingTexture);

                renderer.render(scene);

                threeRenderer.readRenderTargetPixels(
                    pickingTexture,
                    0,
                    0,
                    1,
                    1,
                    color
                );

                const p = that.palette;
                const closest = {
                    dist: Infinity,
                    idx: -1,
                    color: null,
                    x: -1,
                    y: -1
                };
                for (let i = 0; i < 256; i += 1) {
                    const pColor = [
                        p[i * 3],
                        p[(i * 3) + 1],
                        p[(i * 3) + 2]
                    ];
                    const dist = distSq(color, pColor);
                    if (dist < closest.dist) {
                        closest.idx = i;
                        closest.dist = dist;
                        closest.color = `rgb(${pColor})`;
                        closest.x = i % 16;
                        closest.y = Math.floor(i / 16);
                    }
                }
                that.bbs = [
                    {
                        xMin: closest.x,
                        xMax: closest.x,
                        yMin: closest.y,
                        yMax: closest.y
                    }
                ];
                that.setState({selectedColor: `[${closest.x},${closest.y}] = ${closest.color}`});
                that.draw();

                threeCamera.clearViewOffset();
                threeRenderer.setRenderTarget(null);

                that.setState({ eyeDropping: false });
                event.preventDefault();
                event.stopPropagation();
            }
            renderer.canvas.addEventListener('click', eventListener);
        }
    }

    async generate() {
        this.setState({ generating: true, progress: null });
        const lutBuffer = await generateLUTTexture({
            onProgress: (progress) => {
                this.setState({ progress });
            },
            bbs: this.bbs,
            useLabColors: this.state.useLabColors
        });
        this.setState({ generating: false, progress: null, lutBuffer }, () => {
            this.drawLUT();
        });
    }

    draw() {
        if (this.ctx && this.palette) {
            this.ctx.clearRect(0, 0, 512, 512);
            const p = this.palette;
            for (let i = 0; i < 256; i += 1) {
                const x = i % 16;
                const y = Math.floor(i / 16);
                this.ctx.fillStyle = `rgb(${p[i * 3]},${p[(i * 3) + 1]},${p[(i * 3) + 2]})`;
                this.ctx.fillRect(x * 32, y * 32, 32, 32);
            }
            this.ctx.strokeStyle = 'red';
            this.ctx.lineWidth = 2;

            this.bbs.forEach(({xMin, yMin, xMax, yMax}) => {
                const x = xMin * 32;
                const y = yMin * 32;
                const w = ((xMax - xMin) + 1) * 32;
                const h = ((yMax - yMin) + 1) * 32;
                this.ctx.strokeRect(x, y, w, h);
            });
        }
    }

    drawLUT() {
        const sqSize = 512 / LUT_DIM;
        if (this.ctxLUT && this.lutTexture) {
            this.ctxLUT.clearRect(0, 0, 512, 512);
            const b = this.state.slice;
            const level = this.state.intensity * LUT_DIM * LUT_DIM * LUT_DIM * 4;
            for (let r = 0; r < LUT_DIM; r += 1) {
                for (let g = 0; g < LUT_DIM; g += 1) {
                    const idx = (r + (LUT_DIM * (g + (LUT_DIM * b)))) * 4;
                    const cR = this.lutTexture.image.data[level + idx];
                    const cG = this.lutTexture.image.data[level + idx + 1];
                    const cB = this.lutTexture.image.data[level + idx + 2];
                    this.ctxLUT.fillStyle = `rgb(${cR},${cG},${cB})`;
                    this.ctxLUT.fillRect(r * sqSize, g * sqSize, sqSize, sqSize);
                }
            }
        }
    }

    drawCurves() {
        if (this.ctxCurves && this.palette) {
            const ctx = this.ctxCurves;
            const p = this.palette;
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, 512, 256);
            ctx.lineWidth = 2;

            const drawCurve = (color, offset) => {
                ctx.strokeStyle = color;
                ctx.beginPath();
                for (let i = 0; i < 16; i += 1) {
                    const idx = (this.ramp * 16) + i;
                    const x = (i * 32) + 16;
                    const y = 256 - p[(idx * 3) + offset];
                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.stroke();
            };

            drawCurve('red', 0);
            drawCurve('green', 1);
            drawCurve('blue', 2);
        }
    }

    saveLUT() {
        if (this.state.lutBuffer && window.isLocalServer) {
            const start = Date.now();
            this.setState({ saving: true });
            const req = new XMLHttpRequest();
            req.open('POST', 'lut.dat', true);
            req.onload = () => {
                if (Date.now() - start < 1000) {
                    setTimeout(() => {
                        this.setState({ saving: false });
                    }, 1000 - (Date.now() - start));
                } else {
                    this.setState({ saving: false });
                }
            };
            req.setRequestHeader('Content-Type', 'application/octet-stream');
            req.send(new Blob([this.state.lutBuffer]));
        }
    }

    async reset() {
        await resetLUTTexture();
        this.bbs = [
            {
                xMin: 0,
                xMax: 15,
                yMin: 1,
                yMax: 14
            }
        ];
        this.draw();
        this.drawLUT();
        this.setState({ lutBuffer: null });
    }

    onCanvasRef(canvas) {
        if (canvas) {
            canvas.width = 512;
            canvas.height = 512;
            this.ctx = canvas.getContext('2d');
            this.draw();
        }
    }

    onCanvasLUTRef(canvas) {
        if (canvas) {
            canvas.width = 512;
            canvas.height = 512;
            this.ctxLUT = canvas.getContext('2d');
            this.drawLUT();
        }
    }

    onCanvasCurvesRef(canvas) {
        if (canvas) {
            canvas.width = 512;
            canvas.height = 256;
            this.ctxCurves = canvas.getContext('2d');
            this.drawCurves();
        }
    }

    onMouseDown(e) {
        if (e.button !== 0)
            return;

        const { x, y } = this.getCoords(e);
        if (e.shiftKey) {
            this.bbs.push({
                xMin: x,
                yMin: y,
                xMax: x,
                yMax: y,
            });
            this.bbIndex = this.bbs.length - 1;
        } else {
            this.bbs = [{
                xMin: x,
                yMin: y,
                xMax: x,
                yMax: y,
            }];
            this.bbIndex = 0;
        }

        this.draw();
        this.dragging = true;
    }

    onMouseMove(e) {
        const { x, y } = this.getCoords(e);
        if (this.dragging) {
            const bb = this.bbs[this.bbIndex];
            bb.xMax = x;
            bb.yMax = y;
            if (bb.xMax < bb.xMin) {
                const tmp = bb.xMax;
                bb.xMax = bb.xMin;
                bb.xMin = tmp;
            }
            if (bb.yMax < bb.yMin) {
                const tmp = bb.yMax;
                bb.yMax = bb.yMin;
                bb.yMin = tmp;
            }
            this.draw();
        }
        const p = this.palette;
        if (p) {
            const idx = (y * 16) + x;
            const color = `rgb(${p[idx * 3]},${p[(idx * 3) + 1]},${p[(idx * 3) + 2]})`;
            if (this.ramp !== y) {
                this.ramp = y;
                this.drawCurves();
            }
            this.setState({activeColor: `[${x},${y}] = ${color}`});
        }
    }

    onMouseUp() {
        if (this.dragging) {
            this.draw();
            this.dragging = false;
            delete this.bbIndex;
            let singleColor = false;
            if (this.bbs.length === 1) {
                const [bbs] = this.bbs;
                if (bbs.xMin === bbs.xMax &&
                    bbs.yMin === bbs.yMax) {
                    singleColor = true;
                    const { xMin: x, yMin: y } = bbs;
                    const idx = (y * 16) + x;
                    const p = this.palette;
                    const color = `rgb(${p[idx * 3]},${p[(idx * 3) + 1]},${p[(idx * 3) + 2]})`;
                    this.setState({selectedColor: `[${x},${y}] ${color}`});
                }
            }
            if (!singleColor) {
                this.setState({selectedColor: null});
            }
        }
        this.setState({activeColor: null});
    }

    getCoords(e) {
        const rect = e.target.getBoundingClientRect();
        const cellSize = rect.width / 16;
        const x = Math.floor((e.clientX - rect.left) / cellSize);
        const y = Math.floor((e.clientY - rect.top) / cellSize);
        return { x, y };
    }
}
