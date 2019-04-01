import React from 'react';
import {map, extend} from 'lodash';
import {editor} from '../../../../styles';
import FrameListener from '../../../../utils/FrameListener';
import DebugData, {getObjectName} from '../../../DebugData';

const inputStyle = {
    textAlign: 'center',
    verticalAlign: 'middle'
};

const iconStyle = extend({}, editor.icon, {
    width: 18,
    hieght: 18
});

const toolbarStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 23,
    lineHeight: '23px',
    verticalAlign: 'middle',
    background: 'rgb(21, 21, 21)',
    userSelect: 'none'
};

export default class ScriptsAreaToolbar extends FrameListener {
    constructor(props) {
        super(props);
        this.state = {
            actors: [],
            selectedActor: props.sharedState.actorIndex,
            selecting: false,
            isPaused: false
        };
    }

    frame() {
        const {scene, game} = DebugData.scope;
        const selectedActor = this.props.sharedState.actorIndex;
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
        return <React.Fragment>
            <div style={toolbarStyle}>
                {this.renderContent()}
            </div>
            {this.renderSelector()}
        </React.Fragment>;
    }

    renderContent() {
        if (this.state.selecting)
            return null;

        const selectActor = () => {
            this.setState({selecting: true});
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

        return <React.Fragment>
            <span style={{cursor: 'pointer'}} onClick={selectActor}>
                <img style={iconStyle} src="editor/icons/actor.svg"/>
                {this.state.actors[this.state.selectedActor] || <span style={{color: 'grey'}}>None</span>}
            </span>
            &nbsp;
            <img style={iconStyle} onClick={reset} src="editor/icons/reset.svg"/>
            {paused ? <img style={iconStyle} onClick={step} src="editor/icons/step.png"/> : null}
            <img style={iconStyle} onClick={togglePause} src={`editor/icons/${paused ? 'play' : 'pause'}.svg`}/>
            <label style={{float: 'right'}}><input key="autoScroll" type="checkbox" onChange={toggleAutoScroll} checked={autoScroll} style={inputStyle}/>Autoscroll</label>
        </React.Fragment>;
    }

    renderSelector() {
        if (!this.state.selecting)
            return null;

        const selectActor = (actorIndex) => {
            this.props.stateHandler.setActor(actorIndex);
            this.setState({selecting: false});
        };

        const style = {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
        };

        const lineStyle = {
            height: 24,
            lineHeight: '24px',
            verticalAlign: 'middle',
            userSelect: 'none'
        };

        const aLineStyle = Object.assign({}, lineStyle, {
            cursor: 'pointer',
            overflow: 'hidden',
            width: '100%'
        });

        const contentStyle = {
            background: 'black',
            position: 'absolute',
            top: 24,
            left: 0,
            bottom: 0,
            overflow: 'auto'
        };

        return <div style={style} onClick={() => this.setState({selecting: false})}>
            <div style={lineStyle}>Select an actor:</div>
            <div style={contentStyle}>
                {map(this.state.actors, (actor, idx) =>
                    <div key={idx} style={aLineStyle} onClick={selectActor.bind(null, idx)}>
                        <img style={iconStyle} src="editor/icons/actor.svg"/>
                        {actor}
                        &nbsp;
                        <span style={{color: 'grey'}}>#{idx}</span>
                    </div>)}
            </div>
        </div>;
    }
}
