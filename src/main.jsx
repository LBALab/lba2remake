// @flow

import {each} from 'lodash';
import {getQueryParams} from './utils';
import * as debugFlags from './debugFlags';

import {createGame} from './game';

window.onload = function() {
    const params = getQueryParams();
    each(params, (value, param) => {
        if (param in debugFlags) {
            debugFlags[param] = (value == 'true');
        }
    });
    const isMobile = /Mobile|webOS|iPhone|iPod|iOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || params.mobile;

    const game = createGame(params, isMobile, (sceneManager) => {
        window.addEventListener('hashchange', () => {
            const newParams = getQueryParams();
            if (newParams.scene == params.scene) {
                window.location.reload();
            } else if ('scene' in newParams) {
                sceneManager.goto(parseInt(newParams.scene));
            }
        }, false);
    });

    game.run();
};
