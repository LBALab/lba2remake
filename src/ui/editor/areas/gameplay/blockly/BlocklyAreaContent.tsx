import * as React from 'react';
import { each, filter, sortBy } from 'lodash';
import Blockly from 'blockly';
import {fullscreen} from '../../../../styles';
import FrameListener from '../../../../utils/FrameListener';
import DebugData from '../../../DebugData';
import { TickerProps } from '../../../../utils/Ticker';
import blocksLibrary from './blocksLibrary';
import toolbox from './toolbox';
import BlocklyAreaToolbar from './BlocklyAreaToolbar';
import { fillWorkspace } from './scriptToBlocks';
import { compile } from './blocksToScript';

interface Props extends TickerProps {
    sharedState: any;
    stateHandler: any;
}

interface State {
    actorIndex: number;
}

let idCount = 0;

Blockly.HSV_SATURATION = 0.9;
Blockly.HSV_VALUE = 0.55;

each(blocksLibrary, (def, type) => {
    Blockly.Blocks[type] = def;
});

const mainStyle = {
    ...fullscreen,
    top: 20
};

export default class BlocklyAreaContent extends FrameListener<Props, State> {
    rootRef: HTMLElement;
    scene: any;
    actor: any;
    workspace: any;
    id: number;
    width: number = -1;
    height: number = -1;

    constructor(props) {
        super(props);

        this.onRef = this.onRef.bind(this);
        this.compile = this.compile.bind(this);
        this.state = {
            actorIndex: props.sharedState.actorIndex,
        };
        this.id = idCount;
        idCount += 1;
    }

    componentWillReceiveProps(newProps) {
        if (newProps.sharedState.actorIndex !== this.state.actorIndex) {
            this.setState({ actorIndex: newProps.sharedState.actorIndex });
        }
    }

    onRef(ref) {
        if (ref !== this.rootRef) {
            this.rootRef = ref;
            if (this.rootRef) {
                this.workspace = Blockly.inject(ref, {
                    toolbox,
                    move: {
                        scrollbars: true,
                        drag: true,
                        wheel: true
                    },
                    grid: {
                        spacing: 20,
                        length: 3,
                        colour: 'rgb(45, 45, 45)',
                        snap: true
                    },
                    zoom: {
                        controls: true,
                        wheel: true,
                        startScale: 1.0,
                        maxScale: 1,
                        minScale: 0.2,
                        scaleSpeed: 1.3
                    },
                    sounds: false,
                    trashcan: false,
                    theme: (Blockly as any).Themes.Dark
                });
                this.rebuildWorkspace();
            }
        }
    }

    frame() {
        const scene = DebugData.scope.scene;
        const actor = scene ? scene.actors[this.state.actorIndex] : null;
        if (this.scene !== scene || this.actor !== actor) {
            this.scene = scene;
            this.actor = actor;
            this.rebuildWorkspace();
        }
        if (this.rootRef
            && (this.width !== this.rootRef.clientWidth
                || this.height !== this.rootRef.clientHeight)) {
            this.width = this.rootRef.clientWidth;
            this.height = this.rootRef.clientHeight;
            if (this.workspace) {
                Blockly.svgResize(this.workspace);
            }
        }
        this.updateWorkspace();
    }

    updateWorkspace() {
        if (this.workspace && this.actor) {
            const activeCommands = {
                life: DebugData.script.life[this.actor.index] || {},
                move: DebugData.script.move[this.actor.index] || {},
            };
            const blocks = this.workspace.getAllBlocks(false);
            for (let i = 0; i < blocks.length; i += 1) {
                const b = blocks[i];
                const highlight = activeCommands[b.scriptType]
                    && b.index in activeCommands[b.scriptType];
                b.setHighlighted(highlight);
            }
        }
    }

    rebuildWorkspace() {
        if (this.scene && this.actor && this.workspace) {
            this.workspace.clear();
            this.workspace.actor = this.actor;
            this.workspace.scene = this.scene;
            fillWorkspace(this.workspace);
            this.reorganize();
        }
    }

    reorganize() {
        this.workspace.setResizesEnabled(false);
        Blockly.Events.setGroup(true);
        const topBlocks = this.workspace.getTopBlocks(true);
        const sortedBlocks = sortBy(topBlocks, ['index']);
        const lifeBlocks = filter(sortedBlocks, b => b.scriptType === 'life');
        const moveBlocks = filter(sortedBlocks, b => b.scriptType === 'move');
        const width = this.reorderBlocks(lifeBlocks);
        this.reorderBlocks(moveBlocks, width + 30);
        Blockly.Events.setGroup(false);
        this.workspace.setResizesEnabled(true);
    }

    reorderBlocks(blocks, posX = 0) {
        let cursorY = 0;
        let maxWidth = 0;
        each(blocks, (block) => {
            if (!block.isMovable()) {
                return;
            }
            const xy = block.getRelativeToSurfaceXY();
            block.moveBy(-xy.x + posX, cursorY - xy.y);
            block.snapToGrid();
            cursorY = block.getRelativeToSurfaceXY().y +
                block.getHeightWidth().height +
                this.workspace.renderer_.getConstants().MIN_BLOCK_HEIGHT;
            maxWidth = Math.max(block.getHeightWidth().width, maxWidth);
        });
        return maxWidth;
    }

    compile() {
        compile(this.workspace);
    }

    render() {
        return <div>
            <div id={`blockly_workspace_${this.id}`} style={mainStyle} ref={this.onRef} />
            <BlocklyAreaToolbar
                ticker={this.props.ticker}
                sharedState={this.props.sharedState}
                stateHandler={this.props.stateHandler}
                compile={this.compile}/>
        </div>
        ;
    }
}
