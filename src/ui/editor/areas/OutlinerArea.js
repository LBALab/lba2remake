import {map, drop} from 'lodash';
import {SceneNode} from './OutlinerArea/nodes/scene';
import {makeOutlinerArea} from './OutlinerArea/factory';
import {findScenePath, LocationsNode, LocatorMenu} from './OutlinerArea/nodes/locations/index';
import DebugData from '../DebugData';

export const SceneOutliner = makeOutlinerArea('scene_outliner', 'Scene', SceneNode, {
    icon: 'scene.png'
});

export const Locator = makeOutlinerArea('locator', 'Locator', LocationsNode, {
    menu: LocatorMenu,
    icon: 'holomap.png',
    frame() {
        const scene = DebugData.scope.scene;
        if (scene !== this.scene) {
            this.scene = scene;
            if (scene) {
                const path = findScenePath(LocationsNode, scene.index);
                if (path) {
                    const activePath = map(drop(path), node => node.name);
                    this.props.stateHandler.setActivePath(activePath);
                }
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
    }
});

const obj = (data, root) => data || (root && root()) || [];
const keys = (data, root) => Object.keys(obj(data, root));

const WatcherNode = (name, root = () => DebugData.scope) => ({
    dynamic: true,
    name: () => name,
    numChildren: data => keys(data, root).length,
    child: (data, idx) => WatcherNode(keys(data, root)[idx], null),
    childData: (data, idx) => {
        const k = keys(data, root)[idx];
        return obj(data, root)[k];
    }
});

export const Watcher = makeOutlinerArea('watcher', 'Watcher', WatcherNode('Watcher'), {
    icon: 'holomap.png',
    style: {
        background: '#111111'
    }
});

export const IslandOutliner = makeOutlinerArea('islands_list', 'Islands', {
    name: 'Islands',
    children: []
});

