import {Vector3} from 'three';
import {each, map, find} from 'lodash';

export default class Shape {
    constructor(x, y, z, vertices_def) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.vertices_def = vertices_def;
        this.vertex_index = {};
        each(vertices_def, (vertex, idx) => {
            this.vertex_index[vertex.join(',')] = idx;
        }, this);
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
        this.offset = vertices.length;
        this.buildVertices(vertices);
        this.buildFaces(faces);
        each(this.faces_out, extruded_shape => {
            extruded_shape.build(vertices, faces);
        });
    }

    buildVertices(vertices) {
        const faces_in = map(this.faces_in, (shape, key) => Shape.key2Face(key));
        this.shifted_vertex_index = {};
        let shifted_idx = 0;
        for (let idx in this.vertices_def) {
            const vertex = this.vertices_def[idx];
            const in_face = find(faces_in, Shape.isPartOfFace.bind(null, vertex));
            if (in_face) {
                this.shifted_vertex_index[idx] = -1;
            } else {
                vertices.push(new Vector3(this.x + vertex[0] * 0.5, this.y + vertex[1] * 0.5, this.z + vertex[2] * 0.5));
                this.shifted_vertex_index[idx] = shifted_idx;
                shifted_idx++;
            }
        }
    }

    static face2Key(axis, direction) {
        return `${axis}${direction}`;
    }

    static key2Face(key) {
        return {
            axis: parseInt(key[0]),
            direction: parseInt(key[1])
        };
    }

    static isPartOfFace(vertex, face) {
        return vertex[face.axis] == face.direction * 2 - 1;
    }

    static findIndexFromOwner(shape, base_index) {
        const vertex = shape.vertices_def[base_index];
        for (let key in shape.faces_in) {
            const {axis, direction} = Shape.key2Face(key);
            if (vertex[axis] == direction * 2 - 1) {
                const owner_shape = shape.faces_in[key];
                let opposite_vertex = vertex.slice();
                opposite_vertex[axis] *= -1;
                const index = owner_shape.vertex_index[opposite_vertex.join(',')];
                const real_index = owner_shape.shifted_vertex_index[index];
                if (real_index == -1)
                    return Shape.findIndexFromOwner(owner_shape, index);
                else
                    return owner_shape.offset + real_index;
            }
        }
    }
}
