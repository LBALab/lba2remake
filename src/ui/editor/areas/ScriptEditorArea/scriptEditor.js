import React from 'react';
import {extend} from 'lodash';
import {fullscreen, editor} from '../../../styles';
import FrameListener from '../../../utils/FrameListener';

const scriptStyle = {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '50%',
    overflow: 'auto',
    boxShadow: 'inset 0px 0px 0px 1px black'
};

const lifeScript = extend({left: 0, background: 'darkred'}, scriptStyle);
const moveScript = extend({right: 0, background: 'darkblue'}, scriptStyle);

export function ScriptMenu() {
    return <span>
        <b>Scene</b><select style={editor.select}/>&nbsp;
        <b>Actor</b><select style={editor.select}/>&nbsp;
        <img style={editor.icon} src="editor/icons/pause.png"/>
        {/*<img src="editor/icons/step.png" />*/}
    </span>;
}

export class ScriptContent extends FrameListener {
    constructor(props) {
        super(props);
    }

    frame() {

    }

    render() {
        return <div style={{fullscreen}}>
            <div style={lifeScript}/>
            <div style={moveScript}/>
        </div>;
    }
}
