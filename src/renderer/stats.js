import Stats from './tools/Stats';

let stats = null;

export default function setupStats() {
    return {
        begin: () => {
            if (stats) {
                stats.begin();
            }
        },
        end: () => {
            if (stats) {
                stats.end();
            }
        }
    };
}

export function switchStats() {
    if (stats) {
        if (stats.mode === 1) {
            stats.setMode(0);
        } else {
            document.getElementById('stats').removeChild(stats.widgets[0].domElement);
            stats = null;
        }
    } else {
        stats = new Stats(1);
        stats.setMode(1); // 0: fps, 1: ms
        stats.widgets[0].domElement.style.left = '45px';
        document.getElementById('stats').appendChild(stats.widgets[0].domElement);
    }
}
