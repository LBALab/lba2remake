import * as React from 'react';
import { each } from 'lodash';
import Blockly from 'blockly';
import {fullscreen} from '../../../../styles';
import FrameListener from '../../../../utils/FrameListener';
import DebugData from '../../../DebugData';
import { TickerProps } from '../../../../utils/Ticker';
import BlockDefs from './blocks';
import toolbox from './toolbox';

interface Props extends TickerProps {
    sharedState: any;
    stateHandler: any;
}

interface State {
    actorIndex: number;
}

let idCount = 0;

Blockly.HSV_SATURATION = 0.8;

each(BlockDefs, (def, type) => {
    Blockly.Blocks[type] = def;
});

export default class ScriptEditor extends FrameListener<Props, State> {
    rootRef: HTMLElement;
    scene: any;
    actor: any;
    workspace: any;
    id: number;

    constructor(props) {
        super(props);

        this.onRef = this.onRef.bind(this);
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
        if (ref && ref !== this.rootRef) {
            this.workspace = Blockly.inject(ref, {
                toolbox,
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
                    minScale: 0.5,
                    scaleSpeed: 1.1
                },
                theme: (Blockly as any).Themes.Dark
            });
            /*
            this.workspace.addChangeListener(() => {
                const blocks = this.workspace.getTopBlocks();
                for (let i = 0; i < blocks.length; i += 1) {
                    blocks[i].setHighlighted(true);
                }
            });
            const block = this.workspace.newBlock('controls_if');
            block.initSvg();
            block.render();
            */
        }
        this.rootRef = ref;
    }

    frame() {
        const scene = DebugData.scope.scene;
        const actor = scene ? scene.actors[this.state.actorIndex] : null;
        if (this.scene !== scene || this.actor !== actor) {
            this.scene = scene;
            this.actor = actor;
        }
        if (this.scene && this.actor) {
            // do something with actor
        }
    }

    render() {
        return <div id={`blockly_workspace_${this.id}`} style={fullscreen} ref={this.onRef} />;
    }
}
