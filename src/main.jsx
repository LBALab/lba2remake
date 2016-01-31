import React from 'react';
import React3 from 'react-three-renderer';
import THREE from 'three';
import ReactDOM from 'react-dom';
import Box from './Box';
import Prism from './Prism';
import RectFace from './RectFace';

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
//let b = new Prism(0, 0, 0, 0, 0);
b.build(vertices, faces);

console.log('vertices', vertices.length, 'faces', faces.length);

class Simple extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.cameraPosition = new THREE.Vector3(0, 0, 4);

        this.state = {
            cubeRotation: new THREE.Euler()
        };

        this._onAnimate = () => {
            this.setState({
                cubeRotation: new THREE.Euler(
                    this.state.cubeRotation.x + 0.005,
                    this.state.cubeRotation.y + 0.005,
                    0
                )
            });
        };
    }

    render() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        return <React3 mainCamera="camera"
                       width={width}
                       height={height}
                       onAnimate={this._onAnimate}>
            <scene>
                <perspectiveCamera name="camera"
                                   fov={75}
                                   aspect={width / height}
                                   near={0.1}
                                   far={1000}
                                   position={this.cameraPosition}/>
                <axisHelper rotation={this.state.cubeRotation}/>
                <mesh rotation={this.state.cubeRotation}>
                    <geometry vertices={vertices} faces={faces}/>
                    <meshBasicMaterial wireframe={true} color="red" />
                </mesh>
            </scene>
        </React3>;
    }
}
window.onload = function() {
    ReactDOM.render(<Simple/>, document.getElementById('react-main'));
};
