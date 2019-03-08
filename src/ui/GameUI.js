import React from 'react';
import * as THREE from 'three';
import {clone, omit} from 'lodash';

import {createRenderer} from '../renderer';
import {createGame} from '../game/index.ts';
import {mainGameLoop} from '../game/loop';
import {createSceneManager} from '../game/scenes.ts';
import {createControls} from '../controls/index';

import {fullscreen} from './styles/index';

import FrameListener from './utils/FrameListener';
import CinemaEffect from './game/CinemaEffect';
import TextBox from './game/TextBox';
import AskChoice from './game/AskChoice';
import TextInterjections from './game/TextInterjections';
import DebugLabels from './editor/DebugLabels';
import FoundObject from './game/FoundObject';
import Loader from './game/Loader';
import Video from './game/Video';
import DebugData from './editor/DebugData';
import Menu from './game/Menu';
import VideoData from '../video/data';
import Ribbon from './game/Ribbon';
import {sBind} from '../utils.ts';

export default class GameUI extends FrameListener {
    constructor(props) {
        super(props);

        this.onLoad = this.onLoad.bind(this);
        this.frame = this.frame.bind(this);
        this.saveData = this.saveData.bind(this);
        this.onSceneManagerReady = this.onSceneManagerReady.bind(this);
        this.onGameReady = this.onGameReady.bind(this);
        this.onAskChoiceChanged = this.onAskChoiceChanged.bind(this);
        this.onMenuItemChanged = this.onMenuItemChanged.bind(this);
        this.setUiState = sBind(this.setUiState, this);
        this.getUiState = sBind(this.getUiState, this);
        this.listener = this.listener.bind(this);
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
                inGameMenu: false
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

    async onLoad(root) {
        if (!this.root) {
            if (this.props.mainData) {
                this.canvas = this.props.mainData.canvas;
            } else {
                this.canvas = document.createElement('canvas');
                this.canvas.tabIndex = 0;
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
                const controls = createControls(
                    this.props.params,
                    game,
                    this.canvas,
                    sceneManager,
                    renderer
                );
                this.setState({ renderer, sceneManager, controls }, this.saveData);
            }
            this.root = root;
            this.root.appendChild(this.canvas);
        }
    }

    onSceneManagerReady(sceneManager) {
        if (this.props.params.scene >= 0) {
            this.hideMenu();
            sceneManager.goto(this.props.params.scene);
        }
    }

    componentWillMount() {
        super.componentWillMount();
        window.addEventListener('keydown', this.listener);
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.listener);
        if (this.state.renderer) {
            this.state.renderer.dispose();
        }
        super.componentWillUnmount();
    }

    componentWillReceiveProps(newProps) {
        if (newProps.params.scene !== -1 && newProps.params.scene !== this.props.params.scene) {
            const scene = this.state.sceneManager.getScene();
            if (scene && newProps.params.scene !== scene.index) {
                this.hideMenu();
                this.state.sceneManager.goto(newProps.params.scene);
            }
        }
        if (newProps.params.iso3d !== this.props.params.iso3d) {
            const scene = this.state.sceneManager.getScene();
            if (scene) {
                scene.resetCamera(newProps.params);
            }
        }
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

    listener(event) {
        const key = event.code || event.which || event.keyCode;
        if (!this.state.video) {
            if (key === 'Escape' || key === 27) {
                if (!this.state.game.isPaused()) {
                    this.showMenu(true);
                } else {
                    this.hideMenu();
                }
            }
        }
    }

    startNewGameScene() {
        this.state.game.resume();
        this.state.game.resetState();
        this.state.sceneManager.goto(0, true);
    }

    onMenuItemChanged(item) {
        switch (item) {
            case 70: { // Resume
                this.hideMenu();
                break;
            }
            case 71: { // New Game
                this.hideMenu();
                const src = VideoData.VIDEO.find(v => v.name === 'INTRO').file;
                const onEnded = () => {
                    this.setState({video: null});
                    this.startNewGameScene();
                    this.state.game.controlsState.skipListener = null;
                };
                this.state.game.controlsState.skipListener = onEnded;
                this.state.game.pause();
                this.setState({
                    video: {
                        src,
                        onEnded
                    }
                });
                break;
            }
        }
    }

    frame() {
        this.checkResize();
        const {game, clock, renderer, sceneManager, controls} = this.state;
        if (renderer && sceneManager) {
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
                controls
            );
            DebugData.scope = {
                params: this.props.params,
                game,
                clock,
                renderer,
                scene,
                sceneManager,
                hero: scene && scene.actors[0],
                controls,
                ui: omit(this.state, 'clock', 'game', 'renderer', 'sceneManager', 'controls', 'scene')
            };
            DebugData.sceneManager = sceneManager;
        }
    }

    checkResize() {
        if (this.root && this.canvas && this.state.renderer) {
            const roundedWidth = Math.floor(this.root.clientWidth * 0.5) * 2;
            const roundedHeight = Math.floor(this.root.clientHeight * 0.5) * 2;
            const rWidth = `${roundedWidth}px`;
            const rHeight = `${roundedHeight}px`;
            const cvWidth = this.canvas.style.width;
            const cvHeight = this.canvas.style.height;
            if (rWidth !== cvWidth || rHeight !== cvHeight) {
                this.state.renderer.resize(roundedWidth, roundedHeight);
                if (this.state.video) {
                    this.setState({
                        video: clone(this.state.video)
                    }, this.saveData); // Force video rerender
                }
            }
        }
    }

    onAskChoiceChanged(choice) {
        this.setState({choice});
    }

    textAnimEndedHandler() {
        this.setUiState({ skip: true });
    }

    render() {
        return <div id="renderZone" style={fullscreen}>
            <div ref={this.onLoad} style={fullscreen}/>
            {this.props.params.editor ?
                <DebugLabels
                    params={this.props.params}
                    labels={this.props.sharedState.labels}
                    scene={this.state.scene}
                    renderer={this.state.renderer}
                    ticker={this.props.ticker}
                /> : null}
            <CinemaEffect enabled={this.state.cinema} />
            <TextInterjections
                scene={this.state.scene}
                renderer={this.state.renderer}
                interjections={this.state.interjections}
            />
            <Video video={this.state.video} renderer={this.state.renderer} />
            <Menu
                showMenu={this.state.showMenu}
                texts={this.state.game.menuTexts}
                inGameMenu={this.state.inGameMenu}
                onItemChanged={this.onMenuItemChanged}
            />
            <div id="stats" style={{position: 'absolute', top: 0, left: 0, width: '50%'}}/>
            <Ribbon mode={this.state.showMenu ? 'menu' : 'game'} editor={this.props.params.editor} />
            {this.state.loading ? <Loader/> : null}
            {!this.state.showMenu ? <TextBox
                text={this.state.text}
                skip={this.state.skip}
                textAnimEnded={this.textAnimEndedHandler}
            /> : null}
            {!this.state.showMenu ? <AskChoice
                ask={this.state.ask}
                onChoiceChanged={this.onAskChoiceChanged}
            /> : null}
            {!this.state.showMenu ? <FoundObject foundObject={this.state.foundObject} /> : null}
        </div>;
    }
}
