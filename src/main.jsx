import React from 'react';
import React3 from 'react-three-renderer';
import THREE from 'three';
import ReactDOM from 'react-dom';
import TrackballControls from './utils/trackball';
import HQR from './hqr';

let vertices = [];
let faces = [];

const citabau = new HQR();
citabau.load('lba2_data/CITABAU.ILE', function() {
    console.log('onload', citabau.length, citabau._entries);
});

class Simple extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            cameraPosition: new THREE.Vector3(0, 0, 4)
        };
    }

    componentDidMount() {
        const controls = new TrackballControls(this.refs.mainCamera, ReactDOM.findDOMNode(this.refs.react3));

        controls.rotateSpeed = 4.0;

        controls.addEventListener('change', () => {
            this.setState({
                cameraPosition: this.refs.mainCamera.position
            });
        });

        this.controls = controls;
    }

    onAnimate() {
        this.controls.update();
    }

    render() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        return <React3 ref="react3"
                       mainCamera="camera"
                       width={width}
                       height={height}
                       antialias
                       onAnimate={this.onAnimate.bind(this)}>
            <scene>
                <perspectiveCamera ref="mainCamera"
                                   name="camera"
                                   fov={75}
                                   aspect={width / height}
                                   near={0.1}
                                   far={1000}
                                   position={this.state.cameraPosition}/>
                <axisHelper/>
                <mesh>
                    <geometry vertices={vertices} faces={faces}/>
                    <meshBasicMaterial wireframe={true} color="red"/>
                </mesh>
            </scene>
        </React3>;
    }
}

window.onload = function() {

    setTimeout(function() {
        ReactDOM.render(<Simple/>, document.getElementById('react-main'));
    }, 100);
};
