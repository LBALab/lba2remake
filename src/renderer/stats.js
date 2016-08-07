import Stats from './tools/Stats';
import {GameEvents} from '../game/events';

export default function setupStats(useVR) {
    let stats = null;

    function switchStats() {
        if (stats) {
            if (stats.mode == 1) {
                stats.setMode(0);
            } else {
                document.getElementById('stats1').removeChild(stats.widgets[0].domElement);
                if (stats.widgets.length == 2) {
                    document.getElementById('stats2').removeChild(stats.widgets[1].domElement);
                }
                stats = null;
            }
        }
        else {
            if (useVR) {
                stats = new Stats(2);
                stats.setMode(1); // 0: fps, 1: ms
                stats.widgets[0].domElement.style.left = '50%';
                stats.widgets[0].domElement.style.top = '100px';
                stats.widgets[1].domElement.style.left = '50%';
                stats.widgets[1].domElement.style.top = '100px';
                document.getElementById('stats1').appendChild(stats.widgets[0].domElement);
                document.getElementById('stats2').appendChild(stats.widgets[1].domElement);
            }
            else {
                stats = new Stats(1);
                stats.setMode(1); // 0: fps, 1: ms
                stats.widgets[0].domElement.style.left = '45px';
                document.getElementById('stats1').appendChild(stats.widgets[0].domElement);
            }
        }
    }

    GameEvents.Debug.SwitchStats.addListener(switchStats);
    return {
        begin: () => {
            stats && stats.begin();
        },
        end: () => {
            stats && stats.end();
        },
        dispose: () => {
            GameEvents.Debug.SwitchStats.removeListener(switchStats);
            if (stats) {
                switchStats();
            }
        }
    };
}
