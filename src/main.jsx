import React from 'react';
import React3 from 'react-three-renderer';
import THREE, {Vector3, Face3} from 'three';
import ReactDOM from 'react-dom';
import {each, map, find} from 'lodash';

var vertices = [];
var faces = [];

class Box {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.faces_in = {};
        this.faces_out = {};
    }

    build(vertices, faces) {
        this.offset = vertices.length;
        this.buildVertices(vertices);
        this.buildFaces(faces);
        each(this.faces_out, extruded_box => {
            extruded_box.build(vertices, faces);
        })
    }

    buildVertices(vertices) {
        const faces_in = map(this.faces_in, (obj, key) => {
            return {
                axis: parseInt(key[0]),
                dir: parseInt(key[1])
            };
        });
        this.buildVertice(vertices, faces_in, -1, -1, -1);
        this.buildVertice(vertices, faces_in, -1, -1, 1);
        this.buildVertice(vertices, faces_in, -1, 1, -1);
        this.buildVertice(vertices, faces_in, -1, 1, 1);
        this.buildVertice(vertices, faces_in, 1, -1, -1);
        this.buildVertice(vertices, faces_in, 1, -1, 1);
        this.buildVertice(vertices, faces_in, 1, 1, -1);
        this.buildVertice(vertices, faces_in, 1, 1, 1);
    }

    buildVertice(vertices, faces_in, x, y, z) {
        const direction = [x, y, z];
        const face = find(faces_in, face => {
            return direction[face.axis] == face.dir * 2 - 1;
        });
        if (face) {
            vertices.push(new Vector3(this.x + x * 0.5, this.y + y * 0.5 + 0.1, this.z + z * 0.5));
        } else {
            vertices.push(new Vector3(this.x + x * 0.5, this.y + y * 0.5, this.z + z * 0.5));
        }
    }

    buildFaces(faces) {
        this.buildFace(faces, 0, 0);
        this.buildFace(faces, 0, 1);
        this.buildFace(faces, 1, 0);
        this.buildFace(faces, 1, 1);
        this.buildFace(faces, 2, 0);
        this.buildFace(faces, 2, 1);
    }

    buildFace(faces, axis, direction) {
        const key = `${axis}${direction}`;
        if (key in this.faces_in || key in this.faces_out) {
            return;
        }
        const p = Math.pow(2, axis);
        const p_inv = Math.pow(2, 2 - axis);
        let idx = [];
        for (let i = 0; i < p; ++i) {
            for (let j = 0; j < p_inv; ++j) {
                idx.push(i * p_inv * 2 + direction * p_inv + j);
            }
        }
        if (direction == axis % 2)
            faces.push(
                new Face3(idx[0] + this.offset, idx[1] + this.offset, idx[2] + this.offset),
                new Face3(idx[1] + this.offset, idx[3] + this.offset, idx[2] + this.offset)
            );
        else
            faces.push(
                new Face3(idx[0] + this.offset, idx[2] + this.offset, idx[1] + this.offset),
                new Face3(idx[1] + this.offset, idx[2] + this.offset, idx[3] + this.offset)
            );
    }

    extrude(box, axis, direction) {
        this.faces_out[`${axis}${direction}`] = box;
        box.faces_in[`${axis}${1 - direction}`] = this;
        return box;
    }
}

var b = new Box(0, 0, 0);
b.extrude(new Box(-1, 0, 0), 0, 0);
b.build(vertices, faces);

console.log('vertices', vertices);
console.log('faces', faces);

class Simple extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.cameraPosition = new THREE.Vector3(0, 0, 3);

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
