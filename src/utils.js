// @flow

export function bits(bitfield: number, offset: number, length: number) : number {
    return (bitfield & (((1 << length) - 1)) << offset) >> offset;
}

export function getQueryParams() : Object {
    const query = window.location.hash.replace(/^#/, '');
    const result = {};
    query.split("&").forEach(function(part) {
        var item = part.split("=");
        result[item[0]] = decodeURIComponent(item[1]);
    });
    return result;
}
