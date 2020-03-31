import { map, drop } from 'lodash';

import IsoBrowserAreaSettings from './IsoBrowserAreaSettings';
import LocationsNode from '../../gameplay/locator/LocationsNode';
import findScenePath from '../../gameplay/locator/findScenePath';
import { loadSceneMapData } from '../../../../../scene/map';
import { makeOutlinerArea } from '../../utils/outliner';
import { getResource, ResourceType } from '../../../../../resources';
import DebugData from '../../../DebugData';

const IsoScenesNode = { children: [] };

let filterLibrary = null;

async function filterNodes(library) {
    if (library !== filterLibrary) {
        filterLibrary = library;
        let hasChanged = true;
        Object.assign(IsoScenesNode, await flattenIsoScenes(LocationsNode), {
            hasChanged: () => {
                if (hasChanged) {
                    hasChanged = false;
                    return true;
                }
                return false;
            }
        });
    }
}

async function flattenIsoScenes(location) {
    let children;
    if (location.type === 'island') {
        children = [];
        await collectIsoScenes(location, children);
    } else {
        children = [];
        for (const c of location.children) {
            const nc = await flattenIsoScenes(c);
            if (nc) {
                children.push(nc);
            }
        }
    }

    if (children.length === 0 && location.type !== 'building') {
        return null;
    }

    return {
        ...location,
        children
    };
}

async function collectIsoScenes(location, scenes, push = true) {
    if (location.type === 'building') {
        const children = [];
        for (const c of location.children) {
            children.push(await collectIsoScenes(c, scenes, false));
        }
        const newLocation = {
            ...location,
            children,
            onClick: () => {
                DebugData.scope.isoGridIdx = location.props[0].value;
            },
            selected: () => {
                return DebugData.scope.isoGridIdx === location.props[0].value;
            }
        };
        if (push && newLocation.props) {
            if (filterLibrary === -1) {
                scenes.push(newLocation);
            } else {
                const bkg = await getResource(ResourceType.BRICKS);
                const sceneMap = await loadSceneMapData();
                const gridData = new DataView(
                    bkg.getEntry(
                        sceneMap[newLocation.props[0].value].index + 1
                    )
                );
                const libIndex = gridData.getUint8(0);
                if (libIndex === filterLibrary) {
                    scenes.push(newLocation);
                }
            }
        }
        return newLocation;
    }
    for (const c of location.children) {
        await collectIsoScenes(c, scenes);
    }
    return location;
}

const IsoBrowserArea = makeOutlinerArea('iso_browser', 'Iso Grids', IsoScenesNode, {
    icon: 'folder.png',
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
        if (filterLibrary === null) {
            filterNodes(this.props.sharedState.libraryFilter);
        }
    },
    stateHandler: {
        setActivePath(activePath) {
            this.setState({activePath});
        },
        setLibraryFilter(lib) {
            filterNodes(lib);
            this.setState({libraryFilter: lib, changed: true});
        }
    },
    style: {
        background: '#111111'
    },
    hideRoot: true,
    settings: IsoBrowserAreaSettings
});

export default IsoBrowserArea;
