import React from 'react';
import {extend, omit} from 'lodash';
import {version} from '../package.json';
import DebugData from './ui/editor/DebugData';
import {bigButton, center, editor as editor_style, fullscreen} from './ui/styles';

let sent_report = false;

export class EngineError extends Error {
    constructor(type) {
        super();
        this.name = 'EngineError';
        this.type = type;
    }
}

export function sendCrashReport(error) {
    if (sent_report)
        return;

    const request = new XMLHttpRequest();
    request.open('POST', 'ws/crash/report', true);
    request.onload = () => {
        // eslint-disable-next-line no-console
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

    request.send(JSON.stringify(content, null, 2));
}

function getCrashReportData() {
    const data = {};
    const scope = DebugData.scope;
    if (scope) {
        const game = scope.game;
        if (game) {
            data.loading = game.isLoading();
            data.paused = game.isPaused();
        }
        const scene = scope.scene;
        if (scene) {
            data.scene = scene.index;
        }
        const params = scope.params;
        if (params) {
            data.params = params;
        }
        const ui = scope.ui;
        if (ui) {
            data.ui = omit(ui, 'scene');
        }
        const clock = scope.clock;
        if (clock) {
            data.clock = clock;
        }
    }
    return data;
}

const bsod_style = extend({}, fullscreen, editor_style.base);
const center_vert = extend({}, center, {
    left: 0,
    right: 0,
    transform: 'translate(0, -50%)',
    textAlign: 'center'
});

const reload = () => location.reload();

export function CrashHandler(props) {
    let report_on = true;
    let reload_on = true;
    let message = <div>
        <b>Error: </b>
        <i style={{color: 'red'}}>{props.error.message}</i>
    </div>;
    if (props.error.data && props.error.data.name === 'EngineError') {
        if (props.error.data.type === 'webgl') {
            report_on = false;
            reload_on = false;
            message = <div>
                It seems like your browser does not support WebGL.<br/>
                Check out why <a href="https://get.webgl.org/">here.</a><br/>
                WebGL is required to run this game.
            </div>;
        }
    }
    return <div style={bsod_style}>
        <div style={center_vert}>
            <img src="images/broken.png"/>
            <h1>Ooops! Something went wrong...</h1>
            {message}
            {(report_on || reload_on) ? <hr style={{margin: '3em 6em'}}/> : null}
            {report_on ?
                <button style={bigButton} onClick={sendCrashReport.bind(null, props.error)}>
                    Send crash report
                </button>
                : null}
            {reload_on ? <button style={bigButton} onClick={reload}>Reload app!</button> : null}
        </div>
    </div>;
}
