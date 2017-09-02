// @flow

import {parseQueryParams} from './utils';
import {createGame} from './game';
import {initDebugHUD} from './game/debugHUD';

window.onload = function() {
    const params = parseQueryParams();
    const isMobile = /Mobile|webOS|iPhone|iPod|iOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || params.mobile;

    initDebugHUD();

    const game = createGame(params, isMobile, (sceneManager) => {
        window.addEventListener('hashchange', () => {
            const newParams = parseQueryParams();
            if ('scene' in newParams) {
                sceneManager.goto(parseInt(newParams.scene));
            }
        }, false);
    });

    game.preload(game.run);
};
