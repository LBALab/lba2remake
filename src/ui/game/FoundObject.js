import React from 'react';

const baseStyle = {
    position: 'absolute',
    top: 30,
    left: 30,
    width: 100,
    height: 100,
    background: 'rgba(0, 0, 0, 0.5)',
    border: '2px outset #61cece',
    borderRadius: 15
};

/**
 * @return {null}
 */
export default function FoundObject(props) {
    if (props.foundObject !== null) {
        return <div style={baseStyle}/>;
    }
    return null;
}
