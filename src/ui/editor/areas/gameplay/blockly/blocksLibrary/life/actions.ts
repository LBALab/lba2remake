import Blockly from 'blockly';
import {
    makeIcon,
    setterBlock,
    FieldActor,
    FieldDropdownLBA,
    FieldUint8,
    FieldScope,
} from '../utils';

function action(setupInput) {
    return {
        init() {
            const input = this.appendDummyInput();
            this.setColour('#444444');
            this.setPreviousStatement(true, 'LIFE');
            this.setNextStatement(true, 'LIFE');
            this.scriptType = 'life';
            setupInput(this, (field, name) => input.appendField(field, name));
        }
    };
}

export const lba_set_anim = setterBlock({scriptType: 'LIFE', type: 'anim'});
export const lba_set_anim_obj = setterBlock({scriptType: 'LIFE', type: 'anim', objMode: true});
export const lba_set_body = setterBlock({scriptType: 'LIFE', type: 'body'});
export const lba_set_body_obj = setterBlock({scriptType: 'LIFE', type: 'body', objMode: true});

export const lba_no_body = action((_block, field) => {
    field('remove body');
    field(makeIcon('body.svg'));
});

/*
** Messages
*/
export const lba_message = action((_block, field) => {
    field('display message');
    field(makeIcon('message.svg'));
    field(new FieldDropdownLBA('text'), 'arg_0');
});

export const lba_message_obj = action((_block, field) => {
    field('display message');
    field(makeIcon('message.svg'));
    field(new FieldDropdownLBA('text'), 'arg_0');
    field('as');
    field(makeIcon('actor.svg'));
    field(new FieldActor(), 'actor');
});

export const lba_message_zoe = action((_block, field) => {
    field('display message with zoe avatar');
    field(makeIcon('message.svg'));
    field(new FieldDropdownLBA('text'), 'arg_0');
});

export const lba_add_message = action((_block, field) => {
    field('add message to display list');
    field(makeIcon('message.svg'));
    field(new FieldDropdownLBA('text'), 'arg_0');
});

export const lba_end_message = action((_block, field) => {
    field(makeIcon('message.svg'));
    field('display messages in list');
});

export const lba_add_choice = action((_block, field) => {
    field('add choice option');
    field(makeIcon('options.svg'));
    field(new FieldDropdownLBA('text'), 'arg_0');
});

export const lba_ask_choice = action((_block, field) => {
    field(makeIcon('options.svg'));
    field('display choice');
    field(makeIcon('message.svg'));
    field(new FieldDropdownLBA('text'), 'arg_0');
});

export const lba_ask_choice_obj = action((_block, field) => {
    field(makeIcon('options.svg'));
    field('display choice');
    field(makeIcon('message.svg'));
    field(new FieldDropdownLBA('text'), 'arg_0');
    field('as');
    field(makeIcon('actor.svg'));
    field(new FieldActor(), 'actor');
});

/*
** Variables
*/
export const lba_set_varscene = action((_block, field) => {
    field('set');
    field(new FieldScope('scene'));
    field(new FieldDropdownLBA('varscene'), 'arg_0');
    field('to');
    field(new Blockly.FieldNumber(0, 0, 255, 0, Math.round), 'arg_1');
});

export const lba_set_vargame = action((_block, field) => {
    field('set');
    field(new FieldScope('game'));
    field(new FieldDropdownLBA('vargame'), 'arg_0');
    field('to');
    field(new Blockly.FieldNumber(0, 0, 255, 0, Math.round), 'arg_1');
});

export const lba_add_vargame = action((_block, field) => {
    field('add');
    field(new Blockly.FieldNumber(), 'arg_1');
    field('to');
    field(new FieldScope('game'));
    field(new FieldDropdownLBA('vargame'), 'arg_0');
});

export const lba_sub_vargame = action((_block, field) => {
    field('subtract');
    field(new Blockly.FieldNumber(), 'arg_1');
    field('to');
    field(new FieldScope('game'));
    field(new FieldDropdownLBA('vargame'), 'arg_0');
});

export const lba_add_varscene = action((_block, field) => {
    field('add');
    field(new Blockly.FieldNumber(), 'arg_1');
    field('to');
    field(new FieldScope('scene'));
    field(new FieldDropdownLBA('varscene'), 'arg_0');
});

export const lba_sub_varscene = action((_block, field) => {
    field('subtract');
    field(new Blockly.FieldNumber(), 'arg_1');
    field('to');
    field(new FieldScope('scene'));
    field(new FieldDropdownLBA('varscene'), 'arg_0');
});

