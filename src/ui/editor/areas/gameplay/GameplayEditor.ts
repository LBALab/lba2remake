import {clone} from 'lodash';
import GameWindow from '../../../GameWindow';
import InspectorArea from '../shared/InspectorArea/InspectorArea';
import DevToolsArea from '../shared/DevToolsArea/DevToolsArea';
import SceneArea from './scene/SceneArea';
import LocatorArea from './locator/LocatorArea';
import PaletteArea from './palette/PaletteArea';
import SceneGraphArea from './sceneGraph/SceneGraphArea';
import GameplayEditorSettings from './GameplayEditorSettings';
import {Orientation, Type} from '../../layout';
import {ZONE_TYPE} from '../../../../game/zones';
import ScriptsEditorArea from './scripts/ScriptsEditorArea';

const GameplayEditor = {
    id: 'game',
    name: 'Gameplay Editor',
    settings: GameplayEditorSettings,
    content: GameWindow,
    icon: 'game.png',
    mainArea: true,
    getInitialState: () => ({
        labels: {
            actor: false,
            zone: false,
            point: false,
            zoneTypes: clone(ZONE_TYPE)
        },
        fog: true,
        objectToAdd: null,
    }),
    stateHandler: {
        setLabel(type, value) {
            const labels = clone(this.state.labels);
            labels[type] = value;
            this.setState({labels});
        },
        setZoneTypeLabel(type, enabled) {
            const zoneTypes = new Set(this.state.labels.zoneTypes);
            if (enabled) {
                zoneTypes.add(type);
            } else {
                zoneTypes.delete(type);
            }
            this.setState({
                labels: {
                    ...this.state.labels,
                    zoneTypes: Array.from(zoneTypes)
                }
            });
        },
        setFog(fog) {
            this.setState({ fog });
        },
        setAddingObject(type, details) {
            if (type) {
                this.setState({ objectToAdd: { type, details } });
            } else {
                this.setState({ objectToAdd: null });
            }
        }
    },
    toolAreas: [
        SceneArea,
        SceneGraphArea,
        ScriptsEditorArea,
        LocatorArea,
        InspectorArea,
        DevToolsArea,
        PaletteArea,
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
                    { type: Type.AREA, content_id: 'script_editor' },
                    { type: Type.AREA, content_id: 'changelog' }
                ]
            },
            {
                type: Type.LAYOUT,
                orientation: Orientation.VERTICAL,
                splitAt: 70,
                children: [
                    {
                        type: Type.LAYOUT,
                        orientation: Orientation.VERTICAL,
                        splitAt: 50,
                        children: [
                            { type: Type.AREA, content_id: 'scene_outliner' },
                            { type: Type.AREA, content_id: 'locator' }
                        ]
                    },
                    { type: Type.AREA, content_id: 'inspector' }
                ]
            }
        ]
    }
};

export default GameplayEditor;
