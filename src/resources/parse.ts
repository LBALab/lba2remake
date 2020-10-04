import { Resource } from './load';
import { parsePalette } from './parsers/palette';
import { parseText } from './parsers/text';

const NOP = (resource: Resource) => {
    return resource;
};

const ResourceTypes = {
    LUN: { type: 'LUN', description: 'LBA Unknown File', parser: NOP },
    PNG: { type: 'PNG', description: 'Portable Network Graphics', parser: NOP },
    GIF: { type: 'GIF', description: 'LBA1 GIF Image', parser: NOP },
    LIM: { type: 'LIM', description: 'LBA Image', parser: NOP },
    ANM: { type: 'ANM', description: 'LBA Animation', parser: NOP },
    LM1: { type: 'LM1', description: 'LBA1 3D Model', parser: NOP },
    LM2: { type: 'LM2', description: 'LBA2 3D Model', parser: NOP },
    M4A: { type: 'M4A', description: 'MPEG 4 Audio', parser: NOP },
    LS1: { type: 'LS1', description: 'LBA1 Scene', parser: NOP },
    LS2: { type: 'LS2', description: 'LBA2 Scene', parser: NOP },
    LSP: { type: 'LSP', description: 'LBA Sprite', parser: NOP },
    LSR: { type: 'LSR', description: 'LBA2 Sprite Raw', parser: NOP },
    LBT: { type: 'LBT', description: 'LBA Text Dialog', parser: parseText },
    BL1: { type: 'BL1', description: 'LBA1 Brick Layout', parser: NOP },
    BL2: { type: 'BL2', description: 'LBA2 Brick Layout', parser: NOP },
    BRK: { type: 'BRK', description: 'LBA Brick Sprite', parser: NOP },
    GR1: { type: 'GR1', description: 'LBA1 Grids', parser: NOP },
    GR2: { type: 'GR2', description: 'LBA2 Grids', parser: NOP },
    '3DE': { type: '3DE', description: 'LBA1 File 3D Entity', parser: NOP },
    F3D: { type: 'F3D', description: 'LBA2 Entity Information', parser: NOP },
    PAL: { type: 'PAL', description: 'LBA Palette', parser: parsePalette },
    OBL: { type: 'OBL', description: 'LBA2 Island Object HQR File', parser: NOP },
    HQR: { type: 'HQR', description: 'LBA High Quality Resource', parser: NOP },
    ILE: { type: 'ILE', description: 'LBA2 Island HQR File', parser: NOP },
};

export { ResourceTypes };
