import { getParams } from '../../../../params';

const LBA2 = {
    42: {island: 'CITABAU', section: 6, variant: 0},
    43: {island: 'CITABAU', section: 5, variant: 0},
    197: {island: 'CITABAU', section: 5, variant: 1},
    44: {island: 'CITABAU', section: 3, variant: 0},
    45: {island: 'CITABAU', section: 0, variant: 0},
    46: {island: 'CITABAU', section: 7, variant: 0},
    196: {island: 'CITABAU', section: 7, variant: 1},
    47: {island: 'CITABAU', section: 1, variant: 0},
    48: {island: 'CITABAU', section: 4, variant: 0},
    49: {island: 'CITABAU', section: 8, variant: 0},
    195: {island: 'CITABAU', section: 8, variant: 1},
    50: {island: 'CITABAU', section: 2, variant: 0},

    55: {island: 'DESERT', section: 3, variant: 0},
    203: {island: 'DESERT', section: 3, variant: 1},
    56: {island: 'DESERT', section: 7, variant: 0},
    57: {island: 'DESERT', section: 11, variant: 0},
    58: {island: 'DESERT', section: 15, variant: 0},
    59: {island: 'DESERT', section: 0, variant: 0},
    198: {island: 'DESERT', section: 0, variant: 1},
    60: {island: 'DESERT', section: 4, variant: 0},
    200: {island: 'DESERT', section: 4, variant: 1},
    61: {island: 'DESERT', section: 8, variant: 0},
    201: {island: 'DESERT', section: 8, variant: 1},
    62: {island: 'DESERT', section: 12, variant: 0},
    63: {island: 'DESERT', section: 16, variant: 0},
    64: {island: 'DESERT', section: 1, variant: 0},
    65: {island: 'DESERT', section: 5, variant: 0},
    199: {island: 'DESERT', section: 5, variant: 1},
    66: {island: 'DESERT', section: 9, variant: 0},
    67: {island: 'DESERT', section: 13, variant: 0},
    206: {island: 'DESERT', section: 13, variant: 1},
    68: {island: 'DESERT', section: 17, variant: 0},
    69: {island: 'DESERT', section: 2, variant: 0},
    70: {island: 'DESERT', section: 6, variant: 0},
    71: {island: 'DESERT', section: 10, variant: 0},
    72: {island: 'DESERT', section: 14, variant: 0},
    204: {island: 'DESERT', section: 14, variant: 1},
    73: {island: 'DESERT', section: 18, variant: 0},

    74: {island: 'EMERAUDE', section: 0, variant: 0},
    75: {island: 'EMERAUDE', section: 2, variant: 0},
    208: {island: 'EMERAUDE', section: 2, variant: 1},
    76: {island: 'EMERAUDE', section: 1, variant: 0},
    77: {island: 'EMERAUDE', section: 3, variant: 0},

    87: {island: 'OTRINGAL', section: 2, variant: 0},
    209: {island: 'OTRINGAL', section: 2, variant: 2},
    88: {island: 'OTRINGAL', section: 0, variant: 0},
    89: {island: 'OTRINGAL', section: 3, variant: 0},
    211: {island: 'OTRINGAL', section: 3, variant: 2},
    90: {island: 'OTRINGAL', section: 5, variant: 0},
    91: {island: 'OTRINGAL', section: 1, variant: 0},
    92: {island: 'OTRINGAL', section: 6, variant: 0},
    205: {island: 'OTRINGAL', section: 6, variant: 1},
    94: {island: 'OTRINGAL', section: 4, variant: 0},
    138: {island: 'OTRINGAL', section: 4, variant: 1},

    95: {island: 'CELEBRAT', section: 0, variant: 0},

    96: {island: 'PLATFORM', section: 0, variant: 0},
    97: {island: 'PLATFORM', section: 2, variant: 0},
    98: {island: 'PLATFORM', section: 1, variant: 0},
    213: {island: 'PLATFORM', section: 1, variant: 1},
    99: {island: 'PLATFORM', section: 3, variant: 0},

    102: {island: 'MOSQUIBE', section: 0, variant: 0},
    103: {island: 'MOSQUIBE', section: 1, variant: 0},
    105: {island: 'MOSQUIBE', section: 2, variant: 0},
    216: {island: 'MOSQUIBE', section: 2, variant: 1},

    107: {island: 'KNARTAS', section: 0, variant: 0},
    108: {island: 'KNARTAS', section: 1, variant: 0},
    109: {island: 'KNARTAS', section: 2, variant: 0},
    212: {island: 'KNARTAS', section: 2, variant: 1},

    110: {island: 'ILOTCX', section: 0, variant: 0},

    120: {island: 'ASCENCE', section: 0, variant: 0},

    130: {island: 'SOUSCELB', section: 0, variant: 0},
    131: {island: 'SOUSCELB', section: 1, variant: 0},
    219: {island: 'SOUSCELB', section: 1, variant: 1},
    132: {island: 'SOUSCELB', section: 2, variant: 0}
};

const LBA1 = {
    1: {island: 'CITADEL', section: 0, variant: 0, x:  0, y: 0.11722, z: 0},
    2: {island: 'CITADEL', section: 2, variant: 0, x:  0, y: 0, z: 2},
    3: {island: 'CITADEL', section: 1, variant: 0, x:  0, y: 0, z: 1},
    4: {island: 'CITADEL', section: 3, variant: 0, x:  0, y: 0, z: 3},
    6: {island: 'CITADEL', section: 4, variant: 0, x: -1, y: 0, z: 1.844},
};

const { game } = getParams();

export default game === 'lba1' ? LBA1 : LBA2;
