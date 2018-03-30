import DebugData from '../../../../DebugData';

function goto(index) {
    if (DebugData.sceneManager) {
        DebugData.sceneManager.hideMenuAndGoto(index);
    }
}

function isSelected(index) {
    const scene = DebugData.scope.scene;
    if (scene) {
        return scene.index === index;
    }
    return false;
}

const indirectSceneColor = '#AAAAAA';

function baseScene(type, index, name, children) {
    const icon = `editor/icons/locations/${type}.png`;
    if (index === -1) {
        return {name, type, children, icon, color: indirectSceneColor};
    }
    return {
        name,
        type,
        onClick: goto.bind(null, index),
        children: children || [],
        props: [
            {
                id: 'index',
                value: index,
                render: value => `#${value}`
            }
        ],
        selected: isSelected.bind(null, index),
        icon
    };
}

export const island = baseScene.bind(null, 'island');
export const section = baseScene.bind(null, 'section');
export const iso = baseScene.bind(null, 'building');

export function planet(name, icon, children) {
    return {
        type: 'planet',
        name,
        color: indirectSceneColor,
        children,
        icon: `editor/icons/locations/${icon}.png`
    };
}
