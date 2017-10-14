import React from 'react';
import ScriptEditor from './ScriptEditorArea/scriptEditor';
import {editor} from '../../styles';
import FrameListener from '../../utils/FrameListener';
import {map} from 'lodash';
import DebugData from '../DebugData';

export class ScriptMenu extends FrameListener {
    constructor(props) {
        super(props);
        this.state = { actors: [], selectedActor: 0, isPaused: false }
    }

    frame() {
        const {scene, game} = DebugData.scope;
        const selectedActor = DebugData.selection.actor;
        if (this.scene !== scene) {
            this.setState({actors: map(scene && scene.actors, actor => actor.index)});
            this.scene = scene;
        }
        if (this.selectedActor !== selectedActor) {
            this.setState({selectedActor: selectedActor});
            this.selectedActor = selectedActor;
        }
        if (game && game.isPaused() !== this.state.paused) {
            this.setState({paused: game.isPaused()});
        }
    }

    render() {
        const onChange = (e) => {
            DebugData.selection.actor = parseInt(e.target.value);
        };

        const togglePause = () => {
            const game = DebugData.scope.game;
            if (game) {
                game.pause();
            }
        };

        const step = () => {
            const game = DebugData.scope.game;
            if (game) {
                DebugData.step = true;
            }
        };

        const paused = this.state.paused;

        return <span>
            {paused ? <img style={editor.icon} onClick={step} src="editor/icons/step.png"/> : null}&nbsp;
            <img style={editor.icon} onClick={togglePause} src={`editor/icons/${paused ? 'play' : 'pause'}.png`}/>&nbsp;
            <b>Actor</b>
            <select style={editor.select} value={this.state.selectedActor} onChange={onChange}>
                {map(this.state.actors, actor => <option key={actor} value={actor}>{actor}</option>)}
            </select>
        </span>;
    }
}

const ScriptEditorArea = {
    id: 'script_editor',
    name: 'Scripts',
    menu: ScriptMenu,
    content: ScriptEditor,
    getInitialState: () => ({})
};

export default ScriptEditorArea;
