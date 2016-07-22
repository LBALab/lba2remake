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

    componentDidMount() {
        const node = ReactDOM.findDOMNode(this);
        this.renderer = new Renderer(this.state.width, this.state.height, node);
        node.appendChild(this.renderer.renderer.domElement);
        this.renderer.onResize(this.state.width, this.state.height);
        window.addEventListener('resize', this.onWindowResize.bind(this), false);
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
    constructor() {
        super();
        this.state = {
            showPalette: false
        };
    }

    computeChartData(offset) {
        const data = {
            red: [],
            green: [],
            blue: []
        };
        for (let i = 0; i < 16; ++i) {
            data.red.push(this.src[(i + offset) * 3]);
            data.green.push(this.src[(i + offset) * 3 + 1]);
            data.blue.push(this.src[(i + offset) * 3 + 2]);
        }
        return data;
    }

    componentDidMount() {
        const node = this.refs.pal;
        const ctx = node.getContext('2d');
        const chartNode = this.refs.chart;
        const that = this;
        window.addEventListener('keydown', function(event) {
            if (event.keyCode == 80){
                that.setState({showPalette: !(that.state.showPalette)});
            }
        });
        loadHqrAsync('RESS.HQR')(function(err, hqr) {
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
                ctx.drawImage(response, 0, 0, 256, 256);
            });
            that.src = src;
            const {red, green, blue} = that.computeChartData(0);
            that.chart = new Chart(chartNode, {
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

    onClick(event) {
        const x = event.clientX >> 4;
        const y = event.clientY >> 4;
        const {red, green, blue} = this.computeChartData(y * 16);
        this.chart.data.datasets[0].data = red;
        this.chart.data.datasets[1].data = green;
        this.chart.data.datasets[2].data = blue;
        this.chart.update();
    }

    render() {
        const pal_visibility = this.state.showPalette ? 'block' : 'none';
        const pal_style = {
            position: 'absolute',
            top: 0,
            left: 0,
            width: 256,
            height: 256,
            display: pal_visibility
        };
        const chart_style = {
            position: 'absolute',
            top: 0,
            right: 0,
            width: 512,
            height: 512,
            background: 'rgba(255, 255, 255, 0.4)',
            display: pal_visibility
        };
        return <div>
            <ThreeContainer/>
            <canvas ref='pal' width="256" height="256" onClick={this.onClick.bind(this)} style={pal_style}/>
            <canvas ref='chart' width="512" height="512" style={chart_style}/>
        </div>;
    }
}

window.onload = function() {
    ReactDOM.render(<Main/>, document.getElementById('react-main'));
};
