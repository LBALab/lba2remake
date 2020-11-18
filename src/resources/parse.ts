import { Resource } from './load';

import { parsePalette } from './parsers/palette';
import { parseTextLBA1 } from './parsers/text1';
import { parseTextLBA2 } from './parsers/text2';
import { parseEntityLBA1 } from './parsers/entity1';
import { parseEntity } from './parsers/entity2';
import { parseModelLBA1 } from './parsers/body1';
import { parseModelLBA2 } from './parsers/body2';
import { parseSceneMapLBA1, parseSceneLBA1 } from './parsers/scene1';
import { parseSceneMapLBA2, parseSceneLBA2 } from './parsers/scene2';
import { parseSpriteClipInfo, parseSprite, parseSpriteRaw } from './parsers/sprite';
import { parseBrick } from './parsers/bricks';
import { parseLibrary } from './parsers/libraries';
import { parseGridLBA1 } from './parsers/grids1';
import { parseGridLBA2 } from './parsers/grids2';
import { parseAnim } from './parsers/anim';
import { parseTextureRGBA } from './parsers/texture';
import { parseAudio } from './parsers/audio';

const NOP = (resource: Resource) => {
    return resource;
};

const ResourceTypes = {
    LUN: { type: 'LUN', description: 'LBA Unknown File', parser: NOP },
    PNG: { type: 'PNG', description: 'Portable Network Graphics', parser: NOP },
    GIF: { type: 'GIF', description: 'LBA1 GIF Image', parser: NOP },
    LIM: { type: 'LIM', description: 'LBA Image', parser: NOP },
    LA1: { type: 'LA1', description: 'LBA Animation', parser: parseAnim },
    LA2: { type: 'LA2', description: 'LBA Animation', parser: parseAnim },
    LM1: { type: 'LM1', description: 'LBA1 3D Model', parser: parseModelLBA1 },
    LM2: { type: 'LM2', description: 'LBA2 3D Model', parser: parseModelLBA2 },
    TXR: { type: 'TXR', description: 'Texture RGBA', parser: parseTextureRGBA },
    M4A: { type: 'M4A', description: 'MPEG 4 Audio', parser: parseAudio },
    LS1: { type: 'LS1', description: 'LBA1 Scene', parser: parseSceneLBA1 },
    LS2: { type: 'LS2', description: 'LBA2 Scene', parser: parseSceneLBA2 },
    SM1: { type: 'SM1', description: 'LBA1 Scene Map', parser: parseSceneMapLBA1 },
    SM2: { type: 'SM2', description: 'LBA2 Scene Map', parser: parseSceneMapLBA2 },
    LSP: { type: 'LSP', description: 'LBA Sprite', parser: parseSprite },
    LSR: { type: 'LSR', description: 'LBA2 Sprite Raw', parser: parseSpriteRaw },
    SAD: { type: 'SAD', description: 'Sprites Clip Info', parser: parseSpriteClipInfo },
    LT1: { type: 'LT1', description: 'LBA1 Text Dialog', parser: parseTextLBA1 },
    LT2: { type: 'LT2', description: 'LBA2 Text Dialog', parser: parseTextLBA2 },
    BL1: { type: 'BL1', description: 'LBA1 Layout Library', parser: parseLibrary },
    BL2: { type: 'BL2', description: 'LBA2 Layout Library', parser: parseLibrary },
    BRK: { type: 'BRK', description: 'LBA Brick Sprite', parser: parseBrick },
    GR1: { type: 'GR1', description: 'LBA1 Grids', parser: parseGridLBA1 },
    GR2: { type: 'GR2', description: 'LBA2 Grids', parser: parseGridLBA2 },
    '3DE': { type: '3DE', description: 'LBA1 File 3D Entity', parser: parseEntityLBA1 },
    F3D: { type: 'F3D', description: 'LBA2 Entity Information', parser: parseEntity },
    PAL: { type: 'PAL', description: 'LBA Palette', parser: parsePalette },
    OBL: { type: 'OBL', description: 'LBA2 Island Object HQR File', parser: NOP },
    HQR: { type: 'HQR', description: 'LBA High Quality Resource', parser: NOP },
    ILE: { type: 'ILE', description: 'LBA2 Island HQR File', parser: NOP },
};

export { ResourceTypes };
