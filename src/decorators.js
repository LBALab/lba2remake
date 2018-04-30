/* eslint-disable no-underscore-dangle */
import {isFunction} from 'lodash';

export function pure(target, name, descriptor) {
    if (isFunction(target[name])) {
        target[name].__pure_function = true;
    } else {
        throw new Error('Cannot apply pure decorator to non-function');
    }
    return descriptor;
}

export function locate(location) {
    return (target, name, descriptor) => {
        target[name].__location = location;
        return descriptor;
    };
}
