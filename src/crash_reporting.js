import React from "react";
import {version} from "../package.json";
import DebugData from "./ui/editor/DebugData";
import {extend, omit, pick} from "lodash";
import {bigButton, center, editor as editor_style, fullscreen} from "./ui/styles";

let sent_report = false;

export function sendCrashReport(error) {
    if (sent_report)
        return;

    const request = new XMLHttpRequest();
    request.open('POST', 'crash/report', true);
    request.onload = function() {
        console.log(`Sent crash report.`);
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
    return <div style={bsod_style}>
        <div style={center_vert}>
            <img src="images/broken.png"/>
            <h1>Ooops! Something went wrong...</h1>
            <b>Error: </b>
            <i style={{color: 'red'}}>{props.error.message}</i>
            <hr style={{margin: '3em 6em'}}/>
            <button style={bigButton} onClick={sendCrashReport.bind(null, props.error)}>Send crash report</button>
            <button style={bigButton} onClick={reload}>Reload app!</button>
        </div>
    </div>;
}
