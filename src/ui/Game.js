import React from 'react';
import THREE from 'three';

import {createRenderer} from '../renderer';
import {createGame} from '../game';
import {mainGameLoop} from '../game/loop';
import {createSceneManager} from '../game/scenes';
import {initDebugHUD} from '../game/debugHUD';
import {createControls} from '../controls/index';

import {fullscreen} from './styles/index';
import CinemaEffect from './game/CinemaEffect';

export default class Game extends React.Component {
    constructor(props) {
        super(props);
        this.onLoad = this.onLoad.bind(this);
        this.onLoadCanvas = this.onLoadCanvas.bind(this);
        this.frame = this.frame.bind(this);

        initDebugHUD();

        this.onSceneManagerReady = this.onSceneManagerReady.bind(this);

        const clock = new THREE.Clock(false);
        const game = createGame(clock, this);

        this.state = { clock, game, cinema: false };

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
            const renderer = createRenderer(this.props, canvas);
            const sceneManager = createSceneManager(this.props, game, renderer, this.onSceneManagerReady);
            const controls = createControls(this.props, game, canvas, sceneManager);
            this.setState({ renderer, sceneManager, controls });
            this.frame();
            this.canvas = canvas;
        }
    }

    onSceneManagerReady() {
        this.state.sceneManager.goto(this.props.scene);
    }

    componentWillReceiveProps(newProps) {
        if (newProps.scene !== this.props.scene) {
            this.state.sceneManager.goto(newProps.scene);
        }
        if (newProps.vr !== this.props.vr && this.canvas) {
            this.state.renderer.dispose();
            this.setState({ renderer: createRenderer(newProps, this.canvas) });
        }
    }

    frame() {
        this.checkResize();
        const {game, clock, renderer, sceneManager, controls} = this.state;
        if (renderer && sceneManager) {
            mainGameLoop(
                this.props,
                game,
                clock,
                renderer,
                sceneManager.getScene(),
                controls
            );
        }
        requestAnimationFrame(this.frame);
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
            <CinemaEffect enabled={this.state.cinema} />
        </div>;
    }
}

