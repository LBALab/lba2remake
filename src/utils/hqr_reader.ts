// tslint:disable: no-console

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
        const header = new DataView(buffer, idx_array[i], 10);
        entries.push({
            index: i,
            isBlank: idx_array[i] === 0,
            headerOffset: idx_array[i],
            offset: idx_array[i] + 10,
            originalSize: header.getUint32(0, true),
            compressedSize: header.getUint32(4, true),
            type: header.getInt16(8, true),
            hasHiddenEntry: false,
            nextHiddenEntry: -1
        });
    }

    if (isVoxHQR) {
        entries = entries.concat(entries, getHiddenEntriesIfExist(buffer, idx_array, entries));
    }
    return entries;
};

const getHiddenEntriesIfExist = (buffer: ArrayBuffer, idx_array: Uint32Array,
    entries: Entry[]) => {

    let index = 0;
    let nextHiddenEntryIndex = entries.length;
    const hiddenEntries: Entry[] = [];
    while (true) {
        const result = findFirstNonBlankEntry(entries, index);
        let currentEntry = result[0] as Entry;
        index = result[1] as number;
        if (isLastIndex(index, idx_array.length)) {
            break;
        }
        const nextResult = findFirstNonBlankEntry(entries, index + 1);
        const nextEntry = nextResult[0] as Entry;

        const nextOffsetInIndex = nextEntry ? nextEntry.offset : 0;
        let nextCalculatedOffset = currentEntry.offset + currentEntry.compressedSize;

        /*
        if (currentEntry.index === 285) {
            console.log('CURRENT ENTRY', currentEntry);
            console.log('NEXT ENTRY', nextEntry);
            console.log('NEXT CALC OFFSET', nextCalculatedOffset);
            console.log('NEXT ENTRY FROM OFFSET',
                createEntryFromOffset(buffer, nextCalculatedOffset, nextHiddenEntryIndex));

            return;
        }
        */

        while (nextCalculatedOffset < buffer.byteLength &&
            nextOffsetInIndex !== nextCalculatedOffset) {

            currentEntry.hasHiddenEntry = true;
            currentEntry.nextHiddenEntry = nextHiddenEntryIndex;
            currentEntry = createEntryFromOffset(buffer, nextCalculatedOffset,
                nextHiddenEntryIndex);
            hiddenEntries.push(currentEntry);
            nextHiddenEntryIndex += 1;
            nextCalculatedOffset = currentEntry.offset + currentEntry.compressedSize;
        }
        index += 1;
    }

    return hiddenEntries;
};

const createEntryFromOffset = (buffer: ArrayBuffer, offset: number, ind: number) => {
    const header = new DataView(buffer, offset, 10);
    return {
        index: ind,
        isBlank: offset === 0,
        headerOffset: offset,
        offset: offset + 10,
        originalSize: header.getUint32(0, true),
        compressedSize: header.getUint32(4, true),
        type: header.getInt16(8, true),
        hasHiddenEntry: false,
        nextHiddenEntry: -1
    } as Entry;
};

const isLastIndex = (index: number, size: number) => {
    return index >= size - 1;
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


/*
// TODO - refactor to not be so ugly
const addHiddenEntriesIfExist = (buffer: ArrayBuffer, idx_array: Uint32Array, entries: Entry[]) => {
    let i = 0;
    while (i < idx_array.length) {
        const entry = entries[i];
        let calculatedNextEntryOffset = entry.offset + entry.compressedSize;
        let nextEntryOffset = 0;
        let isLastEntry = i + 1 === idx_array.length;
        if (!isLastEntry) {
            nextEntryOffset = entries[i + 1].headerOffset;
        }

        console.log('ENTRY', entry, isLastEntry);
        console.log('NEXT OFFSET MARKED CALCULATED', nextEntryOffset, calculatedNextEntryOffset);

        if (!isLastEntry && calculatedNextEntryOffset !== nextEntryOffset) {
            entry.hasHiddenEntry = true;
            entry.nextHiddenEntry = entries.length;
        } else {
            i += 1;
        }

        if (i === 285) {
            console.log('LAST GOOD', entry);
            console.log('Next entry offset', nextEntryOffset);
            console.log('entryEndOffset', calculatedNextEntryOffset);
        }

        // while hidden entry found
        while (!isLastEntry && calculatedNextEntryOffset !== nextEntryOffset) {
            const header = new DataView(buffer, calculatedNextEntryOffset, 10);

            const e = {
                headerOffset: calculatedNextEntryOffset,
                offset: calculatedNextEntryOffset + 10,
                originalSize: header.getUint32(0, true),
                compressedSize: header.getUint32(4, true),
                type: header.getInt16(8, true),
                hasHiddenEntry: false,
                nextHiddenEntry: -1
            };
            calculatedNextEntryOffset = e.offset + e.compressedSize;
            isLastEntry = i + 1 === idx_array.length;
            if (!isLastEntry) {
                nextEntryOffset = entries[i + 1].headerOffset;
            }
            if (!isLastEntry && calculatedNextEntryOffset !== nextEntryOffset) {
                e.hasHiddenEntry = true;
                e.nextHiddenEntry = entries.length + 1;
            }
            entries.push(e);
            i += 1;
        }
    }
};
*/

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
