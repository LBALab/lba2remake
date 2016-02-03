import React from 'react';
import React3 from 'react-three-renderer';
import THREE from 'three';
import ReactDOM from 'react-dom';
import TrackballControls from './utils/trackball';
import Box from './shapes/Box';
import Prism from './shapes/Prism';
import RectFace from './faces/RectFace';

let vertices = [];
let faces = [];

let b = new Box(0, 0, 0);
let b2 = b.extrude(new Box(-1, 0.5, 0), new RectFace(0, 0));
let b3 = b2.extrude(new Box(-2, 0, 0), new RectFace(0, 0));
b3.extrude(new Box(-2.5, 1, 0), new RectFace(1, 1));
let b4 = b.extrude(new Box(1, 0, 0), new RectFace(0, 1));
//b4.extrude(new Prism(2, 0, 0, 0, 0), 0, 1);
b.extrude(new Box(0, 1, 0), new RectFace(1, 1))
    .extrude(new Box(0, 2, 0.25), new RectFace(1, 1));
b.extrude(new Box(0, -2, 0), new RectFace(1, 0));
b = new Prism(0, 0, 0);
b.build(vertices, faces);

console.log('vertices', vertices.length, 'faces', faces.length);

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
