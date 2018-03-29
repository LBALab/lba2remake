import React from 'react';
import {extend} from 'lodash';
import {fullscreen} from '../styles/index';

const baseStyle = extend({background: 'black'}, fullscreen);

/**
 * @return {null}
 */
export default function Video(props) {
    if (props.video && props.renderer) {
        const width = props.renderer.canvas.clientWidth;
        const height = props.renderer.canvas.clientHeight;
        return <video
            style={baseStyle}
            autoPlay
            width={width}
            height={height}
            onEnded={props.video.callback}
        >
            <source type="video/mp4" src={props.video.src} />
        </video>;
    }
    return null;
}
