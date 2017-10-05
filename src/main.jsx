// @flow
import {createGame} from './game';

window.onload = function() {
    const game = createGame();
    game.preload(game.run);
};
