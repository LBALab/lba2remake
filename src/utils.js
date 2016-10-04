export function bits(bitfield, offset, length) {
    return (bitfield & (((1 << length) - 1)) << offset) >> offset;
}
