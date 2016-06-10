export function loadLayout(ile) {
    const layout_raw = new Uint8Array(ile.getEntry(0));
    const layout = [];
    let index = 0;
    for (let i = 0; i < 256; ++i) {
        const x = Math.floor(i / 16);
        const y = i % 16;
        if (layout_raw[i]) {
            const id = layout_raw[i];
            layout.push({
                id: id,
                index: index++,
                x: (16 - x) - 8,
                y: y - 8,
                triangles: new Uint32Array(ile.getEntry(id * 6 - 1)),
                textureInfo: new Uint8Array(ile.getEntry(id * 6)),
                heightmap: new Uint16Array(ile.getEntry(id * 6 + 1)),
                intensity: new Uint8Array(ile.getEntry(id * 6 + 2))
            });
        }
    }
    return layout;
}
