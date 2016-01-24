import React from 'react';
import React3 from 'react-three-renderer';
import THREE, {Vector3, Face3} from 'three';
import ReactDOM from 'react-dom';

var vertices = [];
var faces = [];

class Box {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    build(vertices, faces) {
        this.buildVertices(vertices);
        this.buildFaces(faces);
    }

    buildVertices(vertices) {
        vertices.push(this.buildVertice(-1, -1, -1));
        vertices.push(this.buildVertice(-1, -1, 1));
        vertices.push(this.buildVertice(-1, 1, -1));
        vertices.push(this.buildVertice(-1, 1, 1));
        vertices.push(this.buildVertice(1, -1, -1));
        vertices.push(this.buildVertice(1, -1, 1));
        vertices.push(this.buildVertice(1, 1, -1));
        vertices.push(this.buildVertice(1, 1, 1));
    }

    buildVertice(x, y, z) {
        return new Vector3(this.x + x, this.y + y, this.z + z);
    }

    buildFaces(faces) {
        faces.push.apply(faces, this.buildFace(0, 0));
        faces.push.apply(faces, this.buildFace(0, 1));
        faces.push.apply(faces, this.buildFace(1, 0));
        faces.push.apply(faces, this.buildFace(1, 1));
        faces.push.apply(faces, this.buildFace(2, 0));
        faces.push.apply(faces, this.buildFace(2, 1));
    }

    buildFace(axis, direction) {
        var p = Math.pow(2, axis);
        var p_inv = Math.pow(2, 2 - axis);
        var idx = [];
        for (let i = 0; i < p; ++i) {
            for (let j = 0; j < p_inv; ++j) {
                idx.push(i * p_inv * 2 + direction * p_inv + j);
            }
        }
        if (direction == axis % 2)
            return [new Face3(idx[0], idx[1], idx[2]), new Face3(idx[1], idx[3], idx[2])];
        else
            return [new Face3(idx[0], idx[2], idx[1]), new Face3(idx[1], idx[2], idx[3])];
    }
}

var b = new Box(0, 0, 0);
b.build(vertices, faces);

class Simple extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.cameraPosition = new THREE.Vector3(0, 0, 5);

        this.state = {
            cubeRotation: new THREE.Euler()
        };

        this._onAnimate = () => {
            this.setState({
                cubeRotation: new THREE.Euler(
                    this.state.cubeRotation.x + 0.002,
                    this.state.cubeRotation.y + 0.002,
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
                    <meshBasicMaterial wireframe={false} color="red" />
                </mesh>
            </scene>
        </React3>;
    }
}
window.onload = function() {
    ReactDOM.render(<Simple/>, document.getElementById('react-main'));
};
