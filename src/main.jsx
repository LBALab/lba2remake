import React from 'react';
import ReactDOM from 'react-dom';
import Renderer from './renderer';

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

window.onload = function() {
    ReactDOM.render(<ThreeContainer/>, document.getElementById('react-main'));
};
