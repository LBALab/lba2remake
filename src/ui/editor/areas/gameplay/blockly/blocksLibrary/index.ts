import {
    lba_behaviour,
    lba_behaviour_init,
    lba_set_behaviour,
    lba_set_behaviour_obj
} from './life/structural';
import {
    lba_if,
    lba_swif,
    lba_oneif,
    lba_switch,
    lba_dummy_operand,
    lba_and,
    lba_or
} from './life/control';
import {
    lba_set_varscene,
    lba_set_vargame,
    lba_set_anim,
    lba_set_anim_obj
} from './life/actions';
import {
    lba_distance,
    lba_collision,
    lba_collision_obj,
    lba_zone,
    lba_zone_obj
} from './life/conditions';
import {
    lba_move_start,
    lba_move_track_start,
    lba_move_track,
    lba_move_stop,
} from './move/structural';
import {
    lba_move_set_anim,
    lba_move_wait_sec,
    lba_move_wait_anim,
    lba_move_goto_point
} from './move/actions';

export default {
    lba_behaviour,
    lba_behaviour_init,
    lba_set_behaviour,
    lba_set_behaviour_obj,
    lba_if,
    lba_swif,
    lba_oneif,
    lba_switch,
    lba_dummy_operand,
    lba_and,
    lba_or,
    lba_distance,
    lba_collision,
    lba_collision_obj,
    lba_zone,
    lba_zone_obj,
    lba_set_varscene,
    lba_set_vargame,
    lba_set_anim,
    lba_set_anim_obj,
    lba_move_start,
    lba_move_track_start,
    lba_move_track,
    lba_move_stop,
    lba_move_set_anim,
    lba_move_wait_sec,
    lba_move_wait_anim,
    lba_move_goto_point
  };