/*
** Hero
*/
export const lba_set_hero_behaviour = action((_block, field) => {
    field('set hero behaviour to');
    field(new FieldDropdownLBA('hero_behaviour'), 'arg_0');
});

export const lba_set_dirmode = action((_block, field) => {
    field('set movement mode to');
    field(new FieldDropdownLBA('dirmode'), 'arg_0');
});

export const lba_set_dirmode_obj = action((_block, field) => {
    field('set');
    field(makeIcon('actor.svg'));
    field(new FieldActor(), 'actor');
    field("'s movement mode to");
    field(new FieldDropdownLBA('dirmode'), 'arg_0');
});

export const lba_save_hero = action((_block, field) => {
    field('save hero');
});

export const lba_restore_hero = action((_block, field) => {
    field('restore hero');
});

export const lba_set_magic_level = action((_block, field) => {
    field('set magic level');
    field(new FieldUint8());
});

/*
** Camera
*/
export const lba_cinema_mode = action((_block, field) => {
    field('set cinema mode');
    field(new Blockly.FieldNumber(), 'arg_0');
});

export const lba_set_camera = action((_block, field) => {
    field('set camera');
    field(new Blockly.FieldNumber(), 'arg_0');
});

export const lba_camera_center = action((_block, field) => {
    field('center camera');
    field(new Blockly.FieldNumber(), 'arg_0');
});

export const lba_cam_follow = action((_block, field) => {
    field('make camera follow');
    field(makeIcon('actor.svg'));
    field(new FieldActor(), 'arg_0');
});

/*
** Pos & orientation
*/
export const lba_set_position = action((_block, field) => {
    field('set position to');
    field(makeIcon('point.svg'));
    field(new FieldDropdownLBA('point'), 'arg_0');
});

export const lba_set_orientation = action((_block, field) => {
    field('set orientation to');
    field(new Blockly.FieldAngle(), 'arg_0');
});

export const lba_set_inverse_orientation = action((_block, field) => {
    field('set inverse orientation to');
    field(new Blockly.FieldAngle(), 'arg_0');
});

/*
** Doors
*/
export const lba_set_door_left = action((_block, field) => {
    field('set door left');
    field(new Blockly.FieldNumber(), 'arg_0');
});

export const lba_set_door_right = action((_block, field) => {
    field('set door right');
    field(new Blockly.FieldNumber(), 'arg_0');
});

export const lba_set_door_up = action((_block, field) => {
    field('set door up');
    field(new Blockly.FieldNumber(), 'arg_0');
});

export const lba_set_door_down = action((_block, field) => {
    field('set door down');
    field(new Blockly.FieldNumber(), 'arg_0');
});

/*
** Life points
*/
export const lba_set_life_point_obj = action((_block, field) => {
    field('set');
    field(makeIcon('actor.svg'));
    field(new FieldActor(), 'actor');
    field("'s life points to");
    field(new Blockly.FieldNumber(), 'arg_0');
});

export const lba_add_life_point_obj = action((_block, field) => {
    field('add');
    field(new Blockly.FieldNumber(), 'arg_0');
    field('to');
    field(makeIcon('actor.svg'));
    field(new FieldActor(), 'actor');
    field("'s life points");
});

export const lba_sub_life_point_obj = action((_block, field) => {
    field('subtract');
    field(new Blockly.FieldNumber(), 'arg_0');
    field('to');
    field(makeIcon('actor.svg'));
    field(new FieldActor(), 'actor');
    field("'s life points");
});

export const lba_full_point = action((_block, field) => {
    field('fill (life?) points');
});

export const lba_set_armor = action((_block, field) => {
    field('set armor to');
    field(new Blockly.FieldNumber(), 'arg_0');
});

export const lba_set_armor_obj = action((_block, field) => {
    field('set');
    field(makeIcon('actor.svg'));
    field(new FieldActor(), 'actor');
    field("'s armor to");
    field(new Blockly.FieldNumber(), 'arg_0');
});

/*
** Bonuses & money
*/
export const lba_add_money = action((_block, field) => {
    field('receive');
    field(new Blockly.FieldNumber(), 'arg_0');
    field('coins');
});

export const lba_sub_money = action((_block, field) => {
    field('give');
    field(new Blockly.FieldNumber(), 'arg_0');
    field('coins');
});

