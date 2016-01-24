import {Vector3, Face3} from 'three';
import {each, map, find, range} from 'lodash';

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

export default class Box {
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
        this.vert_num_map = {};
        let num = 0;
        each(range(8), idx => {
            const pos = vertices_pos[idx];
            const face = find(faces_in, face => {
                return pos[face.axis] == face.dir * 2 - 1;
            });
            if (!face) {
                vertices.push(new Vector3(this.x + pos[0] * 0.5, this.y + pos[1] * 0.5, this.z + pos[2] * 0.5));
                this.vert_num_map[idx] = num;
                num++;
            } else {
                this.vert_num_map[idx] = -1;
            }
        });
    }

    buildFaces(faces) {
        this.buildFace(faces, 0, 0);
        this.buildFace(faces, 0, 1);
        this.buildFace(faces, 1, 0);
        this.buildFace(faces, 1, 1);
        this.buildFace(faces, 2, 0);
        this.buildFace(faces, 2, 1);
    }

    static findIndexFromOwner(box, pos) {
        for (let key in box.faces_in) {
            if (box.faces_in.hasOwnProperty(key)) {
                const axis = parseInt(key[0]);
                const dir = parseInt(key[1]);
                if (pos[axis] == dir * 2 - 1) {
                    const owner_box = box.faces_in[key];
                    let r_pos = pos.slice();
                    r_pos[axis] *= -1;
                    const index = index_from_pos[r_pos.join(',')];
                    const real_index = owner_box.vert_num_map[index];
                    if (real_index == -1)
                        return Box.findIndexFromOwner(owner_box, r_pos);
                    else
                        return owner_box.offset + real_index;
                }
            }
        }
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
                const real_index = this.vert_num_map[index];
                if (real_index != -1) {
                    indices.push(this.offset + real_index);
                } else {
                    const owner_index = Box.findIndexFromOwner(this, vertices_pos[index]);
                    indices.push(owner_index);
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
