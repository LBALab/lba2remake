import { each } from 'lodash';
import extractors from './extractors';

export function fillWorkspace(workspace) {
    extractCommands(workspace, 'life');
    extractCommands(workspace, 'move');
    postProcess(workspace);
}

function extractCommands(workspace, type) {
    const commands = workspace.actor.scripts[type].commands;
    const tExtractors = extractors[type];
    const ctx = { connection: null };
    each(commands, (data, index) => {
        let newCtx = {};
        const cmdName = data.op.command;
        if (cmdName in tExtractors) {
            const extractor = tExtractors[cmdName];
            newCtx = extractor(workspace, {data, index, type}, ctx);
        }
        Object.assign(ctx, newCtx);
    });
}

function postProcess(workspace) {
    const {
        comportementMap,
        commands: lifeCommands
    } = workspace.actor.scripts.life;
    const { tracksMap } = workspace.actor.scripts.move;
    const setBehaviourBlocks = workspace.getBlocksByType('lba_set_behaviour');
    each(setBehaviourBlocks, (block) => {
        const cmd = lifeCommands[block.index];
        const value = comportementMap[cmd.args[0].value];
        block.setFieldValue(value, 'arg_0');
    });

    const setTrackBlocks = workspace.getBlocksByType('lba_set_track');
    each(setTrackBlocks, (block) => {
        const cmd = lifeCommands[block.index];
        const value = tracksMap[cmd.args[0].value];
        block.setFieldValue(value, 'arg_0');
    });

    const curTrackBlocks = workspace.getBlocksByType('lba_cur_track');
    each(curTrackBlocks, (block) => {
        const cmd = lifeCommands[block.index];
        if (cmd.operator) {
            block.setFieldValue(cmd.operator.operand.value, 'operand');
        }
    });

    const operandTrackBlocks = workspace.getBlocksByType('lba_operand_track');
    each(operandTrackBlocks, (block) => {
        const cmd = lifeCommands[block.index];
        if (cmd.operator) {
            block.setFieldValue(cmd.operator.operand.value, 'operand');
        }
    });
}
