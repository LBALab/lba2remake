import React from 'react';
import THREE from 'three';
import {clone, omit} from 'lodash';

import {createRenderer} from '../renderer';
import {createGame} from '../game';
import {mainGameLoop} from '../game/loop';
import {createSceneManager} from '../game/scenes';
import {createControls} from '../controls/index';

import {fullscreen} from './styles/index';

import FrameListener from './utils/FrameListener';
import CinemaEffect from './game/CinemaEffect';
import TextBox from './game/TextBox';
import TextInterjections from './game/TextInterjections';
import DebugLabels from './editor/DebugLabels';
import FoundObject from './game/FoundObject';
import Loader from './game/Loader';
import Video from './game/Video';
import DebugData from './editor/DebugData';

export default class Game extends FrameListener {
    constructor(props) {
        super(props);

        this.onLoad = this.onLoad.bind(this);
        this.frame = this.frame.bind(this);
        this.saveData = this.saveData.bind(this);
        this.onSceneManagerReady = this.onSceneManagerReady.bind(this);

        if (props.mainData) {
            const state = props.mainData.state;
            state.game.setUiState = this.setUiState.bind(this);
            state.game.getUiState = () => this.state;
            this.state = state;
        } else {
            const clock = new THREE.Clock(false);
            const game = createGame(props.params, clock, this.setUiState.bind(this), () => this.state);

            this.state = {
                clock,
                game,
                cinema: false,
                text: null,
                interjections: {},
                foundObject: null,
                loading: true,
                video: null
            };

            clock.start();
            game.preload();
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
                const sceneManager = createSceneManager(this.props.params, game, renderer, this.onSceneManagerReady);
                const controls = createControls(this.props.params, game, this.canvas, sceneManager);
                this.setState({ renderer, sceneManager, controls }, this.saveData);
            }
            this.root = root;
            this.root.appendChild(this.canvas);
        }
    }

    onSceneManagerReady(sceneManager) {
        sceneManager.goto(this.props.params.scene);
    }

    componentWillReceiveProps(newProps) {
        if (newProps.params.scene !== this.props.params.scene) {
            this.state.sceneManager.goto(newProps.params.scene);
        }
        if (newProps.params.vr !== this.props.params.vr && this.canvas) {
            this.state.renderer.dispose();
            this.setState({ renderer: createRenderer(newProps.params, this.canvas) }, this.saveData);
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
                scene: scene,
                hero: scene && scene.actors[0],
                controls,
                ui: omit(this.state, 'clock', 'game', 'renderer', 'sceneManager', 'controls')
            };
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
                    this.setState({video: clone(this.state.video)}, this.saveData); // Force video rerender
                }
            }
        }
    }

    render() {
        return <div style={fullscreen}>
            <div ref={this.onLoad} style={fullscreen}/>
            {this.props.params.editor ?
                <DebugLabels params={this.props.params}
                             labels={this.props.sharedState.labels}
                             scene={this.state.scene}
                             renderer={this.state.renderer}
                             ticker={this.props.ticker}/> : null}
            <CinemaEffect enabled={this.state.cinema} />
            <TextBox text={this.state.text} />
            <TextInterjections scene={this.state.scene}
                               renderer={this.state.renderer}
                               interjections={this.state.interjections} />
            <FoundObject foundObject={this.state.foundObject} />
            <Video video={this.state.video} renderer={this.state.renderer} />
            <div id="stats1" style={{position: 'absolute', top: 0, left: 0, width: '50%'}}/>
            <div id="stats2" style={{position: 'absolute', top: 0, left: '50%', width: '50%'}}/>
            {this.state.loading ? <Loader/> : null}
        </div>;
    }
}
