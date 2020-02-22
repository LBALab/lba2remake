import { find, each } from 'lodash';

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

export function buildMirrors(mirrorGroups) {
    const mirrors = new Map<string, number[][]>();
    each(mirrorGroups, (groups) => {
        each(groups, (g: any) => {
            for (let x = g.min.x; x <= g.max.x; x += 1) {
                for (let y = g.min.y; y <= g.max.y; y += 1) {
                    for (let z = g.min.z; z <= g.max.z; z += 1) {
                        if (x === g.min.x || y === g.min.y || z === g.min.z) {
                            const sides = [];
                            if (x === g.min.x) {
                                sides[0] = [g.max.x, y, z];
                            }
                            if (y === g.min.y) {
                                sides[1] = [x, g.max.y, z];
                            }
                            if (z === g.min.z) {
                                sides[2] = [x, y, g.max.z];
                            }
                            mirrors[`${x},${y},${z}`] = sides;
                        }
                    }
                }
            }
        });
    });
    return mirrors;
}
