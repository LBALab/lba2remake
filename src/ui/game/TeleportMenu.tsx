import * as React from 'react';
import {map, filter} from 'lodash';
import LocationsNode from '../editor/areas/gameplay/locator/LocationsNode';
import { SceneManager } from '../../game/sceneManager';
import { Game } from '../../game/game';

const style = {
    position: 'absolute' as const,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    margin: 32,
    border: '2px outset #61cece',
    borderRadius: 12,
    background: 'black',
    overflow: 'hidden' as const
};

const planetStyle = selected => ({
    display: 'inline-block' as const,
    color: selected ? 'white' : 'rgb(100, 100, 100)',
    fontSize: 14,
    fontFamily: 'LBA',
    width: '25%',
    textAlign: 'center' as const,
    verticalAlign: 'middle' as const,
    cursor: 'pointer' as const,
    userSelect: 'none' as const,
    textShadow: selected ? 'black 3px 3px' : 'rgb(20, 20, 20) 3px 3px',
    background: selected ? 'rgba(32, 162, 255, 0.5)' : 'transparent',
    overflow: 'hidden' as const,
    padding: '10px 0'
});

const islandStyle = selected => ({
    display: 'inline-block' as const,
    color: selected ? 'white' : 'rgb(100, 100, 100)',
    fontSize: 14,
    fontFamily: 'LBA',
    width: '100%',
    textAlign: 'left' as const,
    verticalAlign: 'middle' as const,
    cursor: 'pointer' as const,
    userSelect: 'none' as const,
    textShadow: selected ? 'black 3px 3px' : 'rgb(20, 20, 20) 3px 3px',
    background: selected ? 'rgba(32, 162, 255, 0.5)' : 'transparent',
    overflow: 'hidden' as const,
    padding: '12px 0'
});

const headerStyle = {
    borderBottom: '2px outset #61cece',
    margin: 0,
    background: 'black',
    height: 86,
};

const contentStyle = {
    position: 'absolute' as const,
    overflow: 'auto' as const,
    padding: 0,
    top: 88,
    left: 0,
    right: 0,
    bottom: 0
};

const islandHeaderStyle = {
    position: 'absolute' as const,
    overflow: 'auto' as const,
    padding: 0,
    top: 0,
    left: 0,
    width: 200,
    bottom: 0
};

const islandContentStyle = {
    position: 'absolute' as const,
    overflow: 'auto' as const,
    background: 'rgb(45, 45, 45)',
    padding: '8px 16px',
    top: 0,
    left: 200,
    right: 0,
    bottom: 0,
};

const smIslandContentStyle = selecting => Object.assign({}, islandContentStyle, {
    left: 0,
    top: 45,
    padding: selecting ? 0 : '8px 16px'
});

const planetIconStyle = {
    width: 48,
    height: 48
};

const islandIconStyle = {
    width: 16,
    height: 16,
    margin: '0 8px'
};

const closeStyle = {
    position: 'absolute' as const,
    top: 2,
    right: 2,
    width: 24,
    height: 24,
    cursor: 'pointer' as const
};

interface TMProps {
    inGameMenu: boolean;
    exit: (any) => any;
    game: Game;
    sceneManager: SceneManager;
}

interface TMState {
    small: boolean;
    planet: number;
    island: number;
    selectPlanet: boolean;
    selectIsland: boolean;
}

export default class TeleportMenu extends React.Component<TMProps, TMState> {
    mainElem: HTMLElement;

    constructor(props) {
        super(props);

        this.resize = this.resize.bind(this);

        const scene = props.sceneManager.getScene();
        let loc = {
            planet: 0,
            island: 0
        };
        if (scene) {
            loc = this.findSceneLocation(scene.index);
        }
        this.state = Object.assign({
            small: false,
            selectPlanet: false,
            selectIsland: false
        }, loc);
    }

    componentWillMount() {
        window.addEventListener('resize', this.resize);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resize);
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

    resize() {
        if (this.mainElem) {
            const small = this.mainElem.offsetWidth < 512;
            if (small !== this.state.small) {
                this.setState({ small });
            }
        }
    }

