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

export enum LBA2Items {
    HOLOMAP = 0,
    MAGIC_BALL = 1,
    DARTS = 2,
    SENDELLS_BALL = 3,
    TUNIC = 4,
    PEARL_OF_INCANDESCENCE = 5,
    PYRAMID_KEY = 6,
    CAR_PART = 7,
    KASHES = 8,
    LASER_PISTOL_NO_CRYSTAL = 9,
    SWORD = 10,
    WANNIE_GLOVE = 11,
    PROTO_PACK = 12,
    FERRY_TICKET = 13,
    MECA_PENGUIN = 14,
    GAZOGEM = 15,
    DISSIDENTS_RING = 16,
    GALLIC_ACID = 17,
    FERRYMAN_SONG = 18,
    RING_OF_LIGHTNING = 19,
    UMBRELLA = 20,
    GEM = 21,
    HORN = 22,
    BLOWGUN = 23,
    ITINERARY_TOKEN = 24,
    SLICE_OF_TART = 25,
    RADIO = 26,
    GARDEN_BALSAM = 27,
    MAGIC_SLATE = 28,
    TRANSLATOR = 29,
    DIPLOMA = 30,
    FRAGMENT_FRANCOS = 31,
    FRAGMENT_SUPS = 32,
    FRAGMENT_MOSQUIBEES = 33,
    FRAGMENT_WANNIES = 34,
    ISLAND_CX_KEY = 35,
    PICKAXE = 36,
    BURGERMASTER_KEY = 37,
    BURGERMASTER_NOTES = 38,
    PROTECTIVE_SPELL = 39,
    GREEN_MAGIC_BALL = 40,
    RED_MAGIC_BALL = 41,
    FIRE_MAGIC_BALL = 42,
    ZLITOS = 43,
    DARK_MONK_KEY = 44,
    MEMORY_VIEWER = 45,
    BLOWTRON = 46,
    WIZARDS_TUNIC = 47,
    JET_PACK = 48,
    CRYSTAL_PIECE = 49,
    LASER_PISTON_WITH_CRYSTAL = 50,
    GREEN_RING_OF_LIGHTNING = 51,
    RED_RING_OF_LIGHTNING = 52,
    FIRE_RING_OF_LIGHTNING = 53,
}

// LBA2InventoryMapping maps from inventory slot ID to item ID.
const LBA2InventoryMapping = {
    0: LBA2Items.MAGIC_BALL,
    1: LBA2Items.DARTS,
    2: LBA2Items.BLOWGUN,
    3: LBA2Items.HORN,
    4: LBA2Items.WANNIE_GLOVE,
    5: LBA2Items.LASER_PISTON_WITH_CRYSTAL,
    6: LBA2Items.SWORD,
    7: LBA2Items.TUNIC,
    8: LBA2Items.SENDELLS_BALL,
    9: LBA2Items.RING_OF_LIGHTNING,
    10: LBA2Items.PROTECTIVE_SPELL,
    11: LBA2Items.MAGIC_SLATE,
    12: LBA2Items.DIPLOMA,
    13: LBA2Items.FRAGMENT_FRANCOS,
    14: LBA2Items.HOLOMAP,
    15: LBA2Items.PROTO_PACK,
    16: LBA2Items.RADIO,
    17: LBA2Items.TRANSLATOR,
    18: LBA2Items.TRANSLATOR,
    19: LBA2Items.KASHES,
    20: LBA2Items.FRAGMENT_SUPS,
    21: LBA2Items.FERRYMAN_SONG,
    22: LBA2Items.SLICE_OF_TART,
    23: LBA2Items.ISLAND_CX_KEY,
    24: LBA2Items.GEM,
    25: LBA2Items.PEARL_OF_INCANDESCENCE,
    26: LBA2Items.PICKAXE,
    27: LBA2Items.FRAGMENT_MOSQUIBEES,
    28: LBA2Items.GAZOGEM,
    29: LBA2Items.DISSIDENTS_RING,
    30: LBA2Items.UMBRELLA,
    31: LBA2Items.MEMORY_VIEWER,
    32: LBA2Items.FERRY_TICKET,
    33: LBA2Items.BURGERMASTER_NOTES,
    34: LBA2Items.FRAGMENT_WANNIES,
};

export const LBA2WeaponToBodyMapping = {
    [LBA2Items.MAGIC_BALL]: BodyType.TWINSEN_TUNIC,
    [LBA2Items.DARTS]: BodyType.TWINSEN_TUNIC,
    [LBA2Items.LASER_PISTON_WITH_CRYSTAL]: BodyType.TWINSEN_LASER_PISTOL,
    [LBA2Items.SWORD]: BodyType.TWINSEN_SWORD,
    [LBA2Items.WANNIE_GLOVE]: BodyType.TWINSEN_WANNIE_GLOVE,
    [LBA2Items.BLOWGUN]: BodyType.TWINSEN_BLOWGUN,
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

export function GetInventoryItems() {
    // TODO: Dynamically swap to use LBA once we have functionality for that.
    return LBA2Items;
}
