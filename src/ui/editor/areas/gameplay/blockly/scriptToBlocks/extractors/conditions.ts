import {
    GENERIC_CONDITION,
    GENERIC_CONDITION_OBJ,
    UNKNOWN_CONDITION
} from './utils';

export const COL = GENERIC_CONDITION.bind(null, 'lba_collision');
export const COL_OBJ = GENERIC_CONDITION_OBJ.bind(null, 'lba_collision_obj');
export const DISTANCE = GENERIC_CONDITION.bind(null, 'lba_distance');
export const ZONE = GENERIC_CONDITION.bind(null, 'lba_zone');
export const ZONE_OBJ = GENERIC_CONDITION_OBJ.bind(null, 'lba_zone_obj');
export const BODY = GENERIC_CONDITION.bind(null, 'lba_body');
export const BODY_OBJ = GENERIC_CONDITION_OBJ.bind(null, 'lba_body_obj');
export const ANIM = GENERIC_CONDITION.bind(null, 'lba_anim');
export const ANIM_OBJ = GENERIC_CONDITION_OBJ.bind(null, 'lba_anim_obj');

export const CURRENT_TRACK = UNKNOWN_CONDITION.bind(null, 'track');
export const CURRENT_TRACK_OBJ = UNKNOWN_CONDITION.bind(null, '<actor> track');
export const VAR_GAME = UNKNOWN_CONDITION.bind(null, 'var game');
export const VAR_CUBE = UNKNOWN_CONDITION.bind(null, 'var scene');
export const CONE_VIEW = UNKNOWN_CONDITION.bind(null, 'cone view');
export const HIT_BY = UNKNOWN_CONDITION.bind(null, 'hit by');
export const ACTION = UNKNOWN_CONDITION.bind(null, 'action');
export const LIFE_POINT = UNKNOWN_CONDITION.bind(null, 'life points');
export const LIFE_POINT_OBJ = UNKNOWN_CONDITION.bind(null, '<actor> life points');
export const KEYS = UNKNOWN_CONDITION.bind(null, 'keys');
export const MONEY = UNKNOWN_CONDITION.bind(null, 'money');
export const BEHAVIOUR = UNKNOWN_CONDITION.bind(null, 'hero behaviour');
export const CHAPTER = UNKNOWN_CONDITION.bind(null, 'chapter');
export const DISTANCE_3D = UNKNOWN_CONDITION.bind(null, 'distance 3D');
export const MAGIC_LEVEL = UNKNOWN_CONDITION.bind(null, 'magic level');
export const MAGIC_POINTS = UNKNOWN_CONDITION.bind(null, 'magic points');
export const USING_INVENTORY = UNKNOWN_CONDITION.bind(null, 'using inventory');
export const CHOICE = UNKNOWN_CONDITION.bind(null, 'choice');
export const FUEL = UNKNOWN_CONDITION.bind(null, 'fuel');
export const CARRIED_BY = UNKNOWN_CONDITION.bind(null, 'carried by');
export const CDROM = UNKNOWN_CONDITION.bind(null, 'cdrom');
export const LADDER = UNKNOWN_CONDITION.bind(null, 'ladder');
export const RND = UNKNOWN_CONDITION.bind(null, 'random');
export const RAIL = UNKNOWN_CONDITION.bind(null, 'rail');
export const BETA = UNKNOWN_CONDITION.bind(null, 'beta');
export const BETA_OBJ = UNKNOWN_CONDITION.bind(null, '<actor> beta');
export const CARRIED_OBJ_BY = UNKNOWN_CONDITION.bind(null, 'carried <actor> by');
export const ANGLE = UNKNOWN_CONDITION.bind(null, 'angle');
export const DISTANCE_MESSAGE = DISTANCE;
export const HIT_OBJ_BY = UNKNOWN_CONDITION.bind(null, '<actor> hit by');
export const REAL_ANGLE = UNKNOWN_CONDITION.bind(null, 'real angle');
export const DEMO = UNKNOWN_CONDITION.bind(null, 'is demo');
export const COL_DECORS = UNKNOWN_CONDITION.bind(null, 'collision with decors');
export const COL_DECORS_OBJ = UNKNOWN_CONDITION.bind(null, '<actor> collision with decors');
export const PROCESSOR = UNKNOWN_CONDITION.bind(null, 'processor');
export const OBJECT_DISPLAYED = UNKNOWN_CONDITION.bind(null, 'object displayed');
export const ANGLE_OBJ = UNKNOWN_CONDITION.bind(null, '<actor> angle');
