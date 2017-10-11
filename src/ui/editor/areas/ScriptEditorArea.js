import React from 'react';
import {ScriptMenu, ScriptContent} from './ScriptEditorArea/scriptEditor';

const ScriptEditorArea = {
    name: 'Scripts',
    menu: ScriptMenu,
    content: ScriptContent,
    sharedState: () => ({})
};

export default ScriptEditorArea;
