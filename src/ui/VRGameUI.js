import React from 'react';
import * as THREE from 'three';

import {createRenderer} from '../renderer';
import {createGame} from '../game/index.ts';
import {mainGameLoop} from '../game/loop';
import {createSceneManager} from '../game/scenes.ts';
import {createControls} from '../controls/index';

import {fullscreen} from './styles/index';

import FrameListener from './utils/FrameListener';
import Loader from './game/Loader';
import {sBind} from '../utils.ts';
import {updateVRGui} from './vr/vrGui';
import {loadVRScene} from './vr/vrScene.ts';

export default class VRGameUI extends FrameListener {
    constructor(props) {
        super(props);

        this.onRenderZoneRef = this.onRenderZoneRef.bind(this);
        this.onCanvasWrapperRef = this.onCanvasWrapperRef.bind(this);
        this.frame = this.frame.bind(this);
        this.saveData = this.saveData.bind(this);
        this.onVrDisplayConnect = this.onVrDisplayConnect.bind(this);
        this.onVrDisplayDisconnect = this.onVrDisplayDisconnect.bind(this);
        this.onVrDisplayPresentChange = this.onVrDisplayPresentChange.bind(this);
        this.onVrDisplayActivate = this.onVrDisplayActivate.bind(this);
        this.requestPresence = this.requestPresence.bind(this);
        this.onSceneManagerReady = this.onSceneManagerReady.bind(this);
        this.onGameReady = this.onGameReady.bind(this);
        this.onAskChoiceChanged = this.onAskChoiceChanged.bind(this);
        this.setUiState = sBind(this.setUiState, this);
        this.getUiState = sBind(this.getUiState, this);
        this.showMenu = this.showMenu.bind(this);
        this.hideMenu = this.hideMenu.bind(this);
        this.startNewGameScene = this.startNewGameScene.bind(this);
        this.textAnimEndedHandler = this.textAnimEndedHandler.bind(this);

        if (props.mainData) {
            const state = props.mainData.state;
            state.game.setUiState = this.setUiState;
            state.game.getUiState = this.getUiState;
            this.state = state;
        } else {
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
                display: null
            };

            clock.start();
            game.preload().then(() => this.onGameReady());
        }
    }

    /* @inspector(locate) */
    setUiState(state) {
        this.setState(state, this.saveData);
    }

    /* @inspector(locate, pure) */
    getUiState() {
        return this.state;
    }

    saveData() {
        if (this.props.saveMainData) {
            this.props.saveMainData({
                state: this.state,
                canvas: this.canvas
            });
        }
    }

    async onRenderZoneRef(renderZoneElem) {
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
                this.setState({ controls }, this.saveData);
            }
        }
    }

    async onCanvasWrapperRef(canvasWrapperElem) {
        if (!this.canvasWrapperElem && canvasWrapperElem) {
            if (this.props.mainData) {
                this.canvas = this.props.mainData.canvas;
            } else {
                this.canvas = document.createElement('canvas');
                const game = this.state.game;
                const renderer = createRenderer(this.props.params, this.canvas, {}, 'game');
                const sceneManager = await createSceneManager(
                    this.props.params,
                    game,
                    renderer,
                    this.hideMenu.bind(this)
                );
                renderer.threeRenderer.setAnimationLoop(() => {
                    this.props.ticker.frame();
                });
                this.onSceneManagerReady(sceneManager);
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
                const vrScene = loadVRScene(renderer);
                this.setState({ renderer, sceneManager, controls, vrScene }, this.saveData);
            }
            this.canvasWrapperElem = canvasWrapperElem;
            this.canvasWrapperElem.appendChild(this.canvas);
        }
    }

    onSceneManagerReady(sceneManager) {
        if (this.props.params.scene >= 0) {
            sceneManager.hideMenuAndGoto(this.props.params.scene);
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

    }

    onVrDisplayActivate() {

    }

    onGameReady() {
        this.state.game.loaded();
        if (this.props.params.scene === -1) {
            this.showMenu();
        }
    }

    showMenu(inGameMenu = false) {
        this.state.game.pause();
        const audioMenuManager = this.state.game.getAudioMenuManager();
        audioMenuManager.getMusicSource().load(6, () => {
            audioMenuManager.getMusicSource().play();
        });
        this.setState({showMenu: true, inGameMenu}, this.saveData);
    }

    hideMenu(wasPaused = false) {
        const audioMenuManager = this.state.game.getAudioMenuManager();
        audioMenuManager.getMusicSource().stop();
        if (!wasPaused)
            this.state.game.resume();
        this.setState({showMenu: false, inGameMenu: false}, this.saveData);
        this.canvas.focus();
    }

    startNewGameScene() {
        this.state.game.resume();
        this.state.game.resetState();
        this.state.sceneManager.goto(0, true);
    }

    frame() {
        const {game, clock, renderer, sceneManager, controls, vrScene} = this.state;
        if (renderer && sceneManager) {
            const presenting = renderer.isPresenting();
            const scene = sceneManager.getScene();
            if (this.state.scene !== scene) {
                this.setState({scene}, this.saveData);
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
            updateVRGui(
                presenting,
                game,
                sceneManager
            );
        }
    }

    onAskChoiceChanged(choice) {
        this.setState({choice}, this.saveData);
    }

    textAnimEndedHandler() {
        this.setUiState({ skip: true });
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
            }
        ]);
    }

    renderVRSelector() {
        if (!this.state.renderer || !this.state.display) {
            return null;
        }
        const buttonWrapperStyle = {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 20,
            textAlign: 'center',
            verticalAlign: 'middle'
        };
        const imgStyle = {
            width: 200,
            height: 200
        };
        const buttonStyle = {
            color: 'white',
            background: 'rgba(32, 162, 255, 0.5)',
            userSelect: 'none',
            cursor: 'pointer',
            display: 'inline-block',
            fontFamily: 'LBA',
            padding: 20,
            textShadow: 'black 3px 3px',
            border: '2px outset #61cece',
            borderRadius: '15px',
            fontSize: '30px',
            textAlign: 'center',
            verticalAlign: 'middle'
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
                    Play in VR!
                </div>
                <br/><br/>
                <div style={buttonStyle2} onClick={this.props.exitVR}>
                    Play on screen
                </div>
            </div>
        </div>;
    }
}
