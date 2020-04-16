export default `<xml id="toolbox" style="display: none">
    <category name="Structural" colour="198">
        <block type="lba_behaviour_init"/>
        <block type="lba_behaviour"/>
        <block type="lba_track"/>
    </category>
    <category name="Control" colour="180">
        <label text="Branching"/>
        <block type="lba_if"/>
        <block type="lba_swif"/>
        <block type="lba_oneif"/>
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
        <block type="lba_or_case"/>
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
        <block type="lba_break"/>

        <label text="Logic"/>
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
    <category name="Behaviour Actions" colour="#666666">
        <label text="Behaviours"/>
        <block type="lba_set_behaviour"/>
        <block type="lba_set_behaviour_obj"/>
        <block type="lba_save_behaviour"/>
        <block type="lba_save_behaviour_obj"/>
        <block type="lba_restore_behaviour"/>
        <block type="lba_restore_behaviour_obj"/>

        <label text="Tracks"/>
        <block type="lba_set_track"/>
        <block type="lba_set_track_obj"/>
        <block type="lba_save_current_track"/>
        <block type="lba_save_current_track_obj"/>
        <block type="lba_track_to_vargame"/>
        <block type="lba_restore_last_track"/>
        <block type="lba_restore_last_track_obj"/>
        <block type="lba_vargame_to_track"/>

        <label text="Variables &amp; Bonuse"/>
        <block type="lba_set_varscene"/>
        <block type="lba_set_vargame"/>

        <label text="3D Model"/>
        <block type="lba_set_anim"/>
        <block type="lba_set_anim_obj"/>
        <block type="lba_set_body"/>
        <block type="lba_set_body_obj"/>
        <block type="lba_no_body"/>
    </category>
    <category name="Track Actions" colour="#555555">
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