export const lba_use_one_little_key = action((_block, field) => {
    field('use a key');
});

export const lba_give_bonus = action((_block, field) => {
    field('give bonus');
    field(new Blockly.FieldNumber(), 'arg_0');
});

export const lba_inc_clover_box = action((_block, field) => {
    field('receive clover box');
});

/*
** Inventory
*/
export const lba_found_object = action((_block, field) => {
    field('display found object');
    field(new FieldDropdownLBA('item'), 'arg_0');
});

export const lba_state_inventory = action((_block, field) => {
    field('(?) inventory state');
    field(new FieldDropdownLBA('item'), 'arg_0');
    field(new Blockly.FieldNumber(), 'arg_1');
});

export const lba_set_used_inventory = action((_block, field) => {
    field('use object');
    field(new FieldDropdownLBA('item'), 'arg_0');
});

export const lba_set_holo_pos = action((_block, field) => {
    field('set holomap position');
    field(new Blockly.FieldNumber(), 'arg_0');
});

export const lba_clr_holo_pos = action((_block, field) => {
    field('clear holomap position');
    field(new Blockly.FieldNumber(), 'arg_0');
});

export const lba_memo_slate = action((_block, field) => {
    field('memorize slate image');
    field(new Blockly.FieldNumber(), 'arg_0');
});

/*
** Audio & video
*/
export const lba_sample = action((_block, field) => {
    field('(?) sample');
    field(new Blockly.FieldNumber(), 'arg_0');
});

export const lba_new_sample = action((_block, field) => {
    field('(?) new sample');
    field(new Blockly.FieldNumber(), 'arg_0');
    field(new Blockly.FieldNumber(), 'arg_1');
    field(new Blockly.FieldNumber(), 'arg_2');
    field(new Blockly.FieldNumber(), 'arg_3');
});

export const lba_repeat_sample = action((_block, field) => {
    field('(?) repeat sample');
    field(new Blockly.FieldNumber(), 'arg_0');
    field(new Blockly.FieldNumber(), 'arg_1');
});

export const lba_sample_always = action((_block, field) => {
    field('(?) sample always');
    field(new Blockly.FieldNumber(), 'arg_0');
});

export const lba_sample_stop = action((_block, field) => {
    field('(?) sample stop');
    field(new Blockly.FieldNumber(), 'arg_0');
});

export const lba_parm_sample = action((_block, field) => {
    field('(?) parm sample');
    field(new Blockly.FieldNumber(), 'arg_0');
    field(new Blockly.FieldNumber(), 'arg_1');
    field(new Blockly.FieldNumber(), 'arg_2');
});

export const lba_play_music = action((_block, field) => {
    field('play music');
    field(new Blockly.FieldNumber(), 'arg_0');
});

export const lba_play_video = action((_block, field) => {
    field('play video');
    field(new Blockly.FieldTextInput, 'arg_0');
});

/*
** Fight
*/
export const lba_hit = action((_block, field) => {
    field('hit');
    field(makeIcon('actor.svg'));
    field(new FieldActor(), 'arg_0');
    field('with strength');
    field(new Blockly.FieldNumber(), 'arg_1');
});

export const lba_set_hit_zone = action((_block, field) => {
    field('(?) set hit zone');
    field(new Blockly.FieldNumber(), 'arg_0');
    field(new Blockly.FieldNumber(), 'arg_1');
});

/*
** Sprites & textures
*/
export const lba_set_sprite = action((_block, field) => {
    field('set sprite');
    field(new Blockly.FieldNumber(), 'arg_0');
});

export const lba_anim_texture = action((_block, field) => {
    field('anim texture');
    field(new Blockly.FieldNumber(), 'arg_0');
});

/*
** Actor
*/
export const lba_set_invisible = action((_block, field) => {
    field('set invisible');
    field(new Blockly.FieldNumber(), 'arg_0');
});

/*
** Transportation gameplay
*/
export const lba_set_rail = action((_block, field) => {
    field('set rail');
    field(new Blockly.FieldNumber(), 'arg_0');
    field(new Blockly.FieldNumber(), 'arg_1');
});

export const lba_escalator = action((_block, field) => {
    field('escalator');
    field(new Blockly.FieldNumber(), 'arg_0');
    field(new Blockly.FieldNumber(), 'arg_1');
});

export const lba_init_buggy = action((_block, field) => {
    field('init buggy');
    field(new Blockly.FieldNumber(), 'arg_0');
});

