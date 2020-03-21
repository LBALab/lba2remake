
export const readFromBuffer = (buffer: Uint8Array) => {
    return buffer.buffer
       .slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
};
