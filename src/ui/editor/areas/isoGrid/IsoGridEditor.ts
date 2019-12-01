import IsoGridEditorContent from './IsoGridEditorContent';
import IsoGridEditorSettings from './IsoGridEditorSettings';
import {Orientation, Type} from '../../layout';
import InspectorArea from '../shared/InspectorArea/InspectorArea';
import LocationsNode from '../gameplay/locator/LocationsNode';
import { makeOutlinerArea } from '../utils/outliner';
import DebugData from '../../DebugData';
import findScenePath from '../gameplay/locator/findScenePath';
import { map, drop, each } from 'lodash';

const IsoScenesNode = flattenIsoScenes(LocationsNode);

function flattenIsoScenes(location) {
    let children;
    if (location.type === 'island') {
        children = [];
        collectIsoScenes(location, children);
    } else {
        children = map(location.children, flattenIsoScenes);
    }

    return {
        ...location,
        children
    };
}

function collectIsoScenes(location, scenes, push = true) {
    if (location.type === 'building') {
        const newLocation = {
            ...location,
            children: map(location.children, c => collectIsoScenes(c, scenes, false)),
            onClick: () => {
                DebugData.scope.isoGridIdx = location.props[0].value;
            }
        };
        if (push) {
            scenes.push(newLocation);
        }
        return newLocation;
    }
    each(location.children, c => collectIsoScenes(c, scenes));
    return location;
}

const IsoBrowserArea = makeOutlinerArea('iso_browser', 'Browser', IsoScenesNode, {
    icon: 'holomap.png',
    frame() {
        const isoGridIdx = DebugData.scope.isoGridIdx;
        if (isoGridIdx !== this.isoGridIdx) {
            this.isoGridIdx = isoGridIdx;
            const path = findScenePath(IsoScenesNode, isoGridIdx);
            if (path) {
                const activePath = map(drop(path), (node: any) => node.name);
                this.props.stateHandler.setActivePath(activePath);
            }
        }
    },
    stateHandler: {
        setActivePath(activePath) {
            this.setState({activePath});
        }
    },
    style: {
        background: '#111111'
    },
    hideRoot: true
});

const IsoGridEditor = {
    id: 'iso_grid',
    name: 'Iso Grids Editor',
    icon: 'layout.png',
    content: IsoGridEditorContent,
    settings: IsoGridEditorSettings,
    mainArea: true,
    getInitialState: () => ({}),
    stateHandler: {},
    toolAreas: [
        IsoBrowserArea,
        InspectorArea
    ],
    defaultLayout: {
        type: Type.LAYOUT,
        orientation: Orientation.HORIZONTAL,
        splitAt: 70,
        children: [
            { type: Type.AREA, content_id: 'iso_grid', root: true },
            { type: Type.AREA, content_id: 'iso_browser' }
        ]
    }
};

export default IsoGridEditor;
