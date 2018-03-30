import React from 'react';
import Markdown from 'react-remarkable';

import {fullscreen} from '../../../styles/index';
import FrameListener from '../../../utils/FrameListener';

export default class ChangeLog extends FrameListener {
    constructor(props) {
        super(props);
        this.frame = this.frame.bind(this);

        if (props.mainData) {
            this.state = props.mainData.state;
        } else {
            this.state = {};
        }
        loadChangeLog((input) => { this.state.input = input; this.forceUpdate(); });
    }

    frame() {

    }

    render() {
        return <div style={fullscreen}>
            <div style={{ margin: '5px' }}>
                <Markdown source={this.state.input} />
            </div>
        </div>;
    }
}

function loadChangeLog(callback) {
    const request = new XMLHttpRequest();
    request.open('GET', 'CHANGES.md', true);

    request.onload = function onload() {
        if (this.status === 200) {
            try {
                callback(request.response);
            } catch (e) {}
        }
    };

    request.send(null);
}
