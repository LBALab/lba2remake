import React from 'react';
import * as THREE from 'three';
import {clone, omit, noop} from 'lodash';

import {createRenderer} from '../renderer';
import {createGame} from '../game';
import {mainGameLoop} from '../game/loop';
import {createSceneManager} from '../game/scenes';
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
import Version from './game/Version';
import Ribbon from './game/Ribbon';

export default class Game extends FrameListener {
    constructor(props) {
        super(props);

        this.onLoad = this.onLoad.bind(this);
        this.frame = this.frame.bind(this);
        this.saveData = this.saveData.bind(this);
        this.onSceneManagerReady = this.onSceneManagerReady.bind(this);
        this.onGameReady = this.onGameReady.bind(this);
        this.onAskChoiceChanged = this.onAskChoiceChanged.bind(this);
        this.onMenuItemChanged = this.onMenuItemChanged.bind(this);
        this.listener = this.listener.bind(this);
        this.showMenu = this.showMenu.bind(this);
        this.hideMenu = this.hideMenu.bind(this);
        this.startNewGameScene = this.startNewGameScene.bind(this);

        if (props.mainData) {
            const state = props.mainData.state;
            state.game.setUiState = this.setUiState.bind(this);
            state.game.getUiState = () => this.state;
            this.state = state;
        } else {
            const clock = new THREE.Clock(false);
            const game =
                createGame(props.params, clock, this.setUiState.bind(this), () => this.state);

            this.state = {
                clock,
                game,
                cinema: false,
                text: null,
                ask: {choices: []},
                interjections: {},
                foundObject: null,
                loading: true,
                video: null,
                choice: null,
                menuTexts: null,
                showMenu: false,
                inGameMenu: false,
                showVersion: false
            };

            clock.start();
            game.preload(this.onGameReady);
        }
    }

    setUiState(state) {
        this.setState(state, this.saveData);
    }

    saveData() {
        if (this.props.saveMainData) {
            this.props.saveMainData({
                state: this.state,
                canvas: this.canvas
            });
        }
    }

    onLoad(root) {
        if (!this.root) {
            if (this.props.mainData) {
                this.canvas = this.props.mainData.canvas;
            } else {
                this.canvas = document.createElement('canvas');
                this.canvas.tabIndex = 0;
                const game = this.state.game;
                const renderer = createRenderer(this.props.params, this.canvas);
                const sceneManager = createSceneManager(
                    this.props.params,
                    game,
                    renderer,
                    this.onSceneManagerReady,
                    this.hideMenu.bind(this));
                const controls = createControls(this.props.params, game, this.canvas, sceneManager);
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
        super.componentWillUnmount();
    }

    componentWillReceiveProps(newProps) {
        if (newProps.params.scene !== -1 && newProps.params.scene !== this.props.params.scene) {
            this.hideMenu();
            this.state.sceneManager.goto(newProps.params.scene);
        }
        if (newProps.params.vr !== this.props.params.vr && this.canvas) {
            this.state.renderer.dispose();
            this.setState({
                renderer: createRenderer(newProps.params, this.canvas)
            }, this.saveData);
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
        const audioManager = this.state.game.getAudioManager();
        const sfxSource = audioManager.getSoundFxSource();
        sfxSource.stop();
        const voiceSource = audioManager.getVoiceSource();
        voiceSource.stop();
        const musicSource = audioManager.getMusicSource();
        musicSource.stop();
        musicSource.load(6, () => {
            musicSource.play();
        });
        this.setState({showMenu: true, inGameMenu});
    }

    hideMenu() {
        const musicSource = this.state.game.getAudioManager().getMusicSource();
        musicSource.stop();
        this.state.game.resume();
        this.setState({showMenu: false, inGameMenu: false});
        this.canvas.focus();
    }

    listener(event) {
        const key = event.code || event.which || event.keyCode;
        if (this.state.video) {
            if (key === 'Enter' || key === 13 ||
                key === 'Escape' || key === 27) {
                this.setState({video: null});
                this.startNewGameScene();
            }
        } else {
            if (key === 'Escape' || key === 27) {
                if (!this.state.game.isPaused()) {
                    this.showMenu(true);
                } else {
                    this.hideMenu();
                }
            }
        }
        if (key === 'KeyV' || key === 86) {
            this.setState({showVersion: !this.state.showVersion});
        }
    }

    startNewGameScene() {
        this.state.game.pause();
        this.state.game.resetState();
        this.state.sceneManager.goto(0, noop, true);
    }

    onMenuItemChanged(item) {
        switch (item) {
            case 70: // Resume
                this.hideMenu();
                break;
            case 71: // New Game
                this.hideMenu();
                const that = this;
                const src = VideoData.VIDEO.find(v => v.name === 'INTRO').file;
                this.state.game.pause();
                this.setState({video: {
                    src,
                    callback: () => {
                        that.setState({video: null});
                        that.startNewGameScene();
                    }
                }});
                break;
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
                hero: scene && scene.actors[0],
                controls,
                ui: omit(this.state, 'clock', 'game', 'renderer', 'sceneManager', 'controls')
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

    render() {
        return <div style={fullscreen}>
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
            {!this.state.showMenu ? <TextBox text={this.state.text} /> : null}
            {!this.state.showMenu ? <AskChoice
                ask={this.state.ask}
                onChoiceChanged={this.onAskChoiceChanged}
            /> : null}
            {!this.state.showMenu ? <FoundObject foundObject={this.state.foundObject} /> : null}
            <TextInterjections
                scene={this.state.scene}
                renderer={this.state.renderer}
                interjections={this.state.interjections}
            />
            {!this.props.params.editor ? <Ribbon/> : null}
            <Video video={this.state.video} renderer={this.state.renderer} />
            <Menu
                showMenu={this.state.showMenu}
                texts={this.state.game.menuTexts}
                inGameMenu={this.state.inGameMenu}
                onItemChanged={this.onMenuItemChanged}
            />
            <div id="stats1" style={{position: 'absolute', top: 0, left: 0, width: '50%'}}/>
            <div id="stats2" style={{position: 'absolute', top: 0, left: '50%', width: '50%'}}/>
            {!this.props.params.editor && this.state.showVersion ? <Version/> : null}
            {this.state.loading ? <Loader/> : null}
        </div>;
    }
}
