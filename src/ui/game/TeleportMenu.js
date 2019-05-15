import React from 'react';
import {map, filter} from 'lodash';
import LocationsNode from '../editor/areas/gameplay/locator/LocationsNode';

const style = {
    position: 'absolute',
    top: 75,
    bottom: 75,
    left: 50,
    right: 50,
    border: '2px outset #61cece',
    borderRadius: 12,
    background: 'black',
    overflow: 'hidden'
};

const planetStyle = selected => ({
    display: 'inline-block',
    color: selected ? 'white' : 'rgb(100, 100, 100)',
    fontSize: 14,
    fontFamily: 'LBA',
    width: '25%',
    textAlign: 'center',
    verticalAlign: 'middle',
    cursor: 'pointer',
    userSelect: 'none',
    textShadow: selected ? 'black 3px 3px' : 'rgb(20, 20, 20) 3px 3px',
    background: selected ? 'rgba(32, 162, 255, 0.5)' : 'transparent',
    overflow: 'hidden',
    borderRadius: selected ? 10 : 0,
    padding: '12px 0'
});

const rootNodeStyle = {
    display: 'inline-block',
    color: 'white',
    fontSize: 14,
    fontFamily: 'LBA',
    textAlign: 'center',
    verticalAlign: 'top',
    cursor: 'pointer',
    userSelect: 'none',
    textShadow: 'rgb(20, 20, 20) 3px 3px',
    overflow: 'hidden',
    padding: 8
};

const headerStyle = {
    border: '2px outset #61cece',
    borderRadius: 12,
    margin: -2,
    background: 'black',
    height: 75,
    marginBottom: 8,
};

const contentStyle = {
    position: 'absolute',
    overflow: 'auto',
    padding: 0,
    top: 88,
    left: 0,
    right: 0,
    bottom: 8
};

const planetIconStyle = {
    width: 32,
    height: 32
};

export default class TeleportMenu extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            planet: 0
        };
    }

    render() {
        const select = idx => this.setState({planet: idx});
        const planets = LocationsNode.children;
        const selectedPlanet = planets[this.state.planet];
        return <div className={`${this.props.inGameMenu ? 'bgInGameMenu' : 'bgMenu'} fullscreen`} onClick={this.props.exit}>
            <div style={style}>
                <div style={headerStyle}>
                    {planets.map((planet, idx) =>
                        <div
                            key={planet.name}
                            style={planetStyle(this.state.planet === idx)}
                            onClick={(e) => {
                                select(idx);
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                        >
                            <img style={planetIconStyle} src={planet.icon}/><br/>
                            {planet.name}
                        </div>)}
                </div>
                <div style={contentStyle}>
                    <div>
                        {this.renderNode(selectedPlanet, 0)}
                    </div>
                </div>
            </div>
        </div>;
    }

    renderNode(node, level) {
        const goto = (e, child) => {
            if (child.goto) {
                child.goto(this.props.game, this.props.sceneManager);
                this.props.exit(e);
            }
            e.preventDefault();
            e.stopPropagation();
        };
        const children = filter(node.children, n => !n.name.match(/^\[DEMO\]/));
        return <div style={{color: 'white'}}>
            {map(children, (child) => {
                const childStyle = level === 0 ? rootNodeStyle : {
                    textAlign: 'left',
                    fontSize: 12,
                    background: 'rgb(45, 45, 45)',
                    paddingTop: 8,
                    paddingLeft: level * 8
                };
                return <div key={child.name} style={childStyle}>
                    <span onClick={e => goto(e, child)}>
                        <img style={{width: 16, height: 16}} src={child.icon}/>&nbsp;
                        {child.name}
                    </span>
                    {level === 0 && child.children && child.children.length > 0 && <hr/>}
                    {this.renderNode(child, level + 1)}
                </div>;
            })}
        </div>;
    }
}
