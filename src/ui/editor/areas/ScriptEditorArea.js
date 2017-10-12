import React from 'react';
import ScriptEditor from './ScriptEditorArea/scriptEditor';
import {editor} from '../../styles';
import FrameListener from '../../utils/FrameListener';
import {map} from 'lodash';
import DebugData from '../DebugData';

export class ScriptMenu extends FrameListener {
    constructor(props) {
        super(props);
        this.state = { actors: [], selectedActor: 0 }
    }

    frame() {
        const scene = DebugData.scope.scene;
        const selectedActor = DebugData.selection.actor;
        if (this.scene !== scene) {
            this.setState({actors: map(scene && scene.actors, actor => actor.index)});
            this.scene = scene;
        }
        if (this.selectedActor !== selectedActor) {
            this.setState({selectedActor: selectedActor});
            this.selectedActor = selectedActor;
        }
    }

    render() {
        const onChange = (e) => {
            DebugData.selection.actor = parseInt(e.target.value);
        };

        return <span>
            <b>Actor</b>
            <select style={editor.select} value={this.state.selectedActor} onChange={onChange}>
                {map(this.state.actors, actor => <option key={actor} value={actor}>{actor}</option>)}
            </select>
        </span>;
    }
}

const ScriptEditorArea = {
    name: 'Scripts',
    menu: ScriptMenu,
    content: ScriptEditor,
    getInitialState: () => ({})
};

export default ScriptEditorArea;
