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
        },
        /* @inspector(locate, pure) */
        getStats: () => stats
    };
}

export function switchStats() {
    if (stats) {
        document.getElementById('stats').removeChild(stats.widgets[0].domElement);
        stats = null;
    } else {
        stats = new Stats(1);
        stats.widgets[0].domElement.style.left = '45px';
        document.getElementById('stats').appendChild(stats.widgets[0].domElement);
    }
}
