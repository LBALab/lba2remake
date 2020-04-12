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
        <block type="lba_switch"/>

        <label text="Logic"/>
        <block type="lba_and"/>
        <block type="lba_or"/>
    </category>
    <category name="Conditions" colour="15">
        <label text="Collisions &amp; distances"/>
        <block type="lba_collision"/>
        <block type="lba_collision_obj"/>
        <block type="lba_distance"/>

        <label text="Zones"/>
        <block type="lba_zone"/>
        <block type="lba_zone_obj"/>

        <label text="3D Model"/>
        <block type="lba_anim"/>
        <block type="lba_anim_obj"/>
        <block type="lba_body"/>
        <block type="lba_body_obj"/>
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
