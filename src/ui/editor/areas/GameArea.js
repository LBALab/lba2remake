import React from 'react';
import Game from '../../Game';
import {clone} from 'lodash';
import ScriptEditorArea from './ScriptEditorArea';
import DebugHUDArea from './DebugHUDArea';
import OutlinerArea from './OutlinerArea';
import {GameMenu} from "./GameArea/menu";
import {Orientation, Type} from '../layout';

const GameArea = {
    id: 'game',
    name: 'Gameplay Editor',
    menu: GameMenu,
    content: Game,
    mainArea: true,
    getInitialState: () => ({
        labels: {
            actor: false,
            zone: false,
            point: false
        }
    }),
    stateHandler: {
        setLabel: function (type, value) {
            const labels = clone(this.state.labels);
            labels[type] = value;
            this.setState({labels});
        }
    },
    toolAreas: [
        ScriptEditorArea,
        DebugHUDArea,
        OutlinerArea
    ],
    defaultLayout: {
        type: Type.LAYOUT,
        orientation: Orientation.HORIZONTAL,
        splitAt: 60,
        children: [
            {
                type: Type.LAYOUT,
                orientation: Orientation.VERTICAL,
                splitAt: 70,
                children: [
                    { type: Type.AREA, content_id: 'game', root: true },
                    { type: Type.AREA, content_id: 'dbg_hud' }
                ]
            },
            {
                type: Type.LAYOUT,
                orientation: Orientation.VERTICAL,
                splitAt: 50,
                children: [
                    { type: Type.AREA, content_id: 'script_editor' },
                    { type: Type.AREA, content_id: 'outliner' }
                ]
            }
        ]
    }
};

export default GameArea;
