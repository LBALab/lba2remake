import { LBA2BodyType, LBA1BodyType } from './bodyType';
import { getParams } from '../../params';

const isLBA1 = getParams().game === 'lba1';

const LBA2InventoryColumns = 7;
const LBA2InventoryRows = 5;

const LBA1InventoryColumns = 7;
const LBA1InventoryRows = 4;

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

export enum LBA1Items {
    HOLOMAP = 0,
    MAGIC_BALL = 1,
    FUNFROCK_SABER = 2,
    GAWLEYS_HORN = 3,
    TUNIC = 4,
    BOOK_OF_BU = 5,
    SENDELLS_MEDALLION = 6,
    FLASK_CLEAR_WATER = 7,
    RED_CARD = 8,
    BLUE_CARD = 9,
    ID_CARD = 10,
    MR_MIERS_PASS = 11,
    PROTO_PACK = 12,
    SNOWBOARD = 13,
    MECA_PINGUIN = 14,
    GAS = 15,
    PIRATE_FLAG = 16,
    MAGIC_FLUTE = 17,
    SPACE_GUITAR = 18,
    HAIR_DRYER = 19,
    ANCESTRAL_KEY = 20,
    BOTTLE_SIRUP = 21,
    BOTTLE_SIRUP_EMPTY = 22,
    FERRY_TICKET = 23,
    KEYPAD = 24,
    COFFEE_CAN = 25,
    BONUS_LIST = 26,
    CLOVER_LEAF = 27,
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

const LBA1InventoryMapping = {
    0: LBA1Items.HOLOMAP,
    1: LBA1Items.TUNIC,
    2: LBA1Items.RED_CARD,
    3: LBA1Items.PROTO_PACK,
    4: LBA1Items.PIRATE_FLAG,
    5: LBA1Items.ANCESTRAL_KEY,
    6: LBA1Items.KEYPAD,
    7: LBA1Items.MAGIC_BALL,
    8: LBA1Items.BOOK_OF_BU,
    9: LBA1Items.BLUE_CARD,
    10: LBA1Items.SNOWBOARD,
    11: LBA1Items.MAGIC_FLUTE,
    12: LBA1Items.BOTTLE_SIRUP,
    13: LBA1Items.COFFEE_CAN,
    14: LBA1Items.FUNFROCK_SABER,
    15: LBA1Items.SENDELLS_MEDALLION,
    16: LBA1Items.ID_CARD,
    17: LBA1Items.MECA_PINGUIN,
    18: LBA1Items.SPACE_GUITAR,
    19: LBA1Items.BOTTLE_SIRUP_EMPTY,
    20: LBA1Items.BONUS_LIST,
    21: LBA1Items.GAWLEYS_HORN,
    22: LBA1Items.FLASK_CLEAR_WATER,
    23: LBA1Items.MR_MIERS_PASS,
    24: LBA1Items.GAS,
    25: LBA1Items.HAIR_DRYER,
    26: LBA1Items.FERRY_TICKET,
    27: LBA1Items.CLOVER_LEAF,
};

export const LBA2WeaponToBodyMapping = {
    [LBA2Items.MAGIC_BALL]: LBA2BodyType.TWINSEN_TUNIC,
    [LBA2Items.DARTS]: LBA2BodyType.TWINSEN_TUNIC,
    [LBA2Items.LASER_PISTON_WITH_CRYSTAL]: LBA2BodyType.TWINSEN_LASER_PISTOL,
    [LBA2Items.SWORD]: LBA2BodyType.TWINSEN_SWORD,
    [LBA2Items.WANNIE_GLOVE]: LBA2BodyType.TWINSEN_WANNIE_GLOVE,
    [LBA2Items.BLOWGUN]: LBA2BodyType.TWINSEN_BLOWGUN,
};

export const LBA1WeaponToBodyMapping = {
    [LBA1Items.MAGIC_BALL]: LBA1BodyType.TWINSEN_TUNIC,
    [LBA1Items.FUNFROCK_SABER]: LBA1BodyType.TWINSEN_SWORD,
};

export function GetInventoryMapping() {
    return isLBA1 ? LBA1InventoryMapping : LBA2InventoryMapping;
}

export function GetInventoryRows() {
    return isLBA1 ? LBA1InventoryRows : LBA2InventoryRows;
}

export function GetInventoryColumns() {
    return isLBA1 ? LBA1InventoryColumns : LBA2InventoryColumns;
}

export function GetInventoryItems() {
    return isLBA1 ? LBA1Items : LBA2Items;
}
