/* eslint-disable no-underscore-dangle */

export function bits(bitfield: number, offset: number, length: number) : number {
    return (bitfield & ((((1 << length) - 1)) << offset)) >> offset;
}

// tslint:disable-next-line:max-line-length
const STRIP_COMMENTS = /(\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s*=[^,\)]*(('(?:\\'|[^'\r\n])*')|("(?:\\"|[^"\r\n])*"))|(\s*=[^,\)]*))/mg;
const ARGUMENT_NAMES = /([^\s,]+)/g;

interface MetaFunction extends Function {
    __param_names?: [string];
    __pure_function?: boolean;
}

export function getParamNames(func: MetaFunction) : string[] {
    if (func.__param_names) {
        return func.__param_names;
    }
    const fnStr = func.toString().replace(STRIP_COMMENTS, '');
    let result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
    if (result === null)
        result = [];
    return result;
}

export function sBind(fct: MetaFunction, thisValue: any, ...args: any) {
    const tgt = fct.bind(thisValue, ...args);
    const paramNames = getParamNames(fct);
    if (paramNames && paramNames.length > 0)
        tgt.__param_names = paramNames.slice(args.length);
    if (fct.__pure_function) {
        tgt.__pure_function = fct.__pure_function;
    }
    return tgt;
}
