// @flow

export const DebugFlags = {
    DEBUG_COLLISIONS: false
};

export function bits(bitfield: number, offset: number, length: number) : number {
    return (bitfield & (((1 << length) - 1)) << offset) >> offset;
}

export function parseQueryParams() : Object {
    const query = window.location.hash.replace(/^#/, '');
    const result = {};
    query.split("&").forEach(function(part) {
        const item = part.split("=");
        if (item[0] in DebugFlags) {
            DebugFlags[item[0]] = true;
        }
        result[item[0]] = decodeURIComponent(item[1]);
    });
    return result;
}
