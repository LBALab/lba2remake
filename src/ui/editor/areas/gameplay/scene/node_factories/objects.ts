import {extend} from 'lodash';
import DebugData, {locateObject} from '../../../../DebugData';

export function makeObjectsNode(type, base) {
    const onSelect = (scene, index) => locateObject(scene[`${type}s`][index]);
    return extend(base, {
        up: (scene, collapsed) => {
            const selection = DebugData.selection;
            if (!collapsed && selection && selection.type === type) {
                selection.index = selection.index > 0 ?
                    selection.index - 1
                    : scene[`${type}s`].length - 1;
                onSelect(scene, selection.index);
            }
        },
        down: (scene, collapsed) => {
            const selection = DebugData.selection;
            if (!collapsed && selection && selection.type === type) {
                selection.index = selection.index < scene[`${type}s`].length - 1 ?
                    selection.index + 1
                    : 0;
                onSelect(scene, selection.index);
            }
        }
    });
}
