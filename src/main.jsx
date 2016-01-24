import React from 'react';
import React3 from 'react-three-renderer';
import THREE, {Vector3, Face3} from 'three';
import ReactDOM from 'react-dom';
import {each, map, find, range} from 'lodash';

var vertices = [];
var faces = [];

var vertices_pos = [
    [-1, -1, -1],
    [-1, -1, 1],
    [-1, 1, -1],
    [-1, 1, 1],
    [1, -1, -1],
    [1, -1, 1],
    [1, 1, -1],
    [1, 1, 1]
];

var index_from_pos = {};

each(vertices_pos, (pos, idx) => {
    index_from_pos[pos.join(',')] = idx;
});

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
        each(range(8), idx => {
            this.buildVertice(vertices, faces_in, idx);
        });
    }

    buildVertice(vertices, faces_in, idx) {
        const pos = vertices_pos[idx];
        const face = find(faces_in, face => {
            return pos[face.axis] == face.dir * 2 - 1;
        });
        if (!face) {
            vertices.push(new Vector3(this.x + pos[0] * 0.5, this.y + pos[1] * 0.5, this.z + pos[2] * 0.5));
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
        let indices = [];
        for (let i = 0; i < p; ++i) {
            for (let j = 0; j < p_inv; ++j) {
                const index = i * p_inv * 2 + direction * p_inv + j;
                const pos = vertices_pos[index];
                let in_face = null;
                each(this.faces_in, (obj, key) => {
                    const axis = parseInt(key[0]);
                    const dir = parseInt(key[1]);
                    if (pos[axis] == dir * 2 - 1) {
                        in_face = {axis: axis, dir: dir, obj: obj};
                    }
                });
                if (!in_face) {
                    indices.push(this.offset + index);
                } else {
                    let r_pos = pos.slice();
                    r_pos[in_face.axis] *= -1;
                    indices.push(in_face.obj.offset + index_from_pos[r_pos.join(',')]);
                }
            }
        }
        if (direction == axis % 2)
            faces.push(
                new Face3(indices[0], indices[1], indices[2]),
                new Face3(indices[1], indices[3], indices[2])
            );
        else
            faces.push(
                new Face3(indices[0], indices[2], indices[1]),
                new Face3(indices[1], indices[2], indices[3])
            );
    }

    extrude(box, axis, direction) {
        this.faces_out[`${axis}${direction}`] = box;
        box.faces_in[`${axis}${1 - direction}`] = this;
        return box;
    }
}

let b = new Box(0, 0, 0);
let b2 = b.extrude(new Box(-1, 0.5, 0), 0, 0);
b2.extrude(new Box(-2, 0, 0), 0, 0);
b.build(vertices, faces);

console.log('vertices', vertices.length, 'faces', faces.length);

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
