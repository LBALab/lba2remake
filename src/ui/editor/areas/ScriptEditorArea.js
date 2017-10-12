import React from 'react';
import ScriptEditor from './ScriptEditorArea/scriptEditor';
import {editor} from '../../styles';

const ScriptEditorArea = {
    name: 'Scripts',
    menu: ScriptMenu,
    content: ScriptEditor,
    getInitialState: () => ({})
};

export default ScriptEditorArea;

export function ScriptMenu() {
    return <span>
        <b>Actor</b><select style={editor.select}/>
    </span>;
}
