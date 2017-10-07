import React from 'react';
import {extend, map} from 'lodash';

const baseStyle = {
    position: 'absolute',
    fontFamily: 'LBA',
    textShadow: 'black 4px 4px',
    fontSize: '3em',
    whiteSpace: 'nowrap'
};

export default function TextInterjections(props) {
    return <div>
        {map(props.interjections, (itrj, id) => {
            const style = extend({
                color: itrj.color,
                left: `${itrj.x / props.pixelRatio}px`,
                top: `${itrj.y / props.pixelRatio}px`
            }, baseStyle);
            return <div key={id} style={style}>{itrj.value}</div>;
        })}
    </div>;
}
