export default `<xml id="toolbox" style="display: none">
    <category name="Structural" colour="198">
        <label text="Behaviour declaration"/>
        <block type="lba_behaviour_init"/>
        <block type="lba_behaviour"/>
        <label text="Behaviour navigation"/>
        <block type="lba_set_behaviour"/>
        <block type="lba_set_behaviour_obj"/>
    </category>
    <category name="Actions" colour="42">
        <label text="Variables &amp; Bonuse"/>
        <block type="lba_set_varscene"/>
        <block type="lba_set_vargame"/>
        <label text="Animation"/>
        <block type="lba_set_anim"/>
        <block type="lba_set_anim_obj"/>
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
        <label text="Animation"/>
        <block type="lba_anim"/>
        <block type="lba_anim_obj"/>
        <label text="Body"/>
        <block type="lba_body"/>
        <block type="lba_body_obj"/>
    </category>
    <category name="Tracks" colour="#666666">
        <label text="Structural"/>
        <block type="lba_track"/>
        <label text="Actions"/>
        <block type="lba_move_set_anim"/>
        <block type="lba_wait_anim"/>
        <block type="lba_wait_sec"/>
        <block type="lba_goto_point"/>
    </category>
</xml>`;
