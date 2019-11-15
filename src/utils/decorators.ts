export function pure() {
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        target[propertyKey].__pure_function = true;
    };
}
