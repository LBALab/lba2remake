import React from 'react';
import { extend } from 'lodash';
import { generateLUTTexture, resetLUTTexture, loadLUTTexture } from '../../../../../utils/lut';
import { loadHqr } from '../../../../../hqr.ts';
import { editor, fullscreen } from '../../../../styles';

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

export default class PaletteAreaContent extends React.Component {
    constructor(props) {
        super(props);

        this.generate = this.generate.bind(this);
        this.onCanvasRef = this.onCanvasRef.bind(this);
        this.onCanvasLUTRef = this.onCanvasLUTRef.bind(this);
        this.saveLUT = this.saveLUT.bind(this);
        this.reset = this.reset.bind(this);

        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);

        this.state = {
            generating: false,
            progress: null,
            useLabColors: false,
            saving: false,
            slice: 0,
        };

        loadHqr('RESS.HQR').then((ress) => {
            this.palette = new Uint8Array(ress.getEntry(0));
            this.draw();
            this.drawLUT();
        });

        loadLUTTexture().then((lutTexture) => {
            this.lutTexture = lutTexture;
            this.drawLUT();
        });

        this.bb = {
            xMin: 0,
            yMin: 1,
            xMax: 15,
            yMax: 14
        };
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
                Use CIELAB lab color space (slow)
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
            marginTop: 20,
        };

        const canvasStyle = {
            width: '100%',
            cursor: 'crosshair'
        };

        const onSlide = (e) => {
            this.setState({ slice: e.target.value }, () => {
                this.drawLUT();
            });
        };


        return <div>
            <div style={wrapperStyle}>
                Palette:
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
                LUT slice<br/>
                Blue level: {this.state.slice}<br/>
                <input type="range" min="0" max="63" value={this.state.slice} onChange={onSlide} style={{width: '100%'}}/>
                <canvas
                    style={canvasStyle}
                    ref={this.onCanvasLUTRef}
                />
            </div>
        </div>;
    }

    async generate() {
        this.setState({ generating: true, progress: null });
        const lutBuffer = await generateLUTTexture({
            onProgress: (progress) => {
                this.setState({ progress });
            },
            bb: this.bb,
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
            const x = this.bb.xMin * 32;
            const y = this.bb.yMin * 32;
            const w = ((this.bb.xMax - this.bb.xMin) + 1) * 32;
            const h = ((this.bb.yMax - this.bb.yMin) + 1) * 32;
            this.ctx.strokeRect(x, y, w, h);
        }
    }

    drawLUT() {
        if (this.ctxLUT && this.palette && this.lutTexture) {
            this.ctxLUT.clearRect(0, 0, 512, 512);
            const p = this.palette;
            const b = this.state.slice;
            for (let r = 0; r < 64; r += 1) {
                for (let g = 0; g < 64; g += 1) {
                    const idx = r + (64 * (g + (64 * b)));
                    const pIdx = this.lutTexture.image.data[idx];
                    this.ctxLUT.fillStyle = `rgb(${p[pIdx * 3]},${p[(pIdx * 3) + 1]},${p[(pIdx * 3) + 2]})`;
                    this.ctxLUT.fillRect(r * 8, g * 8, 8, 8);
                }
            }
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

    reset() {
        resetLUTTexture();
        this.bb = {
            xMin: 0,
            yMin: 1,
            xMax: 15,
            yMax: 14
        };
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

    onMouseDown(e) {
        if (e.button !== 0)
            return;

        const { x, y } = this.getCoords(e);
        this.bb.xMin = x;
        this.bb.yMin = y;
        this.bb.xMax = x;
        this.bb.yMax = y;
        this.draw();
        this.dragging = true;
    }

    onMouseMove(e) {
        if (this.dragging === true) {
            const { x, y } = this.getCoords(e);
            this.bb.xMax = x;
            this.bb.yMax = y;
            this.draw();
        }
    }

    onMouseUp() {
        this.draw();
        this.dragging = false;
    }

    getCoords(e) {
        const rect = e.target.getBoundingClientRect();
        const cellSize = rect.width / 16;
        const x = Math.floor((e.clientX - rect.left) / cellSize);
        const y = Math.floor((e.clientY - rect.top) / cellSize);
        return { x, y };
    }
}
