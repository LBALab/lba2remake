import * as React from 'react';
import * as THREE from 'three';

import Renderer from '../renderer';
import {createGame} from '../game/index';
import {mainGameLoop} from '../game/loop';
import {createSceneManager} from '../game/scenes';
import {createControls} from '../controls/index';

import {fullscreen} from './styles/index';

import FrameListener from './utils/FrameListener';
import Loader from './game/Loader';
import {sBind} from '../utils';
import {loadVRScene, updateVRScene} from './vr/vrScene';
import {tr} from '../lang';
import { TickerProps } from './utils/Ticker';
import { pure } from '../utils/decorators';

interface VRGameUIProps extends TickerProps {
    params: any;
    exitVR: (any) => any;
}

interface VRGameUIState {
    clock: THREE.Clock;
    game: any;
    scene?: any;
    renderer?: any;
    sceneManager?: any;
    controls?: any;
    cinema: boolean;
    text?: {
        value: string;
        color: string;
        type: string;
    };
    skip: boolean;
    ask: {choices: []};
    interjections: {};
    foundObject?: any;
    loading: boolean;
    video?: any;
    choice?: number;
    menuTexts?: any;
    showMenu: boolean;
    inGameMenu: boolean;
    teleportMenu: boolean;
    display: VRDisplay;
    enteredVR: boolean;
    vrScene?: any;
}

export default class VRGameUI extends FrameListener<VRGameUIProps, VRGameUIState> {
    canvas: HTMLCanvasElement;
    canvasWrapperElem: HTMLElement;
    renderZoneElem: HTMLElement;

    constructor(props) {
        super(props);

        this.onRenderZoneRef = this.onRenderZoneRef.bind(this);
        this.onCanvasWrapperRef = this.onCanvasWrapperRef.bind(this);
        this.frame = this.frame.bind(this);
        this.onVrDisplayConnect = this.onVrDisplayConnect.bind(this);
        this.onVrDisplayDisconnect = this.onVrDisplayDisconnect.bind(this);
        this.onVrDisplayPresentChange = this.onVrDisplayPresentChange.bind(this);
        this.onVrDisplayActivate = this.onVrDisplayActivate.bind(this);
        this.requestPresence = this.requestPresence.bind(this);
        this.setUiState = sBind(this.setUiState, this);
        this.getUiState = sBind(this.getUiState, this);
        this.showMenu = this.showMenu.bind(this);
        this.hideMenu = this.hideMenu.bind(this);

        const clock = new THREE.Clock(false);
        const game = createGame(
            clock,
            this.setUiState,
            this.getUiState
        );

        this.state = {
            clock,
            game,
            cinema: false,
            text: null,
            skip: false,
            ask: {choices: []},
            interjections: {},
            foundObject: null,
            loading: true,
            video: null,
            choice: null,
            menuTexts: null,
            showMenu: false,
            inGameMenu: false,
            teleportMenu: false,
            display: null,
            enteredVR: false
        };

        clock.start();
    }

    setUiState(state, callback) {
        this.setState(state, () => {
            if (callback) {
                callback();
            }
        });
    }

    @pure()
    getUiState() {
        return this.state;
    }

    onRenderZoneRef(renderZoneElem) {
        if (!this.renderZoneElem && renderZoneElem) {
            this.renderZoneElem = renderZoneElem;
            if (this.state.renderer && this.state.sceneManager) {
                const controls = createControls(
                    this.props.params,
                    this.state.game,
                    renderZoneElem,
                    this.state.sceneManager,
                    this.state.renderer
                );
                this.setState({ controls });
            }
        }
    }

    async onCanvasWrapperRef(canvasWrapperElem) {
        if (!this.canvasWrapperElem && canvasWrapperElem) {
            this.canvas = document.createElement('canvas');
            const game = this.state.game;
            await game.preload();
            game.loaded();
            if (this.props.params.scene === -1) {
                this.showMenu();
            }
            const renderer = new Renderer(this.props.params, this.canvas, {vr: true}, 'game');
            const sceneManager = await createSceneManager(
                this.props.params,
                game,
                renderer,
                this.hideMenu.bind(this)
            );
            renderer.threeRenderer.setAnimationLoop(() => {
                this.props.ticker.frame();
            });
            if (this.props.params.scene >= 0) {
                sceneManager.hideMenuAndGoto(this.props.params.scene);
            }
            let controls;
            if (this.renderZoneElem) {
                controls = createControls(
                    this.props.params,
                    game,
                    this.renderZoneElem,
                    sceneManager,
                    renderer
                );
            }
            const vrScene = loadVRScene(game, sceneManager, renderer);
            this.setState({ renderer, sceneManager, controls, vrScene });
            this.canvasWrapperElem = canvasWrapperElem;
            this.canvasWrapperElem.appendChild(this.canvas);
        }
    }

