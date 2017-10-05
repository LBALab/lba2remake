import React from 'react';
import THREE from 'three';

import {createRenderer} from '../renderer';
import {createGame} from '../game';
import {mainGameLoop} from '../game/loop';
import {createSceneManager} from '../game/scenes';
import {initDebugHUD} from '../game/debugHUD';

import {makeFirstPersonMouseControls} from '../controls/mouse';
import {makeKeyboardControls} from '../controls/keyboard';
import {makeGyroscopeControls} from '../controls/gyroscope';
import {makeGamepadControls} from '../controls/gamepad';
import {makeFirstPersonTouchControls} from '../controls/touch';

export default class Game extends React.Component {
    constructor(props) {
        super(props);

        initDebugHUD();

        this.onLoad = this.onLoad.bind(this);
        this.frame = this.frame.bind(this);
        this.onSceneManagerReady = this.onSceneManagerReady.bind(this);

        const clock = new THREE.Clock(false);
        const game = createGame(clock);
        const renderer = createRenderer(props.vr);
        const sceneManager = createSceneManager(props, game, renderer, this.onSceneManagerReady);
        const controls = createControls(props, game, renderer, sceneManager);

        this.state = { clock, renderer, game, controls, sceneManager };

        clock.start();
        game.preload();
    }

    onLoad(content) {
        if (!this.content) {
            this.content = content;
            this.content.appendChild(this.state.renderer.domElement);
            this.frame();
        }
    }

    onSceneManagerReady() {
        this.state.sceneManager.goto(this.props.scene);
    }

    componentWillReceiveProps(newProps) {
        if (newProps.scene !== this.props.scene) {
            this.state.sceneManager.goto(newProps.scene);
        }
        if (newProps.vr !== this.props.vr) {
            this.content.removeChild(this.state.renderer.domElement);
            const renderer = createRenderer(newProps.vr);
            this.content.appendChild(renderer.domElement);
            this.setState({ renderer });
        }
    }

    frame() {
        const sceneManager = this.state.sceneManager;
        mainGameLoop(
            this.props,
            this.state.game,
            this.state.clock,
            this.state.renderer,
            sceneManager.getScene(),
            this.state.controls
        );
        requestAnimationFrame(this.frame);
    }

    render() {
        return <div ref={this.onLoad} />;
    }
}

function createControls(params, game, renderer, sceneManager) {
    let controls;
    if (params.vr) {
        controls = [
            makeGyroscopeControls(game),
            makeGamepadControls(sceneManager, game)
        ];
        if (!params.mobile) {
            controls.push(makeKeyboardControls(sceneManager, game));
        }
    }
    else if (params.mobile) {
        controls = [
            makeFirstPersonTouchControls(game),
            makeGamepadControls(sceneManager, game)
        ];
    } else {
        controls = [
            makeFirstPersonMouseControls(renderer.domElement, game),
            makeKeyboardControls(sceneManager, game),
            makeGamepadControls(sceneManager, game)
        ];
    }
    return controls;
}