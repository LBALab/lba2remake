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
import DebugHUD from './editor/areas/DebugHUDArea/hud';

export default class Game extends FrameListener {
    constructor(props) {
        super(props);

        this.onLoad = this.onLoad.bind(this);
        this.onLoadCanvas = this.onLoadCanvas.bind(this);
        this.frame = this.frame.bind(this);
        this.onSceneManagerReady = this.onSceneManagerReady.bind(this);

        const clock = new THREE.Clock(false);
        const game = createGame(clock, this);

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

        if (this.props.watch) {
            this.props.watch(this.state)
        }

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

    onSceneManagerReady(sceneManager) {
        sceneManager.goto(this.props.params.scene);
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
                controls
            );
            DebugHUD.scope = {
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
                    this.setState({video: clone(this.state.video)}); // Force video rerender
                }
            }
        }
    }

    render() {
        return <div ref={this.onLoad} style={fullscreen}>
            <canvas ref={this.onLoadCanvas} />
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
            {this.state.loading ? <Loader/> : null}
        </div>;
    }
}
