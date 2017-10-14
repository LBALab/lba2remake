// @flow
export const DebugFlags = {
    boundingBoxes: false
};

export function bits(bitfield: number, offset: number, length: number) : number {
    return (bitfield & (((1 << length) - 1)) << offset) >> offset;
}

