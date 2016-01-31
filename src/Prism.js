import {Face3} from 'three';
import invariant from 'fbjs/lib/invariant';

import Shape from './Shape';

const vertices_def = [
    [-1, -1, -1],
    [-1, -1, 1],
    [-1, 1, -1],
    [-1, 1, 1],
    //[1, -1, -1],
    //[1, -1, 1],
    [1, 0, -1],
    [1, 0, 1]
];

export default class Prism extends Shape {
    constructor(x, y, z, axis, direction) {
        super(x, y, z, vertices_def);
        this.axis = axis;
        this.direction = direction;
    }

    buildFace(faces, axis, direction) {
        const key = Shape.face2Key(axis, direction);
        if (key in this.intrusions || key in this.extrusions) {
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

    intrude(shape, axis, direction) {
        if (process.env.NODE_ENV !== 'production') {
            invariant(Shape.face2Key(axis, direction) != Shape.face2Key(this.axis, 1 - this.direction), 'Cannot intrude this face');
        }
        super.intrude(shape, axis, direction);
    }
}
