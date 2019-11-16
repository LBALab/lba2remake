import * as React from 'react';
import {each} from 'lodash';
import {tr} from '../../lang';

const overlay = {
    position: 'absolute' as const,
    left: 5,
    top: 5,
    textAlign: 'right' as const,
    fontFamily: 'LBA',
};

const frame = {
    color: '#ffffff',
    display: 'inline-block' as const,
    userSelect: 'none' as const,
    cursor: 'pointer' as const,
    fontSize: 14,
    background: 'rgba(0, 0, 0, 0.5)',
    border: '2px outset #ffffff',
    borderRadius: 5,
    padding: 5,
    textAlign: 'center' as const
};

export function KeyHelpIcon(props) {
    return <div style={overlay}>
        <span style={frame} onClick={props.open}>
            <img src="images/keyhelp.png"/>
            <br/>
            {tr('help')}
        </span>
    </div>;
}

const bg_style = {
    position: 'absolute' as const,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    background: 'rgba(0, 0, 0, 0.85)'
};

const wrapper_style = {
    position: 'absolute' as const,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    margin: 32,
    background: 'black',
    color: 'white',
    border: '2px outset #61cece',
    borderRadius: 12,
    overflow: 'hidden' as const
};

const canvas_wrapper = {
    position: 'absolute' as const,
    top: 28,
    left: 5,
    right: 5
};

const canvas_style = {
    width: '100%'
};

const closeStyle = {
    position: 'absolute' as const,
    top: 2,
    right: 8,
    width: 24,
    height: 24,
    cursor: 'pointer' as const
};

const onKeyDown = (close, e) => {
    const key = e.code || e.which || e.keyCode;
    if (key === 'Escape' || key === 27) {
        close();
    }
    e.stopPropagation();
};

const onKeyUp = (e) => {
    e.stopPropagation();
};

const labels = () => [
    {
        name: 'WASD',
        x: 202,
        y: 250,
        fontSize: 22,
        textAlign: 'right',
        text: tr('MoveCameraEditor')
    },
    {
        name: '1,2,3,4',
        x: 560,
        y: 65,
        fontSize: 22,
        textAlign: 'center',
        text: tr('SelectBehaviour')
    },
    {
        name: 'F',
        x: 746,
        y: 102,
        fontSize: 22,
        textAlign: 'left',
        text: tr('ShowFPS')
    },
    {
        name: 'P',
        x: 1074,
        y: 114,
        fontSize: 22,
        textAlign: 'left',
        text: tr('Pause')
    },
    {
        name: 'Enter',
        x: 1390,
        y: 330,
        fontSize: 22,
        textAlign: 'left',
        text: tr('SkipDialogs')
    },
    {
        name: 'Arrows',
        x: 1165,
        y: 576,
        fontSize: 22,
        textAlign: 'left',
        text: tr('WalkRun')
    },
    {
        name: 'Space',
        x: 902,
        y: 538,
        fontSize: 20,
        textAlign: 'left',
        text: tr('ActionJumpFightCrouch')
    },
    {
        name: 'C',
        x: 864,
        y: 586,
        fontSize: 22,
        textAlign: 'center',
        text: tr('CameraEditor')
    },
    {
        name: 'X',
        x: 716,
        y: 568,
        fontSize: 22,
        textAlign: 'center',
        text: tr('Dodge')
    },
    {
        name: 'Alt',
        x: 462,
        y: 545,
        fontSize: 22,
        textAlign: 'left',
        text: tr('WeaponWIP')
    },
    {
        name: 'Z',
        x: 332,
        y: 574,
        fontSize: 22,
        textAlign: 'right',
        text: tr('Action')
    }
];

const onCanvas = (canvas) => {
    if (canvas) {
        canvas.width = 1635;
        canvas.height = 630;
        const ctx = canvas.getContext('2d');

        const icon = new Image(canvas.width, canvas.height);
        icon.src = 'images/keyboard.png';

        icon.onload = () => {
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'white';
            ctx.shadowColor = 'black';
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            ctx.drawImage(icon, 0, 0);
            each(labels(), (label) => {
                ctx.textAlign = label.textAlign;
                ctx.font = `${label.fontSize}px LBA`;
                const lines = label.text.split('\n');
                each(lines, (line, idx: number) => {
                    ctx.fillText(line, label.x, label.y + (idx * label.fontSize));
                });
            });
        };
    }
};

export function KeyHelpScreen(props) {
    const onRef = (ref) => {
        if (ref) {
            ref.focus();
        }
    };

    return <div
        ref={onRef}
        style={bg_style}
        onClick={props.close}
        onKeyDown={onKeyDown.bind(null, props.close)}
        onKeyUp={onKeyUp}
        tabIndex={0}
    >
        <div style={wrapper_style} onClick={e => e.stopPropagation()}>
            <div style={canvas_wrapper}>
                <canvas style={canvas_style} ref={onCanvas}/>
            </div>
            <img style={closeStyle} src="./editor/icons/close.svg" onClick={props.close}/>
        </div>
    </div>;
}
