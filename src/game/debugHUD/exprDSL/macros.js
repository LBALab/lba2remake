import {execute} from './execute';
import _ from 'lodash';

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
