import { LBA2BodyType, LBA1BodyType } from './bodyType';
import { getParams } from '../../params';

// Note that slots are for the inventory are defined as starting from 0 in the
// top left and increasing to the right row by row.

const isLBA1 = getParams().game === 'lba1';

const LBA2InventoryColumns = 7;
const LBA2InventoryRows = 6;    // Original: 5, but it overloaded some slots.

const LBA1InventoryColumns = 7;
const LBA1InventoryRows = 4;

// This list corresponds with the game vars for each item, which is mostly but not entirely the
// same as the indices used for the item modems and strings.
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
    LASER_PISTOL = 9,
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
    MEMORY_VIEWER = 24,
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

    // Items below this point are "virtual" - they do not have associated game vars.
    GREEN_MAGIC_BALL = 40,
    RED_MAGIC_BALL = 41,
    FIRE_MAGIC_BALL = 42,
    ZLITOS = 43,
    DARK_MONK_KEY = 44,
    TRAVEL_TOKEN = 45,
    BLOWTRON = 46,
    WIZARDS_TUNIC = 47,
    JET_PACK = 48,
    LASER_PISTOL_CRYSTAL_PIECE = 49,
    LASER_PISTOL_BODY = 50,
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
    5: LBA2Items.LASER_PISTOL,
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
    17: LBA2Items.TRANSLATOR,           // Original: also CAR_PART
    18: LBA2Items.MECA_PENGUIN,
    19: LBA2Items.KASHES,
    20: LBA2Items.FRAGMENT_SUPS,
    21: LBA2Items.FERRYMAN_SONG,
    22: LBA2Items.SLICE_OF_TART,
    23: LBA2Items.ISLAND_CX_KEY,        // Original: also GARDEN_BALSAM
    24: LBA2Items.GEM,
    25: LBA2Items.PEARL_OF_INCANDESCENCE,
    26: LBA2Items.PICKAXE,              // Original: also GALLIC_ACID
    27: LBA2Items.FRAGMENT_MOSQUIBEES,
    28: LBA2Items.GAZOGEM,
    29: LBA2Items.DISSIDENTS_RING,
    30: LBA2Items.UMBRELLA,
    31: LBA2Items.MEMORY_VIEWER,
    32: LBA2Items.FERRY_TICKET,
    33: LBA2Items.BURGERMASTER_NOTES,   // Original: also PYRAMID_KEY, BURGERMASTER_KEY
    34: LBA2Items.FRAGMENT_WANNIES,

    // The following items are overloaded onto other item slots in the original but we don't need
    // to keep the same design.
    35: LBA2Items.PYRAMID_KEY,
    36: LBA2Items.GALLIC_ACID,
    37: LBA2Items.GARDEN_BALSAM,
    38: LBA2Items.CAR_PART,
    39: LBA2Items.BURGERMASTER_KEY,
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
    [LBA2Items.GREEN_MAGIC_BALL]: LBA2BodyType.TWINSEN_TUNIC,
    [LBA2Items.RED_MAGIC_BALL]: LBA2BodyType.TWINSEN_TUNIC,
    [LBA2Items.FIRE_MAGIC_BALL]: LBA2BodyType.TWINSEN_TUNIC,
    [LBA2Items.DARTS]: LBA2BodyType.TWINSEN_TUNIC,
    [LBA2Items.LASER_PISTOL]: LBA2BodyType.TWINSEN_LASER_PISTOL,
    [LBA2Items.SWORD]: LBA2BodyType.TWINSEN_SWORD,
    [LBA2Items.WANNIE_GLOVE]: LBA2BodyType.TWINSEN_WANNIE_GLOVE,
    [LBA2Items.BLOWGUN]: LBA2BodyType.TWINSEN_BLOWGUN,
    [LBA2Items.BLOWTRON]: LBA2BodyType.TWINSEN_BLOWTRON,
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

export const LBA1InventorySize = 28;

export const LBA2InventorySize = 40;

export function GetInventorySize() {
    return isLBA1 ? LBA1InventorySize : LBA2InventorySize;
}

function CanUseItemLBA1(_item: LBA1Items) {
    // Not implemented - assume all items are always usable.
    return true;
}