    componentWillMount() {
        super.componentWillMount();
        window.addEventListener('vrdisplayconnect', this.onVrDisplayConnect);
        window.addEventListener('vrdisplaydisconnect', this.onVrDisplayDisconnect);
        window.addEventListener('vrdisplaypresentchange', this.onVrDisplayPresentChange);
        window.addEventListener('vrdisplayactivate', this.onVrDisplayActivate);
        navigator.getVRDisplays()
            .then((displays) => {
                if (displays.length > 0) {
                    this.setState({ display: displays[0] });
                } else {
                    this.setState({ display: null });
                }
            })
            .catch(() => {
                this.setState({ display: null });
            });
    }

    componentWillUnmount() {
        window.removeEventListener('vrdisplayconnect', this.onVrDisplayConnect);
        window.removeEventListener('vrdisplaydisconnect', this.onVrDisplayDisconnect);
        window.removeEventListener('vrdisplaypresentchange', this.onVrDisplayPresentChange);
        window.removeEventListener('vrdisplayactivate', this.onVrDisplayActivate);
        super.componentWillUnmount();
    }

    onVrDisplayConnect(event) {
        this.setState({ display: event.display });
    }

    onVrDisplayDisconnect() {
        this.setState({ display: null });
    }

    onVrDisplayPresentChange() {
        this.setState({enteredVR: true});
        this.forceUpdate();
    }

    onVrDisplayActivate() {
        this.requestPresence();
    }

    showMenu(inGameMenu = false) {
        this.state.game.pause();
        const audioMenuManager = this.state.game.getAudioMenuManager();
        audioMenuManager.getMusicSource().load(6, () => {
            if (this.state.showMenu && !this.state.video) {
                audioMenuManager.getMusicSource().play();
            }
        });
        this.setState({showMenu: true, inGameMenu});
    }

    hideMenu(wasPaused = false) {
        const audioMenuManager = this.state.game.getAudioMenuManager();
        audioMenuManager.getMusicSource().stop();
        if (!wasPaused)
            this.state.game.resume();
        this.setState({showMenu: false, inGameMenu: false});
        this.canvas.focus();
    }

    frame() {
        const {game, clock, renderer, sceneManager, controls, vrScene} = this.state;
        if (renderer && sceneManager) {
            const presenting = renderer.isPresenting();
            const scene = sceneManager.getScene();
            if (this.state.scene !== scene) {
                this.setState({scene});
            }
            mainGameLoop(
                this.props.params,
                game,
                clock,
                renderer,
                scene,
                controls,
                vrScene
            );
            if (vrScene) {
                updateVRScene(
                    vrScene,
                    presenting,
                    game,
                    sceneManager
                );
            }
        }
    }

    render() {
        return <div ref={this.onRenderZoneRef} id="renderZone" style={fullscreen}>
            <div ref={this.onCanvasWrapperRef} style={fullscreen}/>
            {this.renderGUI()}
        </div>;
    }

    renderGUI() {
        const { renderer } = this.state;
        const presenting = renderer && renderer.isPresenting();
        if (presenting)
            return null;

        return <React.Fragment>
            {this.renderVRSelector()}
            {this.state.loading ? <Loader/> : null}
        </React.Fragment>;
    }

    requestPresence() {
        if (!this.state.renderer || !this.state.display) {
            return;
        }
        this.state.renderer.threeRenderer.vr.setDevice(this.state.display);
        this.state.display.requestPresent([
            {
                source: this.state.renderer.canvas,
                attributes: {
                    highRefreshRate: true,
                    foveationLevel: 3,
                    antialias: true
                }
            } as any
        ]);
    }

    renderVRSelector() {
        if (!this.state.renderer || !this.state.display) {
            return null;
        }
        const buttonWrapperStyle = {
            position: 'absolute' as const,
            left: 0,
            right: 0,
            bottom: 20,
            textAlign: 'center' as const,
            verticalAlign: 'middle' as const
        };
        const imgStyle = {
            width: 200,
            height: 200
        };
        const buttonStyle = {
            color: 'white',
            background: 'rgba(32, 162, 255, 0.5)',
            userSelect: 'none' as const,
            cursor: 'pointer' as const,
            display: 'inline-block' as const,
            fontFamily: 'LBA',
            padding: 20,
            textShadow: 'black 3px 3px',
            border: '2px outset #61cece',
            borderRadius: '15px',
            fontSize: '30px',
            textAlign: 'center' as const,
            verticalAlign: 'middle' as const
        };
        const buttonStyle2 = Object.assign({}, buttonStyle, {
            padding: 10,
            fontSize: '20px'
        });
        return <div className="bgMenu fullscreen">
            <div style={buttonWrapperStyle}>
                <div style={buttonStyle} onClick={this.requestPresence}>
                    <img style={imgStyle} src="images/vr_goggles.png"/>
                    <br/>
                    {this.state.enteredVR ? tr('ReturnToVR') : tr('PlayInVR')}
                </div>
                <br/><br/>
                {!this.state.enteredVR && <div style={buttonStyle2} onClick={this.props.exitVR}>
                    {tr('PlayOnScreen')}
                </div>}
            </div>
        </div>;
    }
}
