export default `<xml id="toolbox" style="display: none">
    <category name="Behaviours" colour="198">
        <label text="Definition"/>
        <block type="lba_behaviour_init"/>
        <block type="lba_behaviour"/>

        <label text="Actions"/>
        <block type="lba_set_behaviour"/>
        <block type="lba_set_behaviour_obj"/>
        <block type="lba_save_behaviour"/>
        <block type="lba_save_behaviour_obj"/>
        <block type="lba_restore_behaviour"/>
        <block type="lba_restore_behaviour_obj"/>
    </category>
    <category name="Tracks" colour="100">
        <label text="Definition"/>
        <block type="lba_track"/>

        <label text="Actions"/>
        <block type="lba_set_track"/>
        <block type="lba_set_track_obj"/>
        <block type="lba_save_current_track"/>
        <block type="lba_save_current_track_obj"/>
        <block type="lba_track_to_vargame"/>
        <block type="lba_restore_last_track"/>
        <block type="lba_restore_last_track_obj"/>
        <block type="lba_vargame_to_track"/>
    </category>
    <category name="Control flow" colour="180">
        <label text="Branching (if)"/>
        <block type="lba_if"/>
        <block type="lba_swif"/>
        <block type="lba_oneif"/>

        <label text="Branching (switch)"/>
        <block type="lba_switch">
            <statement name="statements">
                <block type="lba_case">
                    <statement name="statements">
                        <block type="lba_break"/>
                    </statement>
                    <next>
                        <block type="lba_default">
                            <statement name="statements">
                                <block type="lba_break"/>
                            </statement>
                        </block>
                    </next>
                </block>
            </statement>
        </block>
        <block type="lba_case">
            <statement name="statements">
                <block type="lba_break"/>
            </statement>
        </block>
        <block type="lba_default">
            <statement name="statements">
                <block type="lba_break"/>
            </statement>
        </block>
        <block type="lba_or_case"/>
        <block type="lba_break"/>

        <label text="Misc"/>
        <block type="lba_return"/>

        <label text="Logic gates"/>
        <block type="lba_and"/>
        <block type="lba_or"/>
    </category>
    <category name="Conditions" colour="15">
        <label text="Zones"/>
        <block type="lba_zone"/>
        <block type="lba_zone_obj"/>

        <label text="Tracks"/>
        <block type="lba_cur_track"/>
        <block type="lba_cur_track_obj"/>

        <label text="Player input"/>
        <block type="lba_action"/>
        <block type="lba_using_inventory"/>
        <block type="lba_choice"/>
        <block type="lba_hero_behaviour"/>

        <label text="Collisions &amp; interactions"/>
        <block type="lba_collision"/>
        <block type="lba_collision_obj"/>
        <block type="lba_col_decors"/>
        <block type="lba_col_decors_obj"/>
        <block type="lba_hit_by"/>
        <block type="lba_hit_by_obj"/>
        <block type="lba_carried_by"/>
        <block type="lba_carried_by_obj"/>
        <block type="lba_ladder"/>
        <block type="lba_rail"/>

        <label text="Distances"/>
        <block type="lba_distance"/>
        <block type="lba_distance_3D"/>
        <block type="lba_distance_msg"/>

        <label text="Angles"/>
        <block type="lba_orientation"/>
        <block type="lba_orientation_obj"/>
        <block type="lba_angle"/>
        <block type="lba_angle_obj"/>
        <block type="lba_real_angle"/>

        <label text="Variables &amp; numbers"/>
        <block type="lba_vargame_value"/>
        <block type="lba_varscene_value"/>
        <block type="lba_random"/>

        <label text="Game properties"/>
        <block type="lba_chapter"/>
        <block type="lba_magic_level"/>

        <label text="3D Model"/>
        <block type="lba_anim"/>
        <block type="lba_anim_obj"/>
        <block type="lba_body"/>
        <block type="lba_body_obj"/>

        <label text="Items &amp; properties"/>
        <block type="lba_life_points"/>
        <block type="lba_life_points_obj"/>
        <block type="lba_magic_points"/>
        <block type="lba_keys"/>
        <block type="lba_money"/>
        <block type="lba_fuel"/>

        <label text="Legacy &amp; unused"/>
        <block type="lba_processor"/>
        <block type="lba_is_demo"/>
        <block type="lba_cdrom"/>

        <label text="Unknown"/>
        <block type="lba_cone_view"/>
        <block type="lba_object_displayed"/>
    </category>
    <category name="Actions (for behaviours)" colour="#444444">
        <label text="Actor"/>
        <block type="lba_end_life"/>
        <block type="lba_suicide"/>
        <block type="lba_kill_obj"/>

        <label text="Game"/>
        <block type="lba_change_scene"/>
        <block type="lba_the_end"/>
        <block type="lba_game_over"/>

        <label text="Variables"/>
        <block type="lba_set_varscene"/>
        <block type="lba_set_vargame"/>
        <block type="lba_add_vargame"/>
        <block type="lba_sub_vargame"/>
        <block type="lba_add_varcube"/>
        <block type="lba_sub_varcube"/>

        <label text="3D Model"/>
        <block type="lba_set_anim"/>
        <block type="lba_set_anim_obj"/>
        <block type="lba_set_body"/>
        <block type="lba_set_body_obj"/>
        <block type="lba_no_body"/>

        <label text="Messages"/>
        <block type="lba_message"/>
        <block type="lba_message_obj"/>
        <block type="lba_message_zoe"/>
        <block type="lba_add_message"/>
        <block type="lba_end_message"/>
        <block type="lba_add_choice"/>
        <block type="lba_ask_choice"/>
        <block type="lba_ask_choice_obj"/>

        <label text="Movements"/>
        <block type="lba_set_position"/>
        <block type="lba_set_orientation"/>
        <block type="lba_set_inverse_orientation"/>
        <block type="lba_set_dirmode"/>
        <block type="lba_set_dirmode_obj"/>

        <label text="Hero"/>
        <block type="lba_set_hero_behaviour"/>
        <block type="lba_save_hero"/>
        <block type="lba_restore_hero"/>
        <block type="lba_set_magic_level"/>

        <label text="Camera"/>
        <block type="lba_cinema_mode"/>
        <block type="lba_set_camera"/>
        <block type="lba_camera_center"/>
        <block type="lba_cam_follow"/>

        <label text="Doors"/>
        <block type="lba_set_door_left"/>
        <block type="lba_set_door_right"/>
        <block type="lba_set_door_up"/>
        <block type="lba_set_door_down"/>

        <label text="Life &amp; armor"/>
        <block type="lba_set_life_point_obj"/>
        <block type="lba_add_life_point_obj"/>
        <block type="lba_sub_life_point_obj"/>
        <block type="lba_full_point"/>
        <block type="lba_set_armor"/>
        <block type="lba_set_armor_obj"/>

        <label text="Money &amp; bonuses"/>
        <block type="lba_add_money"/>
        <block type="lba_sub_money"/>
        <block type="lba_use_one_little_key"/>
        <block type="lba_give_bonus"/>
        <block type="lba_inc_clover_box"/>

        <label text="Inventory"/>
        <block type="lba_found_object"/>
        <block type="lba_state_inventory"/>
        <block type="lba_set_used_inventory"/>
        <block type="lba_set_holo_pos"/>
        <block type="lba_clr_holo_pos"/>
        <block type="lba_memo_slate"/>

        <label text="Audio"/>
        <block type="lba_sample"/>
        <block type="lba_new_sample"/>
        <block type="lba_repeat_sample"/>
        <block type="lba_sample_always"/>
        <block type="lba_sample_stop"/>
        <block type="lba_parm_sample"/>
        <block type="lba_play_music"/>

        <label text="Video"/>
        <block type="lba_play_video"/>

        <label text="Misc"/>
        <block type="lba_hit"/>
        <block type="lba_set_hit_zone"/>
        <block type="lba_set_sprite"/>
        <block type="lba_anim_texture"/>
        <block type="lba_set_invisible"/>

        <label text="Transportation"/>
        <block type="lba_set_rail"/>
        <block type="lba_escalator"/>
        <block type="lba_init_buggy"/>

        <label text="Weather"/>
        <block type="lba_rain"/>
        <block type="lba_lightning"/>

        <label text="Unknown"/>
        <block type="lba_set_anim_dial"/>
        <block type="lba_impact_point"/>
        <block type="lba_balloon"/>
        <block type="lba_background"/>
        <block type="lba_set_can_fall"/>
        <block type="lba_brick_col"/>
        <block type="lba_obj_col"/>
        <block type="lba_no_shock"/>
        <block type="lba_pcx"/>
        <block type="lba_set_grm"/>
        <block type="lba_set_change_cube"/>
        <block type="lba_fade_to_pal"/>
        <block type="lba_palette"/>
        <block type="lba_flow_point"/>
        <block type="lba_shadow_obj"/>
        <block type="lba_anim_set"/>
        <block type="lba_pcx_mess_obj"/>
        <block type="lba_set_frame"/>
        <block type="lba_flow_obj"/>
        <block type="lba_impact_obj"/>
        <block type="lba_pos_obj_around"/>
        <block type="lba_scale"/>
        <block type="lba_popcorn"/>
        <block type="lba_set_frame_3ds"/>
        <block type="lba_set_action"/>
    </category>
    <category name="Actions (for tracks)" colour="#393939">
        <label text="3D Model"/>
        <block type="lba_move_set_anim"/>
        <block type="lba_wait_anim"/>
        <block type="lba_move_set_body"/>

        <label text="Movement"/>
        <block type="lba_goto_point"/>

        <label text="Timing"/>
        <block type="lba_wait_sec"/>
        <block type="lba_wait_dsec"/>
        <block type="lba_wait_sec_rnd"/>
        <block type="lba_wait_dsec_rnd"/>
    </category>
</xml>`;
