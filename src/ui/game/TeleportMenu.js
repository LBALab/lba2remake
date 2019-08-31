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
    fontSize: 16,
    fontFamily: 'LBA',
    width: '25%',
    textAlign: 'center',
    verticalAlign: 'middle',
    cursor: 'pointer',
    userSelect: 'none',
    textShadow: selected ? 'black 3px 3px' : 'rgb(20, 20, 20) 3px 3px',
    background: selected ? 'rgba(32, 162, 255, 0.5)' : 'transparent',
    overflow: 'hidden',
    padding: '12px 0'
});

const islandStyle = selected => ({
    display: 'inline-block',
    color: selected ? 'white' : 'rgb(100, 100, 100)',
    fontSize: 14,
    fontFamily: 'LBA',
    width: '100%',
    textAlign: 'left',
    verticalAlign: 'middle',
    cursor: 'pointer',
    userSelect: 'none',
    textShadow: selected ? 'black 3px 3px' : 'rgb(20, 20, 20) 3px 3px',
    background: selected ? 'rgba(32, 162, 255, 0.5)' : 'transparent',
    overflow: 'hidden',
    padding: '12px 0'
});

const headerStyle = {
    borderBottom: '2px outset #61cece',
    margin: 0,
    background: 'black',
    height: 76,
};

const contentStyle = {
    position: 'absolute',
    overflow: 'auto',
    padding: 0,
    top: 78,
    left: 0,
    right: 0,
    bottom: 0
};

const islandHeaderStyle = {
    position: 'absolute',
    overflow: 'auto',
    padding: 0,
    top: 0,
    left: 0,
    width: 200,
    bottom: 0
};

const islandContentStyle = {
    position: 'absolute',
    overflow: 'auto',
    background: 'rgb(45, 45, 45)',
    padding: '8px 16px',
    top: 0,
    left: 200,
    right: 0,
    bottom: 0,
};

const planetIconStyle = {
    width: 32,
    height: 32
};

const islandIconStyle = {
    width: 16,
    height: 16,
    margin: '0 8px'
};

export default class TeleportMenu extends React.Component {
    constructor(props) {
        super(props);
        const scene = props.sceneManager.getScene();
        if (scene) {
            this.state = this.findSceneLocation(scene.index) || {
                planet: 0,
                island: 0
            };
        } else {
            this.state = {
                planet: 0,
                island: 0
            };
        }
    }

    findSceneLocation(index, node = LocationsNode, level = 0, planet = -1, island = -1) {
        if (node.props && node.props[0].value === index) {
            return { planet, island };
        }

        if (!node.children)
            return null;

        for (let i = 0; i < node.children.length; i += 1) {
            if (level === 0)
                planet = i;
            if (level === 1)
                island = i;
            const child = node.children[i];
            const res = this.findSceneLocation(index, child, level + 1, planet, island);
            if (res) {
                return res;
            }
        }
        return null;
    }

    render() {
        const select = (idx) => {
            if (this.state.planet !== idx) {
                this.setState({planet: idx, island: 0});
            }
        };
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
                <div
                    style={contentStyle}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                >
                    <div>
                        {this.renderPlanet(selectedPlanet)}
                    </div>
                </div>
            </div>
        </div>;
    }

    renderPlanet(planet) {
        const select = idx => this.setState({island: idx});
        const islands = filter(planet.children, n => !n.name.match(/^\[DEMO\]/));
        const selectedIsland = islands[this.state.island];
        return <React.Fragment>
            <div style={islandHeaderStyle}>
                {islands.map((island, idx) =>
                    <div
                        key={island.name}
                        style={islandStyle(this.state.island === idx)}
                        onClick={(e) => {
                            select(idx);
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                    >
                        <img style={islandIconStyle} src={island.icon}/>
                        {island.name}
                    </div>)}
            </div>
            <div style={islandContentStyle}>
                <div>
                    {this.renderNode(selectedIsland, 0)}
                </div>
            </div>
        </React.Fragment>;
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
                const childStyle = {
                    textAlign: 'left',
                    fontSize: 12,
                    fontFamily: 'LBA',
                    background: 'rgb(45, 45, 45)',
                    cursor: 'pointer',
                    userSelect: 'none',
                    paddingTop: 8,
                    paddingLeft: level * 16
                };
                return <div key={child.name} style={childStyle}>
                    <span onClick={e => goto(e, child)}>
                        <img style={{width: 16, height: 16}} src={child.icon}/>&nbsp;
                        {child.name}
                    </span>
                    {this.renderNode(child, level + 1)}
                </div>;
            })}
        </div>;
    }
}
