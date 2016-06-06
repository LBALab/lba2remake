import React from 'react';
import ReactDOM from 'react-dom';

import HQR from './hqr';
import Renderer from './renderer';

const citabau = new HQR();
citabau.load('lba2_data/CITABAU.ILE', function() {
    console.log('onload', citabau.getEntry(0));
});

window.citabau = citabau;

class ThreeContainer extends React.Component{

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

window.onload = function() {
    ReactDOM.render(<ThreeContainer/>, document.getElementById('react-main'));
};
