export interface Entry {
    index: number;
    isBlank: boolean;
    type: number;
    headerOffset: number;
    offset: number;
    originalSize: number;
    compressedSize: number;
    hasHiddenEntry: boolean;
    nextHiddenEntry?: number;
}

export const readHqrHeader = (buffer: ArrayBuffer, isVoxHQR: boolean) => {
    let entries: Entry[] = [];
    const firstOffset = new Int32Array(buffer, 0, 1);
    const numEntries = (firstOffset[0] / 4) - 1;
    const idx_array = new Uint32Array(buffer, 0, numEntries);

    for (let i = 0; i < idx_array.length; i += 1) {
        const entry = createEntryFromOffset(buffer, idx_array[i], i);
        entries.push(entry);
    }

    if (isVoxHQR) {
        const hiddenEntries = getHiddenEntriesIfExist(buffer, idx_array, entries);
        entries = entries.concat(hiddenEntries);
    }

    return entries;
};

const getHiddenEntriesIfExist = (buffer: ArrayBuffer, idx_array: Uint32Array,
    entries: Entry[]) => {

    let index = 0;
    let nextHiddenEntryIndex = entries.length;
    const hiddenEntries: Entry[] = [];
    while (index < idx_array.length) {
        const result = findFirstNonBlankEntry(entries, index);
        let currentEntry = result[0] as Entry;
        index = result[1] as number;
        if (currentEntry == null) {
            break;
        }

        const nextEntry = findFirstNonBlankEntry(entries, index + 1)[0] as Entry;
        const nextOffsetInIndex = nextEntry ? nextEntry.headerOffset : 0;
        let nextCalculatedOffset = currentEntry.offset + currentEntry.compressedSize;

        // If we need to look for hiden entries
        if (nextOffsetInIndex !== nextCalculatedOffset &&
            nextCalculatedOffset < buffer.byteLength) {

            while (true) {
                currentEntry.hasHiddenEntry = true;
                currentEntry.nextHiddenEntry = nextHiddenEntryIndex;
                currentEntry = createEntryFromOffset(buffer, nextCalculatedOffset,
                    nextHiddenEntryIndex);
                hiddenEntries.push(currentEntry);
                nextHiddenEntryIndex += 1;

                if (isLastHiddenEntryOfGroup(buffer, currentEntry)) {
                    break;
                }
                nextCalculatedOffset = currentEntry.offset + currentEntry.compressedSize;
            }
        }

        index += 1;
    }

    return hiddenEntries;
};

const isLastHiddenEntryOfGroup = (buffer: ArrayBuffer, entry: Entry) => {
    const data = new Uint8Array(buffer, entry.offset, 1);
    return data[0] === 0;
};

const createEntryFromOffset = (buffer: ArrayBuffer, offset: number, ind: number) => {
    if (offset === 0) {
        return {
            index: ind, isBlank: true,
            headerOffset: 0, offset: 0, originalSize: 0, compressedSize: 0, type: -1,
            hasHiddenEntry: false, nextHiddenEntry: -1
        } as Entry;
    }

    const header = new DataView(buffer, offset, 10);
    return {
        index: ind,
        isBlank: false,
        headerOffset: offset,
        offset: offset + 10,
        originalSize: header.getUint32(0, true),
        compressedSize: header.getUint32(4, true),
        type: header.getInt16(8, true),
        hasHiddenEntry: false,
        nextHiddenEntry: -1
    } as Entry;
};

const findFirstNonBlankEntry = (entries: Entry[], index: number) => {
    let i = index;
    while (i < entries.length) {
        if (entries[i].isBlank) {
            i += 1;
        } else {
            return [entries[i], i];
        }
    }
    return [null, i];
};

export const readHqrEntry = (buffer: ArrayBuffer, entry: Entry) => {
    if (entry.isBlank) {
        return new ArrayBuffer(0);
    }
    if (entry.type > 0) {
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
