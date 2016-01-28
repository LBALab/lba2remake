import {each} from 'lodash';

export default class Shape {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.faces_in = {};
        this.faces_out = {};
    }

    intrude(shape, axis, direction) {
        this.faces_in[Shape.face2Key(axis, direction)] = shape;
    }

    extrude(shape, axis, direction) {
        this.faces_out[Shape.face2Key(axis, direction)] = shape;
        shape.intrude(this, axis, 1 - direction);
        return shape;
    }

    build(vertices, faces) {
        each(this.faces_out, extruded_shape => {
            extruded_shape.build(vertices, faces);
        });
    }

    static face2Key(axis, direction) {
        return `${axis}${direction}`;
    }

    static key2Face(key) {
        return {
            axis: parseInt(key[0]),
            dir: parseInt(key[1])
        };
    }
}
