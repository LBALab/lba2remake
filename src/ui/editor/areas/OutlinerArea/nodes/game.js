import DebugData from '../../../DebugData';
import {makeVariables} from './variables';

const VarGames = makeVariables('game', 'Variables', () => {
    const game = DebugData.scope.game;
    if (game) {
        const state = game.getState();
        return state.flags.quest;
    }
    return [];
});

const Inventory = makeVariables('game', 'Inventory', () => {
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
