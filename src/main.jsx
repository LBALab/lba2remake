import React from 'react';
import ReactDOM from 'react-dom';
import Renderer from './renderer';
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
        const ctx  =node.getContext('2d');
        loadHqrAsync('RESS.hqr')(function(err, data) {
            const src = new Uint8Array(data.getEntry(0));
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
                ctx.drawImage(response, 0, 0, 128, 128);
            });
        });
    }

    render() {
        const canvas_style = {
            position: 'absolute',
            top: 0,
            left: 0,
            width: 128,
            height: 128
        };
        return <div>
            <ThreeContainer/>
            <canvas ref='pal' width="128" height="128" style={canvas_style}/>
        </div>;
    }
}

window.onload = function() {
    ReactDOM.render(<Main/>, document.getElementById('react-main'));
};
