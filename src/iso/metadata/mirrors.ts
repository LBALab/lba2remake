import { find } from 'lodash';

export function processLayoutMirror(cellInfo, mirrorGroups) {
    const { layout, pos: {x, y, z} } = cellInfo;
    let groups = mirrorGroups[layout.index];
    if (!groups) {
        groups = [];
        mirrorGroups[layout.index] = groups;
    }
    const fg = find(groups, (g) => {
        for (let dz = -1; dz <= 0; dz += 1) {
            for (let dx = -1; dx <= 0; dx += 1) {
                for (let dy = -1; dy <= 0; dy += 1) {
                    if (!(dz === 0 && dx === 0 && dy === 0)) {
                        const key = `${x + dx},${y + dy},${z + dz}`;
                        if (g.cells.has(key)) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    });
    if (fg) {
        fg.cells.add(`${x},${y},${z}`);
        fg.max.x = Math.max(fg.max.x, x);
        fg.max.y = Math.max(fg.max.y, y);
        fg.max.z = Math.max(fg.max.z, z);
    } else {
        const cells = new Set();
        cells.add(`${x},${y},${z}`);
        groups.push({
            cells,
            min: {x, y, z},
            max: {x, y, z}
        });
    }
}
