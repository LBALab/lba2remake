import Stats from './tools/Stats';
import { pure } from '../utils/decorators';

let stats = null;

class StatsHandler {
    begin() {
        if (stats) {
            stats.begin();
        }
    }

    end() {
        if (stats) {
            stats.end();
        }
    }

    @pure()
    getStats() {
        return stats;
    }
}

export default function setupStats() {
    return new StatsHandler();
}

export function switchStats() {
    if (stats) {
        const elem = document.getElementById('stats');
        if (elem) {
            elem.removeChild(stats.widgets[0].domElement);
        }
        stats = null;
    } else {
        stats = new Stats(1);
        stats.widgets[0].domElement.style.left = '45px';
        const elem = document.getElementById('stats');
        if (elem) {
            elem.appendChild(stats.widgets[0].domElement);
        }
    }
}
