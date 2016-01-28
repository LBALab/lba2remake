import Shape from './Shape'
import invariant from 'fbjs/lib/invariant';

export default class Prism extends Shape {
    constructor(x, y, z, axis, direction) {
        super(x, y, z);
        this.axis = axis;
        this.direction = direction;
    }

    build(vertices, faces) {
        this.offset = vertices.length;
        this.buildVertices(vertices);
        this.buildFaces(faces);
        super.build(vertices, faces);
    }

    buildVertices(vertices) {

    }

    buildFaces(faces) {

    }

    intrude(shape, axis, direction) {
        if (process.env.NODE_ENV !== 'production') {
            invariant(Shape.face2Key(axis, direction) != Shape.face2Key(this.axis, 1 - this.direction), 'Cannot intrude this face');
        }
        super.intrude(shape, axis, direction);
    }
}
