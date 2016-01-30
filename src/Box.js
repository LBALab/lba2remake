import {Face3} from 'three';
import {each, find} from 'lodash';

import Shape from './Shape';

const vertices_def = [
    [-1, -1, -1],
    [-1, -1, 1],
    [-1, 1, -1],
    [-1, 1, 1],
    [1, -1, -1],
    [1, -1, 1],
    [1, 1, -1],
    [1, 1, 1]
];

export default class Box extends Shape {
    constructor(x, y, z) {
        super(x, y, z, vertices_def);
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
        const key = Shape.face2Key(axis, direction);
        if (key in this.faces_in || key in this.faces_out) {
            return;
        }
        const p = Math.pow(2, axis);
        const p_inv = Math.pow(2, 2 - axis);
        let indices = [];
        for (let i = 0; i < p; ++i) {
            for (let j = 0; j < p_inv; ++j) {
                const index = i * p_inv * 2 + direction * p_inv + j;
                const real_index = this.shifted_vertex_index[index];
                if (real_index != -1) {
                    indices.push(this.offset + real_index);
                } else {
                    indices.push(Shape.findIndexFromOwner(this, index));
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
}
