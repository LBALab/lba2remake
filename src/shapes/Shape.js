import {Vector3} from 'three';
import {each, map, find} from 'lodash';

export default class Shape {
    constructor(x, y, z, vertices_def, faces_def) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.vertices_def = vertices_def;
        this.faces_def = faces_def;
        this.vertex_index = {};
        each(vertices_def, (vertex, idx) => {
            this.vertex_index[vertex.join(',')] = idx;
        }, this);
        this.intrusions = {};
        this.extrusions = {};
    }

    intrude(shape, face_def) {
        this.intrusions[face_def.key()] = {
            shape: shape,
            face_def: face_def
        };
        return shape;
    }

    extrude(shape, face_def) {
        this.extrusions[face_def.key()] = {
            shape: shape,
            face_def: face_def
        };
        shape.intrude(this, face_def.reverse());
        return shape;
    }

    build(vertices, faces) {
        this.offset = vertices.length;
        this.buildVertices(vertices);
        this.buildFaces(faces);
        each(this.extrusions, extrusion => {
            extrusion.shape.build(vertices, faces);
        });
    }

    buildVertices(vertices) {
        this.shifted_vertex_index = {};
        let shifted_idx = 0;
        each(this.vertices_def, (vertex, index) => {
            const intrusion = find(this.intrusions, intrusion => intrusion.face_def.hasVertex(vertex));
            if (intrusion) {
                this.shifted_vertex_index[index] = -1;
            } else {
                vertices.push(new Vector3(this.x + vertex[0] * 0.5, this.y + vertex[1] * 0.5, this.z + vertex[2] * 0.5));
                this.shifted_vertex_index[index] = shifted_idx;
                shifted_idx++;
            }
        });
    }

    buildFaces(faces) {
        each(this.faces_def, face_def => {
            const key = face_def.key();
            if (!(key in this.intrusions || key in this.extrusions)) {
                const indices = this.computeFaceIndices(face_def);
                const real_indices = map(indices, index => {
                    const real_index = this.shifted_vertex_index[index];
                    if (real_index != -1) {
                        return this.offset + real_index;
                    } else {
                        return Shape.findIndexFromOwner(this, index);
                    }
                }, this);
                face_def.build(faces, real_indices);
            }
        }, this);
    }

    static findIndexFromOwner(shape, base_index) {
        const vertex = shape.vertices_def[base_index];
        for (const key in shape.intrusions) {
            const intrusion = shape.intrusions[key];
            const owner_face_def = intrusion.face_def;
            const owner_shape = intrusion.shape;
            if (owner_face_def.hasVertex(vertex)) {
                let opposite_vertex = vertex.slice();
                opposite_vertex[owner_face_def.axis] *= -1;
                const index = owner_shape.vertex_index[opposite_vertex.join(',')];
                const real_index = owner_shape.shifted_vertex_index[index];
                if (real_index == -1)
                    return Shape.findIndexFromOwner(owner_shape, index);
                else {
                    return owner_shape.offset + real_index;
                }
            }
        }
    }
}
