import {each} from 'lodash';
import FrameListener from './FrameListener';

export default class Ticker {
    listeners: Array<FrameListener> = [];

    constructor() {
        this.listeners = [];
    }

    register(component: FrameListener) {
        this.listeners.push(component);
    }

    unregister(component: FrameListener) {
        const idx = this.listeners.indexOf(component);
        if (idx !== -1) {
            this.listeners.splice(idx, 1);
        }
    }

    run() {
        const that = this;
        function frame() {
            each(that.listeners, (component) => {
                if (component) {
                    component.frame();
                }
            });
            requestAnimationFrame(frame);
        }
        frame();
    }
}
