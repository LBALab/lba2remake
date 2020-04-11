import * as React from 'react';
import {extend} from 'lodash';
import {fullscreen} from '../styles/index';

const baseStyle = extend({background: 'black'}, fullscreen);

/**
 * @return {null}
 */
export default function Video({ video, renderer}) {
    if (video && video.path && renderer) {
        const width = renderer.canvas.clientWidth;
        const height = renderer.canvas.clientHeight;
        return <video
            style={baseStyle}
            autoPlay
            width={width}
            height={height}
            onEnded={video.onEnded}
            onError={video.onEnded}
        >
            <source
                type="video/mp4"
                src={`data/${video.path}`}
            />
        </video>;
    }
    return null;
}
