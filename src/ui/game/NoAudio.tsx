import * as React from 'react';

const buttonStyle = {
    color: 'white',
    background: 'rgba(32, 162, 255, 0.5)',
    border: '2px outset #61cece',
    borderRadius: 12,
    fontSize: '1.4em',
    cursor: 'pointer',
};

const NoAudio = ({ onClick }) => {
    return (
        <div style={{
            position: 'absolute',
            right: '5px',
            bottom: '5px',
        }}>
            <button style={buttonStyle} onClick={onClick} title="Click here to enable autoplay Audio for this session">
                <img
                    src="images/no-audio.svg"
                    width="30"
                    height="30"
                />
            </button>
        </div>
    );
};

export default NoAudio;
