// @flow
import {each} from 'lodash';
import FrameListerner from './FrameListener';

export default class Ticker {
    listeners: [];

    constructor() {
        this.listeners = [];
    }

    register(component: FrameListerner) {
        this.listeners.push(component);
    }

    unregister(component: FrameListerner) {
        const idx = this.listeners.indexOf(component);
        if (idx !== -1) {
            this.listeners.splice(idx, 1);
        }
    }

    run() {
        const that = this;
        function frame() {
            each(that.listeners, (component) => {
                component && component.frame();
            });
            requestAnimationFrame(frame);
        }
        frame();
    }
}
