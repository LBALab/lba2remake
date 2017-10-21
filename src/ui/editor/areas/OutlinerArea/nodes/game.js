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

const Inventory = makeVariables('inventory', 'Inventory', () => {
    const game = DebugData.scope.game;
    if (game) {
        const state = game.getState();
        return state.flags.inventory;
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
