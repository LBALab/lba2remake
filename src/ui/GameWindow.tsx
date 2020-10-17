import * as React from 'react';
import * as THREE from 'three';
import {clone} from 'lodash';

import Renderer from '../renderer';
import { Game } from '../game/game';
import {mainGameLoop} from '../game/loop';
import { SceneManager } from '../game/scenes';
import {createControls} from '../controls/index';

import {fullscreen} from './styles/index';

import FrameListener from './utils/FrameListener';
import {sBind} from '../utils';
import {TickerProps } from './utils/Ticker';
import {updateLabels} from './editor/labels';
import { setFog } from './editor/fog';
import { pure } from '../utils/decorators';
import { loadPoint } from '../game/points';
import { loadActor, createNewActorProps, initDynamicNewActor } from '../game/actors';
import GameUI from './GameUI';
import DebugData from './editor/DebugData';
import { getParams } from '../params';
import UIState, { initUIState } from './UIState';
import { tr } from '../lang';
import Loader from './game/Loader';
import { updateVRScene, loadVRScene } from './vr/vrScene';

interface GameWindowProps extends TickerProps {
    sharedState?: any;
    stateHandler?: any;
    exitVR?: () => any;
    vr: boolean;
}

interface GameWindowState extends UIState {
    enteredVR: boolean;
}

export default class GameWindow extends FrameListener<GameWindowProps, GameWindowState> {
    readonly canvas: HTMLCanvasElement;
    readonly game: Game;
    readonly renderer: any;
    readonly sceneManager: SceneManager;
    readonly preloadPromise: Promise<void>;
    controls?: [any];
    wrapperElem: HTMLDivElement;
    vrScene?: any;
    vrSession?: any;

    constructor(props) {
        super(props);

        this.onWrapperElem = this.onWrapperElem.bind(this);
        this.frame = this.frame.bind(this);
        this.onSceneManagerReady = this.onSceneManagerReady.bind(this);
        this.onGameReady = this.onGameReady.bind(this);
        this.setUiState = sBind(this.setUiState, this);
        this.getUiState = sBind(this.getUiState, this);
        this.showMenu = this.showMenu.bind(this);
        this.hideMenu = this.hideMenu.bind(this);
        this.pick = this.pick.bind(this);
        this.onSessionEnd = this.onSessionEnd.bind(this);
        this.requestPresence = this.requestPresence.bind(this);
        this.exitVR = this.exitVR.bind(this);

        this.game = new Game(
            this.setUiState,
            this.getUiState,
            this.props.vr
        );

        this.canvas = document.createElement('canvas');
        this.renderer = new Renderer(this.canvas, 'game', { vr: this.props.vr });
        this.sceneManager = new SceneManager(
            this.game,
            this.renderer,
            this.hideMenu.bind(this)
        );
        this.vrSession = null;

        this.state = {
            ...initUIState(this.game),
            enteredVR: false
        };

        this.preloadPromise = this.preload(this.game);
    }

    async preload(game) {
        await game.registerResources();
        await game.preload();
        this.onGameReady();
    }

    setUiState(state, callback) {
        this.setState(state, callback);
    }

    @pure()
    getUiState() {
        return this.state;
    }

    async onWrapperElem(wrapperElem) {
        if (!this.wrapperElem && wrapperElem) {
            this.renderer.threeRenderer.setAnimationLoop(() => {
                this.props.ticker.frame();
            });
            this.onSceneManagerReady(this.sceneManager);
            this.controls = createControls(
                this.props.vr,
                this.game,
                wrapperElem,
                this.sceneManager,
                this.renderer
            );
            this.wrapperElem = wrapperElem;
            this.wrapperElem.querySelector('.canvasWrapper').appendChild(this.canvas);
        }
    }

    async onSceneManagerReady(sceneManager) {
        if (getParams().scene >= 0) {
            await this.preloadPromise;
            sceneManager.hideMenuAndGoto(getParams().scene);
        }
    }

    checkSceneChange() {
        const sceneParam = getParams().scene;
        const scene = this.sceneManager.getScene();
        if (scene && sceneParam !== -1 && scene.index !== sceneParam) {
            this.sceneManager.hideMenuAndGoto(sceneParam);
        }
    }

    onGameReady() {
        this.game.loaded('game');
        this.game.clock.start();
        if (getParams().scene === -1) {
            this.showMenu();
        }
        if (this.props.vr) {
            this.vrScene = loadVRScene(this.game, this.sceneManager, this.renderer);
        }
    }

    showMenu(inGameMenu = false) {
        this.game.pause();
        const audio = this.game.getAudioManager();
        audio.playMusicTheme();
        this.setState({showMenu: true, inGameMenu});
    }

    hideMenu(wasPaused = false) {
        const audio = this.game.getAudioManager();
        audio.stopMusicTheme();
        if (!wasPaused)
            this.game.resume();
        this.setState({showMenu: false, inGameMenu: false});
        this.canvas.focus();
    }

    async pick(event) {
        const scene = this.sceneManager.getScene();
        if (getParams().editor && scene && this.canvas) {
            const rect = this.canvas.getBoundingClientRect();
            const mouse = new THREE.Vector2();
            mouse.x = ((event.clientX - rect.left) / (rect.width - rect.left)) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / (rect.bottom - rect.top)) * 2 + 1;

            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, scene.camera.threeCamera);

            const { sharedState } = this.props;
            if (sharedState && sharedState.objectToAdd) {
                return this.addNewObject(sharedState.objectToAdd, raycaster);
            }

            const tgt = new THREE.Vector3();

