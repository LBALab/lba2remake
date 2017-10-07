import React from 'react';
import THREE from 'three';

import {createRenderer} from '../renderer';
import {createGame} from '../game';
import {mainGameLoop} from '../game/loop';
import {createSceneManager} from '../game/scenes';
import {initDebugHUD} from '../game/debugHUD';
import {createControls} from '../controls/index';

import {fullscreen} from './styles/index';

import FrameListener from './utils/FrameListener';
import CinemaEffect from './game/CinemaEffect';
import TextBox from './game/TextBox';
import TextInterjections from './game/TextInterjections';
import DebugLabels from './editor/DebugLabels';

export default class Game extends FrameListener {
    constructor(props) {
        super(props);
        this.onLoad = this.onLoad.bind(this);
        this.onLoadCanvas = this.onLoadCanvas.bind(this);
        this.frame = this.frame.bind(this);

        initDebugHUD();

        this.onSceneManagerReady = this.onSceneManagerReady.bind(this);

        const clock = new THREE.Clock(false);
        const game = createGame(clock, this);

        this.state = {
            clock,
            game,
            cinema: false,
            text: null,
            interjections: {},
            labels: {
                actor: false,
                zone: false,
                point: false
            }
        };

        clock.start();
        game.preload();
    }

    onLoad(root) {
        if (!this.root) {
            this.root = root;
        }
    }

    onLoadCanvas(canvas) {
        if (!this.canvas) {
            const game = this.state.game;
            const renderer = createRenderer(this.props.params, canvas);
            const sceneManager = createSceneManager(this.props.params, game, renderer, this.onSceneManagerReady);
            const controls = createControls(this.props.params, game, canvas, sceneManager);
            this.setState({ renderer, sceneManager, controls });
            this.frame();
            this.canvas = canvas;
        }
    }

    onSceneManagerReady() {
        this.state.sceneManager.goto(this.props.params.scene);
    }

    componentWillReceiveProps(newProps) {
        if (newProps.params.scene !== this.props.params.scene) {
            this.state.sceneManager.goto(newProps.params.scene);
        }
        if (newProps.params.vr !== this.props.params.vr && this.canvas) {
            this.state.renderer.dispose();
            this.setState({ renderer: createRenderer(newProps.params, this.canvas) });
        }
    }

    frame() {
        this.checkResize();
        const {game, clock, renderer, sceneManager, controls} = this.state;
        if (renderer && sceneManager) {
            if (this.state.scene !== sceneManager.getScene()) {
                this.setState({scene: sceneManager.getScene()});
            }
            mainGameLoop(
                this.props.params,
                game,
                clock,
                renderer,
                sceneManager.getScene(),
                controls
            );
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
            }
        }
    }

    render() {
        return <div ref={this.onLoad} style={fullscreen}>
            <canvas ref={this.onLoadCanvas} />
            <DebugLabels params={this.props.params}
                         labels={this.state.labels}
                         scene={this.state.scene}
                         renderer={this.state.renderer}
                         ticker={this.props.ticker} />
            <CinemaEffect enabled={this.state.cinema} />
            <TextBox text={this.state.text} />
            <TextInterjections scene={this.state.scene}
                               renderer={this.state.renderer}
                               interjections={this.state.interjections} />
        </div>;
    }
}