/*
** Weather
*/
export const lba_rain = action((_block, field) => {
    field('rain');
    field(new Blockly.FieldNumber(), 'arg_0');
});

export const lba_lightning = action((_block, field) => {
    field('lightning');
    field(new Blockly.FieldNumber(), 'arg_0');
});

/*
** Unknown
*/
export const lba_set_anim_dial = action((_block, field) => {
    field('(?) set anim dial');
    field(new Blockly.FieldNumber(), 'arg_0');
});

export const lba_impact_point = action((_block, field) => {
    field('(?) impact point');
    field(new Blockly.FieldNumber(), 'arg_0');
    field(new Blockly.FieldNumber(), 'arg_1');
});

export const lba_balloon = action((_block, field) => {
    field('(?) balloon');
    field(new Blockly.FieldNumber(), 'arg_0');
});

export const lba_background = action((_block, field) => {
    field('(?) background');
    field(new Blockly.FieldNumber(), 'arg_0');
});

export const lba_set_can_fall = action((_block, field) => {
    field('(?) can fall');
    field(new Blockly.FieldNumber(), 'arg_0');
});

export const lba_brick_col = action((_block, field) => {
    field('(?) brick_ ol');
    field(new Blockly.FieldNumber(), 'arg_0');
});

export const lba_obj_col = action((_block, field) => {
    field('(?) obj col');
    field(new Blockly.FieldNumber(), 'arg_0');
});

export const lba_no_shock = action((_block, field) => {
    field('(?) no shock');
    field(new Blockly.FieldNumber(), 'arg_0');
});

export const lba_pcx = action((_block, field) => {
    field('(?) pcx');
    field(new Blockly.FieldNumber(), 'arg_0');
});

export const lba_set_grm = action((_block, field) => {
    field('(?) set grm');
    field(new Blockly.FieldNumber(), 'arg_0');
    field(new Blockly.FieldNumber(), 'arg_1');
});

export const lba_set_change_cube = action((_block, field) => {
    field('(?) set change cube');
    field(new Blockly.FieldNumber(), 'arg_0');
    field(new Blockly.FieldNumber(), 'arg_1');
});

export const lba_fade_to_pal = action((_block, field) => {
    field('(?) fade to pal');
    field(new Blockly.FieldNumber(), 'arg_0');
});

export const lba_palette = action((_block, field) => {
    field('(?) palette');
    field(new Blockly.FieldNumber(), 'arg_0');
});

export const lba_flow_point = action((_block, field) => {
    field('(?) flow point');
    field(new Blockly.FieldNumber(), 'arg_0');
    field(new Blockly.FieldNumber(), 'arg_1');
});

export const lba_shadow_obj = action((_block, field) => {
    field('(?) shadow obj');
    field(new Blockly.FieldNumber(), 'arg_0');
    field(new Blockly.FieldNumber(), 'arg_1');
});

export const lba_anim_set = action((_block, field) => {
    field('(?) anim set');
    field(new Blockly.FieldNumber(), 'arg_0');
});

export const lba_pcx_mess_obj = action((_block, field) => {
    field('(?) pcx mess obj');
    field(new Blockly.FieldNumber(), 'arg_0');
    field(new Blockly.FieldNumber(), 'arg_1');
});

export const lba_set_frame = action((_block, field) => {
    field('(?) set frame');
    field(new Blockly.FieldNumber(), 'arg_0');
});

export const lba_flow_obj = action((_block, field) => {
    field('(?) flow obj');
    field(new Blockly.FieldNumber(), 'arg_0');
});

export const lba_impact_obj = action((_block, field) => {
    field('(?) impact obj');
    field(new Blockly.FieldNumber(), 'arg_0');
    field(new Blockly.FieldNumber(), 'arg_1');
});

export const lba_pos_obj_around = action((_block, field) => {
    field('(?) pos object around');
    field(new Blockly.FieldNumber(), 'arg_0');
    field(new Blockly.FieldNumber(), 'arg_1');
});

export const lba_scale = action((_block, field) => {
    field('(?) scale');
    field(new Blockly.FieldNumber(), 'arg_0');
    field(new Blockly.FieldNumber(), 'arg_1');
});

export const lba_popcorn = action((_block, field) => {
    field('(?) popcorn');
});

export const lba_set_frame_3ds = action((_block, field) => {
    field('(?) set frame 3ds');
    field(new Blockly.FieldNumber(), 'arg_0');
});

export const lba_set_action = action((_block, field) => {
    field('(?) action');
});
