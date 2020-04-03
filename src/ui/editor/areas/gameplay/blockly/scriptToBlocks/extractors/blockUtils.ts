export function newBlock(workspace, type, def) {
    const block = workspace.newBlock(type);
    block.index = def.index;
    block.scriptType = def.type;
    block.initSvg();
    block.render();
    return block;
}
