import {execute} from './execute';
import T from './types';
import _ from 'lodash';
import THREE from 'three';

export function map(args, scope, userMacros) {
    checkNumArgs('map', args, 2);
    const left = execute(args[0], scope, userMacros);
    checkArgType('map', left, 0, ['array']);
    const tgt = _.map(left, (s) => {
        return s !== undefined ? execute(args[1], s, userMacros) : undefined;
    });
    if (left.__filtered__) {
        tgt.__filtered__ = true;
    }
    return tgt;
}

export function filter(args, scope, userMacros) {
    checkNumArgs('filter', args, 2);
    const left = execute(args[0], scope, userMacros);
    checkArgType('filter', left, 0, ['array']);
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
    checkNumArgs('euler', args, [1, 2]);
    const arg = execute(args[0], scope, userMacros);
    checkArgType('euler', arg, 0, [THREE.Quaternion, THREE.Matrix4, THREE.Vector3]);
    if (args.length === 2)
        checkArgTypeAst('euler', args[1], 1, T.IDENTIFIER, THREE.Euler.RotationOrders);

    if (arg instanceof THREE.Quaternion) {
        const euler = new THREE.Euler();
        euler.setFromQuaternion(arg, 'XYZ');
        return euler;
    } else if (arg instanceof THREE.Matrix4) {
        const euler = new THREE.Euler();
        euler.setFromRotationMatrix(arg, 'XYZ');
        return euler;
    } else {
        const euler = new THREE.Euler();
        euler.setFromVector3(arg, 'XYZ');
        return euler;
    }
}

export function deg(args, scope, userMacros) {
    checkNumArgs('deg', args, 1);
    const arg = execute(args[0], scope, userMacros);
    checkArgType('deg', arg, 0, ['number', THREE.Euler]);

    if (arg instanceof THREE.Euler) {
        const euler = new THREE.Euler();
        euler.copy(arg);
        euler.x = THREE.Math.radToDeg(euler.x);
        euler.y = THREE.Math.radToDeg(euler.y);
        euler.z = THREE.Math.radToDeg(euler.z);
        return euler;
    } else {
        return THREE.Math.radToDeg(arg);
    }
}

export function rad(args, scope, userMacros) {
    checkNumArgs('rad', args, 1);
    const arg = execute(args[0], scope, userMacros);
    checkArgType('rad', arg, 0, ['number', THREE.Euler]);

    if (arg instanceof THREE.Euler) {
        const euler = new THREE.Euler();
        euler.copy(arg);
        euler.x = THREE.Math.degToRad(euler.x);
        euler.y = THREE.Math.degToRad(euler.y);
        euler.z = THREE.Math.degToRad(euler.z);
        return euler;
    } else {
        return THREE.Math.degToRad(arg);
    }
}

export function len(args, scope, userMacros) {
    checkNumArgs('len', args, 1);
    const arg = execute(args[0], scope, userMacros);
    checkArgType('len', arg, 0, ['array', THREE.Vector2, THREE.Vector3, THREE.Vector4]);
    if (arg instanceof THREE.Vector2
        || arg instanceof THREE.Vector3
        || arg instanceof THREE.Vector4) {
        return arg.length();
    } else {
        return arg.length;
    }
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
    let found = _.find(types, t => {
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
        throw TypeError(`Argument $${pos} to ${func}() is of type: ${typeof(arg)}. Expected ${typeTxt.join(' or ')}.`);
    }
}

function mapTypeName(t) {
    if (typeof(t) === 'string')
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
}