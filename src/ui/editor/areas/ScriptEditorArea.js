import React from 'react';
import {map} from 'lodash';
import ScriptEditor from './ScriptEditorArea/scriptEditor';
import {editor} from '../../styles';
import FrameListener from '../../utils/FrameListener';
import DebugData, {getObjectName} from '../DebugData';

const inputStyle = {
    textAlign: 'center',
    verticalAlign: 'middle'
};

export class ScriptMenu extends FrameListener {
    constructor(props) {
        super(props);
        this.state = { actors: [], selectedActor: props.sharedState.actor, isPaused: false };
    }

    frame() {
        const {scene, game} = DebugData.scope;
        const selectedActor = this.props.sharedState.actor;
        if (this.scene !== scene) {
            this.setState({actors: map(scene && scene.actors, actor => getObjectName('actor', scene.index, actor.index))});
            this.scene = scene;
        }
        if (this.state.selectedActor !== selectedActor) {
            this.setState({selectedActor});
        }
        if (game && game.isPaused() !== this.state.paused) {
            this.setState({paused: game.isPaused()});
        }
    }

    render() {
        const onChange = (e) => {
            this.props.stateHandler.setActor(parseInt(e.target.value));
        };

        const togglePause = () => {
            const game = DebugData.scope.game;
            if (game) {
                game.togglePause();
            }
        };

        const step = () => {
            const game = DebugData.scope.game;
            if (game) {
                DebugData.step = true;
            }
        };

        const reset = () => {
            const scene = DebugData.scope.scene;
            if (scene) {
                scene.reset();
            }
        };

        const paused = this.state.paused;

        const toggleAutoScroll = (e) => {
            this.props.stateHandler.setAutoScroll(e.target.checked);
        };

        const autoScroll = this.props.sharedState.autoScroll;

        return <span>
            <label><input key="autoScroll" type="checkbox" onChange={toggleAutoScroll} checked={autoScroll} style={inputStyle}/>Autoscroll</label>
            &nbsp;
            <img style={editor.icon} onClick={reset} src="editor/icons/reset.png"/>
            {paused ? <img style={editor.icon} onClick={step} src="editor/icons/step.png"/> : null}
            <img style={editor.icon} onClick={togglePause} src={`editor/icons/${paused ? 'play' : 'pause'}.png`}/>
            <select style={editor.select} value={this.state.selectedActor} onChange={onChange}>
                {map(this.state.actors, (actor, idx) =>
                    <option key={idx} value={idx}>{actor}</option>)}
            </select>
        </span>;
    }
}

const ScriptEditorArea = {
    id: 'script_editor',
    name: 'Scripts',
    menu: ScriptMenu,
    icon: 'script.png',
    content: ScriptEditor,
    getInitialState: () => ({
        autoScroll: true,
        actorIndex: 0,
    }),
    stateHandler: {
        splitAt(splitAt) {
            this.setState({splitAt});
        },
        setAutoScroll(autoScroll) {
            this.setState({autoScroll});
        },
        setActor(actor) {
            this.setState({actor});
        }
    }
};

export default ScriptEditorArea;
