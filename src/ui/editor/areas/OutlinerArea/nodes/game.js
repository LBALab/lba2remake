import {slice} from 'lodash';

import DebugData from '../../../DebugData';
import {makeVariables} from './variables';

const VarGames = makeVariables('vargame', 'Variables', () => {
    const game = DebugData.scope.game;
    if (game) {
        const state = game.getState();
        return state.flags.quest;
    }
    return [];
});

const Inventory = makeVariables('vargame', 'Inventory', () => {
    const game = DebugData.scope.game;
    if (game) {
        const state = game.getState();
        return slice(state.flags.quest, 0, 40);
    }
    return [];
});

export const GameNode = {
    name: 'Game',
    children: [
        VarGames,
        Inventory
    ]
};
