import { BodyType } from './bodyType';

// Note that slots are for the inventory are defined as starting from 0 in the
// top left and increasing to the right row by row.

/*
const LBAInventoryColumns = 7;
const LBAInventoryRows = 4;

// LBAInventoryMapping maps from inventory slot ID to item ID.
const LBAInventoryMapping = {
    // TODO
};
*/

const LBA2InventoryColumns = 7;
const LBA2InventoryRows = 5;

// LBA2InventoryMapping maps from inventory slot ID to item ID.
const LBA2InventoryMapping = {
    0: 1,   // Magic ball
    1: 2,   // Darts
    2: 23,  // Blowgun
    3: 22,  // Horn
    4: 11,  // Wanny glove
    5: 9,   // Laser pistol
    6: 10,  // Sword
    7: 4,   // Tunic
    8: 3,   // Sendell's ball
    9: 19,  // Lightning spell
    10: 39, // Protection spell
    11: 28, // Magic slate
    12: 30, // Wizards diploma
    13: 31, // DMKEY_KNARTA
    14: 0,  // Holomap
    15: 12, // Protopack
    16: 26, // Radio
    17: 29, // Translator
    18: 14, // Meca penguin
    19: 8,  // Money
    20: 32, // DMKEY_SUP
    21: 18, // Ferry man song
    22: 25, // Firefly tart
    23: 35, // Key to island CX
    24: 21, // Gems
    25: 5,  // Pearl of incandescence
    26: 36, // Pickaxe
    27: 33, // DMKEY_MOSQUI
    28: 15, // Gazogem
    29: 16, // Medallion
    30: 20, // Umbrella
    31: 24, // Red Viewer
    32: 13, // Ferry ticket
    33: 38, // Franco note
    34: 34, // DMKEY_BLAFARD
};

export const LBA2WeaponToBodyMapping = {
    1: BodyType.TWINSEN_TUNIC, // Magic ball
    2: BodyType.TWINSEN_TUNIC, // Darts
    9: BodyType.TWINSEN_LASER_PISTOL,
    10: BodyType.TWINSEN_SWORD,
    11: BodyType.TWINSEN_WANNIE_GLOVE,
    23: BodyType.TWINSEN_BLOWGUN,
};

// GetInventoryMapping returns the game inventory mapping (slot ID to item ID)
// for either LBA or LBA2.
export function GetInventoryMapping() {
    // TODO: Dynamically swap to use LBA once we have functionality for that.
    return LBA2InventoryMapping;
}

export function GetInventoryRows() {
    // TODO: Dynamically swap to use LBA once we have functionality for that.
    return LBA2InventoryRows;
}

export function GetInventoryColumns() {
    // TODO: Dynamically swap to use LBA once we have functionality for that.
    return LBA2InventoryColumns;
}
