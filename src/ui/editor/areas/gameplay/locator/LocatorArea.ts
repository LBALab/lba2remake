import {map, drop} from 'lodash';
import {makeOutlinerArea} from '../../utils/outliner';
import findScenePath from './findScenePath';
import LocationsNode from './LocationsNode';
import DebugData from '../../../DebugData';

const LocatorArea = makeOutlinerArea('locator', 'Locator', LocationsNode, {
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
    },
    hideRoot: true
});

export default LocatorArea;