function CanUseItemLBA2(item: LBA2Items) {
    switch (item)
    {
        case LBA2Items.LASER_PISTOL_CRYSTAL_PIECE:
        case LBA2Items.LASER_PISTOL_BODY:
            return false;

        default:
            return true;
    }
}

export function CanUseItem(item: LBA1Items|LBA2Items) {
    return isLBA1 ? CanUseItemLBA1(item as LBA1Items) : CanUseItemLBA2(item as LBA2Items);
}

function MapItemLBA1(item: number, _state: number) {
    // Not implemented.
    return item;
}

function MapItemLBA2(item: number, state: number) {
    switch (item as LBA2Items)
    {
        case LBA2Items.MAGIC_BALL:
            return GetLBA2MagicBallForLevel(state);

        case LBA2Items.TUNIC:
            return (state === 1) ? LBA2Items.WIZARDS_TUNIC : LBA2Items.TUNIC;

        case LBA2Items.PEARL_OF_INCANDESCENCE:
            return (state === 1) ? LBA2Items.TRAVEL_TOKEN : LBA2Items.PEARL_OF_INCANDESCENCE;

        case LBA2Items.KASHES:
            // TODO: how does original LBA2 decide Kashes vs Zlitos here?
            return LBA2Items.ZLITOS;

        case LBA2Items.LASER_PISTOL:
            if (state === 0) {
                return LBA2Items.LASER_PISTOL_CRYSTAL_PIECE;
            }
            if (state === 1) {
                return LBA2Items.LASER_PISTOL_BODY;
            }
            return LBA2Items.LASER_PISTOL;

        case LBA2Items.PROTO_PACK:
            return (state === 1) ? LBA2Items.JET_PACK : LBA2Items.PROTO_PACK;

        case LBA2Items.RING_OF_LIGHTNING:
            return GetLBA2RingOfLightningForLevel(state);

        case LBA2Items.BLOWGUN:
            return (state === 1) ? LBA2Items.BLOWTRON : LBA2Items.BLOWGUN;

        case LBA2Items.FRAGMENT_FRANCOS:
            return (state === 1) ? LBA2Items.DARK_MONK_KEY : LBA2Items.FRAGMENT_FRANCOS;

        default:
            // Most items have no special states.
            return item;
    }
}

export function MapItem(item: number, state: number) {
    return isLBA1 ? MapItemLBA1(item, state) : MapItemLBA2(item, state);
}

export function GetLBA2MagicBallForLevel(level: number) {
    switch (level)
    {
        case 2:
            return LBA2Items.GREEN_MAGIC_BALL;

        case 3:
            return LBA2Items.RED_MAGIC_BALL;

        case 4:
            return LBA2Items.FIRE_MAGIC_BALL;

        case 0:
        case 1:
        default:
            return LBA2Items.MAGIC_BALL;
    }
}

export function GetLBA2RingOfLightningForLevel(level: number) {
    switch (level)
    {
        case 2:
            return LBA2Items.GREEN_RING_OF_LIGHTNING;

        case 3:
            return LBA2Items.RED_RING_OF_LIGHTNING;

        case 4:
            return LBA2Items.FIRE_RING_OF_LIGHTNING;

        case 0:
        case 1:
        default:
            return LBA2Items.RING_OF_LIGHTNING;
    }
}

function GetLBA1ItemResourceIndex(item: LBA1Items) {
    // TODO: check if any mapping is needed.
    return item as number;
}

function GetLBA2ItemResourceIndex(item: LBA2Items) {
    switch (item)
    {
        case LBA2Items.LASER_PISTOL:
            return 50;

        case LBA2Items.MEMORY_VIEWER:
            return 45;

        case LBA2Items.TRAVEL_TOKEN:
            return 24;

        case LBA2Items.LASER_PISTOL_BODY:
            return 9;

        default:
            // Most items require no mapping.
            return item as number;
    }
}

export function GetItemResourceIndex(item: LBA1Items|LBA2Items) {
    return isLBA1
        ? GetLBA1ItemResourceIndex(item as LBA1Items)
        : GetLBA2ItemResourceIndex(item as LBA2Items);
}
