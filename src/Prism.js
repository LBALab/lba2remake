import invariant from 'fbjs/lib/invariant';

import Shape from './Shape';

export default class Prism extends Shape {
    constructor(x, y, z, axis, direction) {
        super(x, y, z);
        this.axis = axis;
        this.direction = direction;
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
