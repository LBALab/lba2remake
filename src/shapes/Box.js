import {each, find} from 'lodash';

import Shape from './Shape';
import RectFace from './../faces/RectFace';

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

const faces_def = [
    new RectFace(0, 0),
    new RectFace(0, 1),
    new RectFace(1, 0),
    new RectFace(1, 1),
    new RectFace(2, 0),
    new RectFace(2, 1)
];

export default class Box extends Shape {
    constructor(x, y, z) {
        super(x, y, z, vertices_def, faces_def);
    }

    computeFaceIndices(face_def) {
        const p = Math.pow(2, face_def.axis);
        const p_inv = Math.pow(2, 2 - face_def.axis);
        let indices = [];
        for (let i = 0; i < p; ++i) {
            for (let j = 0; j < p_inv; ++j) {
                indices.push(i * p_inv * 2 + face_def.direction * p_inv + j);
            }
        }
        return indices;
    }
}
