import * as React from 'react';
import { map, take, drop } from 'lodash';
import convert from 'color-convert';
import { scopeColors } from './blocksLibrary/utils';
import { fullscreen } from '../../../../styles';
import DebugData from '../../../DebugData';

const darker = (c) => {
    const hsl = convert.hex.hsl(c);
    hsl[2] = Math.round(hsl[2] * 0.5);
    return `#${convert.hsl.hex(hsl)}`;
};

const scopeStyle = (type, selected) => ({
    display: 'inline-block' as const,
    color: selected ? 'white' : 'rgb(150, 150, 150)',
    fontSize: 14,
    width: '50%',
    height: 30,
    borderRadius: 5,
    boxShadow: selected ? 'inset 0px 0px 0px 1px rgba(255, 255, 255, 0.9)' : 'none',
    lineHeight: '30px',
    textAlign: 'center' as const,
    verticalAlign: 'middle' as const,
    cursor: 'pointer' as const,
    userSelect: 'none' as const,
    background: selected ? scopeColors[type] : darker(scopeColors[type]),
    overflow: 'hidden' as const
});

const innerStyle = {
    position: 'absolute' as const,
    overflowY: 'auto' as const,
    overflowX: 'hidden' as const,
    left: 0,
    right: 0,
    bottom: 0,
    top: 60,
    padding: 6
};

const mainStyle = {
    ...fullscreen,
    background: 'rgb(45,45,48)'
};

const sepStyle = {
    border: '1px dashed rgb(80, 80, 80)',
    margin: 0,
    padding: 0
};

const varMapper = (ctx, value, baseIdx) => {
    const idx = ctx.offset
        ? baseIdx + ctx.offset
        : baseIdx;
    let data = {
        name: `var_${idx}`
    };
    switch (ctx.type) {
        case 'game':
            const gameMD = DebugData.metadata.game;
            if (gameMD.vargames && gameMD.vargames[idx]) {
                data = gameMD.vargames[idx];
            }
            break;
        case 'scene':
            const sceneMD = DebugData.metadata.scenes[ctx.sceneIndex];
            if (sceneMD && sceneMD.varcubes && sceneMD.varcubes[idx]) {
                data = sceneMD.varcubes[idx];
            }
            break;
    }

    return {
        ...data,
        value
    };
};

const mapVariables = (vars, ctx) => map(vars, varMapper.bind(null, ctx));

const scopes = [
    {
        id: 'game',
        name: 'Game',
        list: () => {
            const game = DebugData.scope.game;
            if (!game) {
                return [];
            }
            const vars = game.getState().flags.quest;
            return mapVariables(drop(vars, 40), { offset: 40, type: 'game' });
        }
    },
    {
        id: 'inventory',
        name: 'Inventory',
        list: (_ctx) => {
            const game = DebugData.scope.game;
            if (!game) {
                return [];
            }
            const vars = game.getState().flags.quest;
            return mapVariables(take(vars, 40), { type: 'game' });
        }
    },
    {
        id: 'scene',
        name: 'Scene',
        list: ({scene}) => {
            if (!scene) {
                return [];
            }
            return mapVariables(scene.variables, {
                type: 'scene',
                sceneIndex: scene.index
            });
        }
    },
    {
        id: 'actor',
        name: 'Actor',
        list: (_ctx) => {
            return [];
        }
    },
];

interface Props {
    scene: any;
}

interface State {
    scope: number;
}

export default class VariablesPanel extends React.Component<Props, State> {
    constructor(props) {
        super(props);

        this.state = {
            scope: 0
        };
    }

    selectScope(idx) {
        this.setState({ scope: idx });
    }

    render() {
        const nameStyle = {
            display: 'inline-block',
            maxWidth: '80%',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        };
        return <div style={mainStyle}>
            <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 30}}>
                {scopes.map((scope, idx) =>
                    <div key={idx}
                            style={scopeStyle(scope.id, idx === this.state.scope)}
                            onClick={this.selectScope.bind(this, idx)}>
                        {scope.name}
                    </div>)}
            </div>
            <div style={innerStyle}>
                {scopes[this.state.scope].list(this.props).map((v: any, idx, list) => {
                    return <React.Fragment key={idx}>
                        <div style={{padding: '3px 0'}}>
                            <span style={nameStyle}>
                                {v.name}
                            </span>
                            &nbsp;
                            <span style={{float: 'right'}}>
                                {v.value}
                            </span>
                        </div>
                        {idx + 1 < list.length && <hr style={sepStyle}/>}
                    </React.Fragment>;
                })}
            </div>
        </div>;
    }
}