            const foundActor = scene.actors.find((actor) => {
                if (actor.threeObject.visible && actor.model) {
                    const bb = actor.model.boundingBox.clone();
                    bb.applyMatrix4(actor.threeObject.matrixWorld);
                    return raycaster.ray.intersectBox(bb, tgt);
                }
                return false;
            });
            if (foundActor) {
                DebugData.selection = {type: 'actor', index: foundActor.index};
                event.stopPropagation();
                return;
            }

            const foundPoint = scene.points.find((point) => {
                if (point.threeObject.visible) {
                    const bb = point.boundingBox.clone();
                    bb.applyMatrix4(point.threeObject.matrixWorld);
                    return raycaster.ray.intersectBox(bb, tgt);
                }
                return false;
            });
            if (foundPoint) {
                DebugData.selection = {type: 'point', index: foundPoint.index};
                event.stopPropagation();
                return;
            }

            const foundZone = scene.zones.find((zone) => {
                if (zone.threeObject.visible) {
                    const bb = zone.boundingBox.clone();
                    bb.applyMatrix4(zone.threeObject.matrixWorld);
                    return raycaster.ray.intersectBox(bb, tgt);
                }
                return false;
            });
            if (foundZone) {
                DebugData.selection = {type: 'zone', index: foundZone.index};
                event.stopPropagation();
            }
        }
    }

    async addNewObject(objectToAdd, raycaster) {
        const scene = this.sceneManager.getScene();
        const [result] = raycaster.intersectObject(scene.scenery.threeObject, true);
        if (result) {
            let obj = null;
            const position = result.point.clone();
            if (scene.isIsland) {
                position.sub(scene.sceneNode.position);
            }
            if (objectToAdd.type === 'point') {
                obj = loadPoint({
                    sceneIndex: scene.index,
                    index: scene.points.length,
                    pos: position.toArray()
                });
            }
            if (objectToAdd.type === 'actor') {
                const actor = await loadActor(
                    this.game,
                    scene.is3DCam,
                    scene.envInfo,
                    scene.data.ambience,
                    createNewActorProps(scene, position, objectToAdd.details),
                    !scene.isActive,
                    {}
                );
                initDynamicNewActor(this.game, scene, actor);
                obj = actor;
            }
            if (obj) {
                obj.threeObject.visible = true;
                scene[`${objectToAdd.type}s`].push(obj);
                scene.sceneNode.add(obj.threeObject);
                this.props.stateHandler.setAddingObject(null);
            }
        }
    }

    frame() {
        const params = getParams();
        this.checkSceneChange();
        if (!this.props.vr || params.vrEmulator) {
            this.checkResize();
        }
        const scene = this.sceneManager.getScene();
        mainGameLoop(
            this.game,
            this.renderer,
            scene,
            this.controls,
            this.vrScene
        );
        if (params.editor) {
            DebugData.scope = {
                params: getParams(),
                game: this.game,
                renderer: this.renderer,
                scene,
                sceneManager: this.sceneManager,
                hero: scene && scene.actors[0],
                controls: this.controls,
                uiState: this.state
            };
            DebugData.sceneManager = this.sceneManager;
            updateLabels(scene, this.props.sharedState.labels);
            setFog(scene, this.props.sharedState.fog);
        }
        if (this.vrScene) {
            const presenting = this.renderer.isPresenting();
            updateVRScene(
                this.vrScene,
                presenting,
                this.game,
                this.sceneManager
            );
        }
    }

    checkResize() {
        if (this.wrapperElem) {
            const { clientWidth, clientHeight } = this.wrapperElem;
            const rWidth = `${clientWidth}px`;
            const rHeight = `${clientHeight}px`;
            const style = this.canvas.style;
            if (rWidth !== style.width || rHeight !== style.height) {
                this.renderer.resize(clientWidth, clientHeight);
                if (this.state.video) {
                    this.setState({
                        video: clone(this.state.video)
                    }); // Force video rerender
                }
            }
        }
    }

    render() {
        return <div ref={this.onWrapperElem} style={fullscreen} tabIndex={0}>
            <div className="canvasWrapper" style={fullscreen} onClick={this.pick}/>
            {this.props.vr
                ? this.renderVRGUI()
                : this.renderGUI()
            }
        </div>;
    }

    renderGUI() {
        return <GameUI
            game={this.game}
            renderer={this.renderer}
            sceneManager={this.sceneManager}
            showMenu={this.showMenu}
            hideMenu={this.hideMenu}
            setUiState={this.setUiState}
            uiState={this.state}
            sharedState={this.props.sharedState}
            stateHandler={this.props.stateHandler}
        />;
    }

    /* VR */
    renderVRGUI() {
        if (this.vrSession && this.vrSession.visibilityState !== 'hidden')
            return null;

        return <React.Fragment>
            {this.renderVRSelector()}
            {this.state.loading ? <Loader/> : null}
        </React.Fragment>;
    }

    async requestPresence() {
        this.game.getAudioManager().resumeContext();
        this.vrSession = await (navigator as any).xr.requestSession('immersive-vr');
        this.vrSession.addEventListener('end', this.onSessionEnd);
        this.renderer.threeRenderer.xr.setSession(this.vrSession);
        this.setState({ enteredVR: true });
    }

    onSessionEnd() {
        this.vrSession.removeEventListener('end', this.onSessionEnd);
        this.vrSession = null;
        this.forceUpdate();
    }

    exitVR() {
        this.game.getAudioManager().stopMusicTheme();
        this.props.exitVR();
    }

    renderVRSelector() {
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
                {!this.state.enteredVR && <div style={buttonStyle2} onClick={this.exitVR}>
                    {tr('PlayOnScreen')}
                </div>}
            </div>
        </div>;
    }
}
