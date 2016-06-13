import React from 'react';
import ReactDOM from 'react-dom';
import Renderer from './renderer';
import Chart from 'chart.js';
import _ from 'lodash';
import {loadHqrAsync} from './hqr';

class ThreeContainer extends React.Component {

    constructor(props) {
        super(props);
        this.state = this.getComponentSize();
    }

    componentWillMount() {
        this.renderer = new Renderer(this.state.width, this.state.height);
        window.addEventListener('resize', this.onWindowResize.bind(this), false);
    }

    componentDidMount() {
        const node = ReactDOM.findDOMNode(this);
        node.appendChild(this.renderer.renderer.domElement);
        this.renderer.onResize(this.state.width, this.state.height);
    }

    onWindowResize() {
        const size = this.getComponentSize();
        this.setState(size);
        this.renderer.onResize(size.width, size.height);
    }

    getComponentSize() {
        return {
            width: window.innerWidth,
            height: window.innerHeight
        };
    }

    render() {
        return <div></div>;
    }
}

class Main extends React.Component {

    componentDidMount() {
        const node = this.refs.pal;
        const ctx = node.getContext('2d');
        const chartNode = this.refs.chart;
        loadHqrAsync('RESS.hqr')(function(err, hqr) {
            const src = new Uint8Array(hqr.getEntry(0));
            const tgt = new Uint8ClampedArray(256 * 4);
            for (let i = 0; i < 256; ++i) {
                tgt[i * 4] = src[i * 3];
                tgt[i * 4 + 1] = src[i * 3 + 1];
                tgt[i * 4 + 2] = src[i * 3 + 2];
                tgt[i * 4 + 3] = 0xFF;
            }
            const idt = new ImageData(tgt, 16, 16);
            createImageBitmap(idt).then(function(response) {
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(response, 0, 0, 192, 192);
            });

            const red = [];
            const green = [];
            const blue = [];
            const offset = 16;
            for (let i = 0; i < 16; ++i) {
                red.push(src[(i + offset) * 3]);
                green.push(src[(i + offset) * 3 + 1]);
                blue.push(src[(i + offset) * 3 + 2]);
            }
            new Chart(chartNode, {
                type: 'line',
                data: {
                    labels: _.range(16),
                    datasets: [
                        {
                            borderColor: 'red',
                            label: 'R',
                            data: red
                        },
                        {
                            borderColor: 'green',
                            label: 'G',
                            data: green
                        },
                        {
                            borderColor: 'blue',
                            label: 'B',
                            data: blue
                        }
                    ]
                },
                options: {
                    responsive: false
                }
            });
        });
    }

    render() {
        const canvas_style = {
            position: 'absolute',
            top: 0,
            left: 0,
            width: 192,
            height: 192
        };
        const canvas_style2 = {
            position: 'absolute',
            top: 0,
            right: 0,
            width: 256,
            height: 192
        };
        return <div>
            <canvas ref='pal' width="192" height="192" style={canvas_style}/>
            <canvas ref='chart' width="256" height="192" style={canvas_style2}/>
        </div>;
    }
}

window.onload = function() {
    ReactDOM.render(<Main/>, document.getElementById('react-main'));
};
