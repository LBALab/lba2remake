import {makePure} from './debug';

export function pure() {
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        makePure(target[propertyKey]);
    };
}
