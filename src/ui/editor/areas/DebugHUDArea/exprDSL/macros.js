import _ from 'lodash';
import * as THREE from 'three';
import {execute} from './execute';
import T from './types';

export function map(args, scopes, userMacros) {
    checkNumArgs('map', args, 2);
    const left = execute(args[0], scopes, userMacros);
    checkArgType('map', left, 0, ['array']);
    const tgt = _.map(left, s =>
        (s !== undefined ? execute(args[1], _.concat(scopes, s), userMacros) : undefined));
    if (left.__filtered__) {
        tgt.__filtered__ = true;
    }
    return tgt;
}

export function filter(args, scopes, userMacros) {
    checkNumArgs('filter', args, 2);
    const left = execute(args[0], scopes, userMacros);
    checkArgType('filter', left, 0, ['array']);
    const tgt = _.map(left, (s) => {
        const v = execute(args[1], _.concat(scopes, s), userMacros);
        if (v) {
            return s;
        }
        return null;
    });
    tgt.__filtered__ = true;
    return tgt;
}

export function sort(args, scopes, userMacros) {
    checkNumArgs('sort', args, 1);
    const left = execute(args[0], scopes, userMacros);
    checkArgType('sort', left, 0, ['array']);
    const tgt = _.filter(_.map(left, (value, idx) => ({idx, value})), v => v.value !== undefined);
    tgt.sort((a, b) => a.value - b.value);
    tgt.__sorted__ = true;
    return tgt;
}

export function euler(args, scopes, userMacros) {
    checkNumArgs('euler', args, [1, 2]);
    const arg = execute(args[0], scopes, userMacros);
    checkArgType('euler', arg, 0, [THREE.Quaternion, THREE.Matrix4, THREE.Vector3]);
    if (args.length === 2)
        checkArgTypeAst('euler', args[1], 1, T.IDENTIFIER, THREE.Euler.RotationOrders);

    const eu = new THREE.Euler();
    if (arg instanceof THREE.Quaternion) {
        eu.setFromQuaternion(arg, 'XYZ');
    } else if (arg instanceof THREE.Matrix4) {
        eu.setFromRotationMatrix(arg, 'XYZ');
    } else {
        eu.setFromVector3(arg, 'XYZ');
    }
    return eu;
}

export function norm(args, scopes, userMacros) {
    checkNumArgs('norm', args, 1);
    const arg = execute(args[0], scopes, userMacros);
    checkArgType('norm', arg, 0, [
        THREE.Quaternion,
        THREE.Vector2,
        THREE.Vector3,
        THREE.Vector4
    ]);

    const copy = arg.clone();
    copy.normalize();
    return copy;
}

export function deg(args, scopes, userMacros) {
    checkNumArgs('deg', args, 1);
    const arg = execute(args[0], scopes, userMacros);
    checkArgType('deg', arg, 0, ['number', THREE.Euler]);

    if (arg instanceof THREE.Euler) {
        const eu = new THREE.Euler();
        eu.copy(arg);
        eu.x = THREE.Math.radToDeg(eu.x);
        eu.y = THREE.Math.radToDeg(eu.y);
        eu.z = THREE.Math.radToDeg(eu.z);
        return eu;
    }
    return THREE.Math.radToDeg(arg);
}

export function rad(args, scopes, userMacros) {
    checkNumArgs('rad', args, 1);
    const arg = execute(args[0], scopes, userMacros);
    checkArgType('rad', arg, 0, ['number', THREE.Euler]);

    if (arg instanceof THREE.Euler) {
        const eu = new THREE.Euler();
        eu.copy(arg);
        eu.x = THREE.Math.degToRad(eu.x);
        eu.y = THREE.Math.degToRad(eu.y);
        eu.z = THREE.Math.degToRad(eu.z);
        return eu;
    }
    return THREE.Math.degToRad(arg);
}

export function len(args, scopes, userMacros) {
    checkNumArgs('len', args, 1);
    const arg = execute(args[0], scopes, userMacros);
    checkArgType('len', arg, 0, ['array', THREE.Vector2, THREE.Vector3, THREE.Vector4]);
    if (arg instanceof THREE.Vector2
        || arg instanceof THREE.Vector3
        || arg instanceof THREE.Vector4) {
        return arg.length();
    }
    return arg.length;
}

export function dist(args, scopes, userMacros) {
    checkNumArgs('dist', args, 2);
    const arg0 = execute(args[0], scopes, userMacros);
    const arg1 = execute(args[1], scopes, userMacros);
    checkArgType('dist', arg0, 0, [THREE.Vector2, THREE.Vector3, THREE.Vector4]);
    checkArgType('dist', arg1, 1, [THREE.Vector2, THREE.Vector3, THREE.Vector4]);
    if (arg0.constructor === arg1.constructor) {
        const diff = arg0.clone();
        diff.sub(arg1);
        return diff.length();
    }
    throw TypeError('Arguments to dist() must be of the same type.');
}

function checkNumArgs(func, args, n) {
    if (_.isArray(n)) {
        if (args.length < n[0] || args.length > n[1]) {
            throw Error(`Invalid number of arguments to ${func}(). Expected: ${n[0]} to ${n[1]} arguments, found: ${args.length}.`);
        }
    } else if (args.length !== n) {
        throw Error(`Invalid number of arguments to ${func}(). Expected: ${n}, found: ${args.length}.`);
    }
}

function checkArgTypeAst(func, arg, pos, type, values) {
    if (type === T.IDENTIFIER && arg.type === T.IDENTIFIER) {
        if (values.indexOf(arg.value) === -1) {
            throw TypeError(`Argument $${pos} to ${func}(). Found identifier: ${arg.value}. Expected one of: ${values.join(', ')}.`);
        }
    } else {
        throw TypeError(`Argument $${pos} to ${func}() is of type: ${arg.type}. Expected ${type}.`);
    }
}

function checkArgType(func, arg, pos, types) {
    const found = _.find(types, (t) => {
        switch (t) {
            case 'array':
                return _.isArray(arg);
            case 'number':
                return _.isNumber(arg);
            default:
                return arg instanceof t;
        }
    });
    if (!found) {
        const typeTxt = _.map(types, mapTypeName);
        throw TypeError(`Argument $${pos} to ${func}() is of type: ${typeof (arg)}. Expected ${typeTxt.join(' or ')}.`);
    }
}

function mapTypeName(t) {
    if (typeof (t) === 'string')
        return t;
    else if (t === THREE.Vector2)
        return 'THREE.Vector2';
    else if (t === THREE.Vector3)
        return 'THREE.Vector3';
    else if (t === THREE.Vector4)
        return 'THREE.Vector4';
    else if (t === THREE.Euler)
        return 'THREE.Euler';
    else if (t === THREE.Quaternion)
        return 'THREE.Quaternion';
    else if (t === THREE.Matrix3)
        return 'THREE.Matrix3';
    else if (t === THREE.Matrix4)
        return 'THREE.Matrix4';
    return null;
}
