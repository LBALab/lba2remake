import { getMoveOpcode } from '../../../../../../../../scripting/parser';

function rootBlockContentHandler(block, emit, ctx) {
    if (!ctx.inRootTrack) {
        ctx.inRootTrack = true;
        let next = block.nextConnection.targetBlock();
        while (next) {
            emit(next);
            next = next.nextConnection.targetBlock();
        }
        ctx.commands.push({
            op: getMoveOpcode(0x0B) // STOP
        });
        ctx.inRootTrack = false;
    }
}

function trackDetailsHandler(_block, cmd, ctx) {
    ctx.tracksMap[ctx.commands.length] = cmd.args[0].value;
    return true;
}

export default {
    lba_move_track: {
        code: 0x09,
        details: trackDetailsHandler,
        content: rootBlockContentHandler
    },
    lba_move_replace: {
        code: 0x23,
        content: rootBlockContentHandler
    },
    lba_move_goto: { code: 0x0A },
    lba_move_set_anim: { code: 0x03 },
    lba_move_wait_anim: { code: 0x05 },
    lba_move_wait_num_anim: { code: 0x0d },
    lba_move_set_frame: { code: 0x29 },
    lba_move_set_body: { code: 0x02 },
    lba_move_goto_point: { code: 0x04 },
    lba_move_goto_point_3d: { code: 0x0f },
    lba_move_goto_sym_point: { code: 0x0c },
    lba_move_pos_point: { code: 0x08 },
    lba_move_speed: { code: 0x10 },
    lba_move_set_angle: { code: 0x07 },
    lba_move_set_angle_rnd: { code: 0x22 },
    lba_move_set_orientation: { code: 0x14 },
    lba_move_face_hero: { code: 0x21 },
    lba_move_wait_sec: {
        code: 0x12,
        args: { 1: 0 }
    },
    lba_move_wait_dsec: {
        code: 0x24,
        args: { 1: 0 }
    },
    lba_move_wait_sec_rnd: {
        code: 0x27,
        args: { 1: 0 }
    },
    lba_move_wait_dsec_rnd: {
        code: 0x31,
        args: { 1: 0 }
    },
    lba_move_open_left: { code: 0x15 },
    lba_move_open_right: { code: 0x16 },
    lba_move_open_up: { code: 0x17 },
    lba_move_open_down: { code: 0x18 },
    lba_move_close: { code: 0x19 },
    lba_move_wait_door: { code: 0x1a },
    lba_move_sample: { code: 0x0e },
    lba_move_sample_stop: { code: 0x1d },
    lba_move_sample_always: { code: 0x1c },
    lba_move_repeat_sample: { code: 0x1f },
    lba_move_simple_sample: { code: 0x20 },
    lba_move_volume: { code: 0x34 },
    lba_move_frequency: { code: 0x33 },
    lba_move_interval: { code: 0x32 },
    lba_move_start_anim_3ds: { code: 0x2d },
    lba_move_stop_anim_3ds: { code: 0x2e },
    lba_move_set_start_3ds: { code: 0x2b },
    lba_move_set_end_3ds: { code: 0x2c },
    lba_move_set_frame_3ds: { code: 0x2a },
    lba_move_wait_anim_3ds: { code: 0x2f },
    lba_move_wait_frame_3ds: { code: 0x30 },
    lba_move_background: { code: 0x11 },
    lba_move_set_sprite: { code: 0x26 }
};
