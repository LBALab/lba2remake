import {makePure} from './debug';

export function pure() {
    return function (target, propertyKey: string) {
        makePure(target[propertyKey]);
    };
}