    render() {
        const select = (idx) => {
            if (this.state.planet !== idx) {
                this.setState({planet: idx, island: 0});
            }
        };
        const getRef = (ref) => {
            this.mainElem = ref;
            this.resize();
        };
        const small = this.state.small;
        const planets = LocationsNode.children;
        const selectedPlanet = planets[this.state.planet];
        return <div className={`${this.props.inGameMenu ? 'bgInGameMenu' : 'bgMenu'} fullscreen`}
                    onClick={this.props.exit}>
            <div style={style} ref={getRef}>
                <div style={headerStyle}>
                    {small ? this.renderSmallPlanet(selectedPlanet) : planets.map((planet, idx) =>
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
                <img style={closeStyle} src="./editor/icons/close.svg" onClick={this.props.exit}/>
            </div>
        </div>;
    }

    renderSmallPlanet(planet) {
        return <div
            key={planet.name}
            style={Object.assign(planetStyle(true), {width: '100%'})}
            onClick={(e) => {
                this.setState(state => ({ selectPlanet: !state.selectPlanet }));
                e.preventDefault();
                e.stopPropagation();
            }}
        >
            <img style={planetIconStyle} src={planet.icon}/><br/>
            {planet.name}
        </div>;
    }

    renderPlanet(planet) {
        if (this.state.selectPlanet) {
            const selectPlanet = (idx) => {
                this.setState({planet: idx, island: 0, selectPlanet: false});
            };
            const planets = LocationsNode.children;
            return <React.Fragment>
                {planets.map((p, idx) => {
                    if (idx === this.state.planet)
                        return null;
                    return <div
                        key={p.name}
                        style={Object.assign(planetStyle(false), {width: '100%'})}
                        onClick={(e) => {
                            selectPlanet(idx);
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                    >
                        <img style={planetIconStyle} src={p.icon}/><br/>
                        {p.name}
                    </div>;
                })}
            </React.Fragment>;
        }

        const small = this.state.small;
        const selectIsland = idx => this.setState({island: idx});
        const islands = filter(planet.children, n => !n.name.match(/^\[DEMO\]/));
        const selectedIsland = islands[this.state.island];
        return <React.Fragment>
            {small ? this.renderSmallIsland(selectedIsland) : <div style={islandHeaderStyle}>
                {islands.map((island, idx) =>
                    <div
                        key={island.name}
                        style={islandStyle(this.state.island === idx)}
                        onClick={(e) => {
                            selectIsland(idx);
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                    >
                        <img style={islandIconStyle} src={island.icon}/>
                        {island.name}
                    </div>)}
            </div>}
            <div style={small ? smIslandContentStyle(this.state.selectIsland) : islandContentStyle}>
                {this.state.selectIsland
                    ? this.renderIslandSelection(planet)
                    : this.renderNode(selectedIsland, 0)}
            </div>
        </React.Fragment>;
    }

    renderIslandSelection(planet) {
        const islands = filter(planet.children, n => !n.name.match(/^\[DEMO\]/));
        const select = idx => this.setState({island: idx, selectIsland: false});
        return <React.Fragment>
            {islands.map((island, idx) => {
                if (idx === this.state.island)
                    return null;

                return <div
                    key={island.name}
                    style={islandStyle(false)}
                    onClick={(e) => {
                        select(idx);
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                >
                    <img style={islandIconStyle} src={island.icon}/>
                    {island.name}
                </div>;
            })}
        </React.Fragment>;
    }

    renderSmallIsland(island) {
        return <div
            key={island.name}
            style={islandStyle(true)}
            onClick={(e) => {
                this.setState(state => ({ selectIsland: !state.selectIsland }));
                e.preventDefault();
                e.stopPropagation();
            }}
        >
            <img style={islandIconStyle} src={island.icon}/>
            {island.name}
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
                const childStyle = {
                    textAlign: 'left' as const,
                    fontSize: 12,
                    fontFamily: 'LBA',
                    background: 'rgb(45, 45, 45)',
                    cursor: 'pointer' as const,
                    userSelect: 'none' as const,
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
