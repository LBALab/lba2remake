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

        <label text="Variables &amp; Bonuse"/>
        <block type="lba_set_varscene"/>
        <block type="lba_set_vargame"/>

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
