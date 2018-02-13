import React from 'react';

const overlay = {
    position: 'absolute',
    right: 2,
    top: 2,
};

export default function Ribbon() {
    return <div style={overlay}>
        <img src="images/11_sprite_lba2.png" />
    </div>;
}
