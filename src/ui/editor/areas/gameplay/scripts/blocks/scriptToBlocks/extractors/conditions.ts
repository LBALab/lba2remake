import { GENERIC_CONDITION, newBlock } from './utils';

export const COL = GENERIC_CONDITION.bind(null, 'lba_collision', false);
export const COL_OBJ = GENERIC_CONDITION.bind(null, 'lba_collision_obj', true);
export const DISTANCE = GENERIC_CONDITION.bind(null, 'lba_distance', true);
export const DISTANCE_3D = GENERIC_CONDITION.bind(null, 'lba_distance_3D', true);
export const DISTANCE_MESSAGE = GENERIC_CONDITION.bind(null, 'lba_distance_msg', true);
export const ZONE = GENERIC_CONDITION.bind(null, 'lba_zone', false);
export const ZONE_OBJ = GENERIC_CONDITION.bind(null, 'lba_zone_obj', true);
export const BODY = GENERIC_CONDITION.bind(null, 'lba_body', false);
export const BODY_OBJ = GENERIC_CONDITION.bind(null, 'lba_body_obj', true);
export const ANIM = GENERIC_CONDITION.bind(null, 'lba_anim', false);
export const ANIM_OBJ = GENERIC_CONDITION.bind(null, 'lba_anim_obj', true);
export const CURRENT_TRACK = GENERIC_CONDITION.bind(null, 'lba_cur_track', false);
export const CURRENT_TRACK_OBJ = GENERIC_CONDITION.bind(null, 'lba_cur_track_obj', true);
export const VAR_GAME = VAR_CONDITION.bind(null, 'game');
export const VAR_CUBE = VAR_CONDITION.bind(null, 'scene');
export const CONE_VIEW = GENERIC_CONDITION.bind(null, 'lba_cone_view', false);
export const HIT_BY = GENERIC_CONDITION.bind(null, 'lba_hit_by', false);
export const HIT_OBJ_BY = GENERIC_CONDITION.bind(null, 'lba_hit_by_obj', true);
export const ACTION = GENERIC_CONDITION.bind(null, 'lba_action', false);
export const LIFE_POINT = GENERIC_CONDITION.bind(null, 'lba_life_points', false);
export const LIFE_POINT_OBJ = GENERIC_CONDITION.bind(null, 'lba_life_points_obj', true);
export const MAGIC_POINTS = GENERIC_CONDITION.bind(null, 'lba_magic_points', false);
export const KEYS = GENERIC_CONDITION.bind(null, 'lba_keys', false);
export const MONEY = GENERIC_CONDITION.bind(null, 'lba_money', false);
export const HERO_BEHAVIOUR = GENERIC_CONDITION.bind(null, 'lba_hero_behaviour', false);
export const CHAPTER = GENERIC_CONDITION.bind(null, 'lba_chapter', false);
export const MAGIC_LEVEL = GENERIC_CONDITION.bind(null, 'lba_magic_level', false);
export const USING_INVENTORY = GENERIC_CONDITION.bind(null, 'lba_using_inventory', true);
export const CHOICE = GENERIC_CONDITION.bind(null, 'lba_choice', false);
export const FUEL = GENERIC_CONDITION.bind(null, 'lba_fuel', false);
export const CARRIED_BY = GENERIC_CONDITION.bind(null, 'lba_carried_by', false);
export const CDROM = GENERIC_CONDITION.bind(null, 'lba_cdrom', false);
export const LADDER = GENERIC_CONDITION.bind(null, 'lba_ladder', false);
export const RND = GENERIC_CONDITION.bind(null, 'lba_random', true);
export const RAIL = GENERIC_CONDITION.bind(null, 'lba_rail', true);
export const ANGLE = GENERIC_CONDITION.bind(null, 'lba_angle', false);
export const ANGLE_OBJ = GENERIC_CONDITION.bind(null, 'lba_angle_obj', true);
export const REAL_ANGLE = GENERIC_CONDITION.bind(null, 'lba_real_angle', false);
export const BETA = GENERIC_CONDITION.bind(null, 'lba_orientation', false);
export const BETA_OBJ = GENERIC_CONDITION.bind(null, 'lba_orientation_obj', true);
export const CARRIED_BY_OBJ = GENERIC_CONDITION.bind(null, 'lba_carried_by_obj', true);
export const DEMO = GENERIC_CONDITION.bind(null, 'lba_is_demo', false);
export const COL_DECORS = GENERIC_CONDITION.bind(null, 'lba_col_decors', false);
export const COL_DECORS_OBJ = GENERIC_CONDITION.bind(null, 'lba_col_decors_obj', true);
export const PROCESSOR = GENERIC_CONDITION.bind(null, 'lba_processor', false);
export const OBJECT_DISPLAYED = GENERIC_CONDITION.bind(null, 'lba_object_displayed', false);

function VAR_CONDITION(scope, workspace, cmd, { connection }) {
    const block = newBlock(workspace, 'lba_var_value', cmd);
    const cond = cmd.data.condition;
    if (scope === 'game' && cond.param.value < 40) {
        scope = 'inventory';
    }
    block.setFieldValue(scope, 'scope');
    block.setFieldValue(cond.param.value, 'param');
    connection.connect(block.outputConnection);
    return block;
}
