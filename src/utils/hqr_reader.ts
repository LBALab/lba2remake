export interface Entry {
    type: number;
    offset: number;
    originalSize: number;
    compressedSize: number;
    hasHiddenEntry: boolean;
    nextHiddenEntry?: number;
}

export const readHqrHeader = (buffer: ArrayBuffer, isVoxHQR: boolean) => {
    const entries: Entry[] = [];
    const firstOffset = new Int32Array(buffer, 0, 1);
    const numEntries = (firstOffset[0] / 4) - 1;
    const idx_array = new Uint32Array(buffer, 0, numEntries);
    for (let i = 0; i < idx_array.length; i += 1) {
        const header = new DataView(buffer, idx_array[i], 10);
        entries.push({
            offset: idx_array[i] + 10,
            originalSize: header.getUint32(0, true),
            compressedSize: header.getUint32(4, true),
            type: header.getInt16(8, true),
            hasHiddenEntry: false,
            nextHiddenEntry: -1
        });
    }

    if (isVoxHQR) {
        addHiddenEntriesIfExist(buffer, idx_array, entries);
    }
    return entries;
};

const addHiddenEntriesIfExist = (buffer: ArrayBuffer, idx_array: Uint32Array, entries: Entry[]) => {
    for (let i = 0; i < idx_array.length; i += 1) {
        const entry = entries[i];
        let entryEndOffset = entry.offset + entry.compressedSize + 10;
        let nextEntryOffset = buffer.byteLength; // end of file
        if (i + 1 < idx_array.length) {
            nextEntryOffset = entries[i + 1].offset;
        }
        if (entryEndOffset < nextEntryOffset) {
            entry.hasHiddenEntry = true;
            entry.nextHiddenEntry = entries.length;
        }
        while (entryEndOffset < nextEntryOffset) { // hidden entry found
            const header = new DataView(buffer, entryEndOffset - 10, 10);
            const e = {
                offset: entryEndOffset,
                originalSize: header.getUint32(0, true),
                compressedSize: header.getUint32(4, true),
                type: header.getInt16(8, true),
                hasHiddenEntry: false,
                nextHiddenEntry: -1
            };
            entryEndOffset = e.offset + e.compressedSize + 10;
            if (entryEndOffset < nextEntryOffset) {
                e.hasHiddenEntry = true;
                e.nextHiddenEntry = entries.length + 1;
            }
            entries.push(e);
        }
    }
};

export const readHqrEntry = (buffer: ArrayBuffer, entry: Entry) => {
    if (isBlankOrInvalid(entry)) {
        return new ArrayBuffer(0);
    }
    if (entry.type) {
        const tgt_buffer = new ArrayBuffer(entry.originalSize);
        const source = new Uint8Array(buffer, entry.offset, entry.compressedSize);
        const target = new Uint8Array(tgt_buffer);
        let src_pos = 0;
        let tgt_pos = 0;
        while ((src_pos + 1) <= entry.compressedSize) {
            const flag = source[src_pos];

            for (let i = 0; i < 8; i += 1) {
                src_pos += 1;

                if ((flag & (1 << i)) !== 0) {
                    target[tgt_pos] = source[src_pos];
                    tgt_pos += 1;
                } else {
                    const e = (source[src_pos] * 256) + source[src_pos + 1];
                    const len = ((e >> 8) & 0x000F) + entry.type + 1;
                    const addr = ((e << 4) & 0x0FF0) + ((e >> 12) & 0x00FF);

                    for (let g = 0; g < len; g += 1) {
                        target[tgt_pos] = target[tgt_pos - addr - 1];
                        tgt_pos += 1;
                    }
                    src_pos += 1;
                }

                if ((src_pos + 1) >= entry.compressedSize)
                    break;
            }

            src_pos += 1;
        }
        return tgt_buffer;
    }
    if (entry.hasHiddenEntry) {
        const tgt_buffer = new ArrayBuffer(entry.originalSize);
        const source = new Uint8Array(buffer, entry.offset, entry.compressedSize);
        const target = new Uint8Array(tgt_buffer);
        // entries that have hidden entries are marked with 1 at the start,
        // making the file to be faulty
        source[0] = 0;
        target.set(source);
        return tgt_buffer;
    }
    return buffer.slice(entry.offset, entry.offset + entry.compressedSize);
};

const isBlankOrInvalid = (entry: Entry) => {
    return entry.type === 31352 || entry.type === 18688 || entry.offset === 10 ||
    entry.type < 0 || entry.compressedSize === 0 || entry.originalSize > 300000000;
};
