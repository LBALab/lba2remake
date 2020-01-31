import DebugData from '../../../../DebugData';

function goto(index) {
    gotoWithArgs(index, DebugData.scope && DebugData.scope.game, DebugData.sceneManager);
}

function gotoWithArgs(index, game, sceneManager) {
    if (game && sceneManager && sceneManager.hideMenuAndGoto) {
        const uiState = game.getUiState();
        const wasPaused = game.isPaused() && !uiState.video && !uiState.showMenu;
        if (uiState.video) {
            game.setUiState({video: null});
        }
        sceneManager.hideMenuAndGoto(index, wasPaused);
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
    const icon = `editor/icons/locations/${type}.svg`;
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
        icon,
        goto: (game, sceneManager) => gotoWithArgs(index, game, sceneManager),
        sceneIndex: index
    };
}

export function island(index, name, id, children) {
    return {
        ...baseScene('island', index, name, children),
        id
    };
}

export const section = baseScene.bind(null, 'section');
export const iso = baseScene.bind(null, 'building');

export function planet(name, icon, children) {
    return {
        type: 'planet',
        name,
        color: indirectSceneColor,
        children,
        icon: `editor/icons/locations/${icon}.svg`
    };
}
