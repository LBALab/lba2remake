import {execute} from './execute';
import _ from 'lodash';
import THREE from 'three';

export function map(args, scope, userMacros) {
    const left = execute(args[0], scope, userMacros);
    const tgt = _.map(left, (s) => {
        return s !== undefined ? execute(args[1], s, userMacros) : undefined;
    });
    if (left.__filtered__) {
        tgt.__filtered__ = true;
    }
    return tgt;
}

export function filter(args, scope, userMacros) {
    const left = execute(args[0], scope, userMacros);
    const tgt = _.map(left, (s) => {
        const v = execute(args[1], s, userMacros);
        if (v) {
            return s;
        }
    });
    tgt.__filtered__ = true;
    return tgt;
}

export function euler(args, scope, userMacros) {
    const arg = execute(args[0], scope, userMacros);
    if (arg instanceof THREE.Quaternion) {
        const euler = new THREE.Euler();
        euler.setFromQuaternion(arg, 'XYZ');
        return euler;
    } else {
        throw new TypeError(`Argument to euler() is of type: ${typeof(arg)}, expected THREE.Quaternion`);
    }
}
