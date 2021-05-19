import * as React from 'react';
import {extend, omit} from 'lodash';
import {version} from '../package.json';
import DebugData from './ui/editor/DebugData';
import {bigButton, center, editor as editor_style, fullscreen} from './ui/styles';

let sent_report = false;

export function sendCrashReport(error) {
    if (sent_report)
        return;

    const request = new XMLHttpRequest();
    request.open('POST', 'crash', true);
    request.onload = () => {
        // tslint:disable-next-line:no-console
        console.log('Sent crash report.');
        sent_report = true;
    };

    const content = {
        error,
        version,
        url: location.href,
        browser: navigator.userAgent,
        data: getCrashReportData()
    };

    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify(content));
}

function getCrashReportData() {
    const data = {
        loading: null,
        paused: null,
        scene: null,
        heroState: null,
        params: null,
        uiState: null,
        clock: null,
        controlsState: null,
        gameState: null,
        vr: null
    };
    const scope = DebugData.scope;
    if (scope) {
        const game = scope.game;
        if (game) {
            data.loading = game.isLoading();
            data.paused = game.isPaused();
            data.clock = game.clock;
            data.controlsState = game.controlsState;
            data.gameState = omit(game.getState(), 'hero', 'flags');
            data.vr = game.vr;
        }
        const scene = scope.scene;
        if (scene) {
            data.scene = scene.index;
        }
        const hero = scope.hero;
        if (hero) {
            data.heroState = hero.state;
        }
        const params = scope.params;
        if (params) {
            data.params = params;
        }
        const uiState = scope.uiState;
        if (uiState) {
            data.uiState = uiState;
        }
    }
    return data;
}

const bsod_style = extend({}, fullscreen, editor_style.base);
const center_vert = extend({}, center, {
    left: 0,
    right: 0,
    transform: 'translate(0, -50%)',
    textAlign: 'center' as const
});

const reload = () => location.reload();

export function CrashHandler(props) {
    return <div style={bsod_style}>
        <div style={center_vert}>
            <img src="images/broken.png"/>
            <h1>Ooops! Something went wrong...</h1>
            <div>
                <b>Error: </b>
                <i style={{color: 'red'}}>{props.error.message}</i>
            </div>
            <hr style={{margin: '3em 6em'}}/>
            <button style={bigButton} onClick={sendCrashReport.bind(null, props.error)}>
                Send crash report
            </button>
            <button style={bigButton} onClick={reload}>Reload app!</button>
        </div>
    </div>;
}
