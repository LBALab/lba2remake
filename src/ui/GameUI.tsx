import * as React from 'react';
import * as THREE from 'three';
import {clone, omit} from 'lodash';

import Renderer from '../renderer';
import {createGame} from '../game/index';
import {mainGameLoop} from '../game/loop';
import {createSceneManager} from '../game/scenes';
import {createControls} from '../controls/index';

import {fullscreen} from './styles/index';

import FrameListener from './utils/FrameListener';
import CinemaEffect from './game/CinemaEffect';
import TextBox from './game/TextBox';
import AskChoice from './game/AskChoice';
import TextInterjections from './game/TextInterjections';
import FoundObject from './game/FoundObject';
import Loader from './game/Loader';
import Video from './game/Video';
import DebugData from './editor/DebugData';
import Menu from './game/Menu';
import TeleportMenu from './game/TeleportMenu';
import Ribbon from './game/Ribbon';
import {KeyHelpIcon, KeyHelpScreen} from './game/KeyboardHelp';
import {sBind} from '../utils';
import {TickerProps } from './utils/Ticker';
import {updateLabels} from './editor/labels';
import { setFog } from './editor/fog';
import { pure } from '../utils/decorators';
import { getResourcePath, ResourceType } from '../resources';
import BehaviourMenu from './game/BehaviourMenu';
import NoAudio from './game/NoAudio';

interface GameUIProps extends TickerProps {
    saveMainData?: Function;
    mainData?: {
        canvas: HTMLCanvasElement;
    };
    params: any;
    sharedState?: any;
}

interface GameUIState {
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
    ask: {
        text?: {
            value: string;
            color: string;
            type: string;
        };
        choices: any[];
    };
    interjections: {};
    foundObject?: any;
    loading: boolean;
    video?: any;
    choice?: number;
    menuTexts?: any;
    showMenu: boolean;
    inGameMenu: boolean;
    teleportMenu: boolean;
    keyHelp: boolean;
    behaviourMenu: boolean;
    noAudio: boolean;
}

export default class GameUI extends FrameListener<GameUIProps, GameUIState> {
    canvas: HTMLCanvasElement;
    renderZoneElem: HTMLElement;
    canvasWrapperElem: HTMLElement;
    preloadPromise: Promise<void>;

    constructor(props) {
        super(props);

        this.onRenderZoneRef = this.onRenderZoneRef.bind(this);
        this.onCanvasWrapperRef = this.onCanvasWrapperRef.bind(this);
        this.frame = this.frame.bind(this);
        this.saveData = this.saveData.bind(this);
        this.onSceneManagerReady = this.onSceneManagerReady.bind(this);
        this.onGameReady = this.onGameReady.bind(this);
        this.onAskChoiceChanged = this.onAskChoiceChanged.bind(this);
        this.onMenuItemChanged = this.onMenuItemChanged.bind(this);
        this.setUiState = sBind(this.setUiState, this);
        this.getUiState = sBind(this.getUiState, this);
        this.listenerKeyDown = this.listenerKeyDown.bind(this);
        this.listenerKeyUp = this.listenerKeyUp.bind(this);
        this.showMenu = this.showMenu.bind(this);
        this.hideMenu = this.hideMenu.bind(this);
        this.openKeyHelp = this.openKeyHelp.bind(this);
        this.closeKeyHelp = this.closeKeyHelp.bind(this);
        this.pick = this.pick.bind(this);
        this.startNewGameScene = this.startNewGameScene.bind(this);
        this.textAnimEndedHandler = this.textAnimEndedHandler.bind(this);
        this.noAudioClick = this.noAudioClick.bind(this);

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
                this.getUiState,
                props.params,
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
                keyHelp: false,
                behaviourMenu: false,
                noAudio: !game.getAudioManager().isContextActive(),
            };

            clock.start();
            this.preloadPromise = this.preload(game);
        }
    }

    async preload(game) {
        await game.registerResources();
        await game.preload();
        this.onGameReady();
    }

    setUiState(state) {
        this.setState(state, this.saveData);
    }

    @pure()
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
                    this.state.sceneManager
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
                const renderer = new Renderer(this.props.params, this.canvas, {}, 'game');
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
                        sceneManager
                    );
                }
                this.setState({ renderer, sceneManager, controls }, this.saveData);
            }
            this.canvasWrapperElem = canvasWrapperElem;
            this.canvasWrapperElem.appendChild(this.canvas);
        }
    }

    async onSceneManagerReady(sceneManager) {
        if (this.props.params.scene >= 0) {
            await this.preloadPromise;
            sceneManager.hideMenuAndGoto(this.props.params.scene);
        }
    }

    componentWillMount() {
        super.componentWillMount();
        window.addEventListener('keydown', this.listenerKeyDown);
        window.addEventListener('keyup', this.listenerKeyUp);
    }

    componentWillUnmount() {
        window.removeEventListener('keyup', this.listenerKeyUp);
        window.removeEventListener('keydown', this.listenerKeyDown);
        super.componentWillUnmount();
    }

    componentWillReceiveProps(newProps) {
        if (newProps.params.scene !== this.props.params.scene) {
            if (newProps.params.scene !== -1) {
                this.state.sceneManager.hideMenuAndGoto(newProps.params.scene);
            } else {
                this.state.sceneManager.unloadScene();
                this.showMenu();
            }
        }
    }

    onGameReady() {
        this.state.game.loaded('game');
        if (this.props.params.scene === -1) {
            this.showMenu();
        }
    }

    showMenu(inGameMenu = false) {
        this.state.game.pause();
        const audio = this.state.game.getAudioManager();
        audio.playMusicTheme();
        this.setState({showMenu: true, inGameMenu}, this.saveData);
    }

    hideMenu(wasPaused = false) {
        const audio = this.state.game.getAudioManager();
        audio.stopMusicTheme();
        if (!wasPaused)
            this.state.game.resume();
        this.setState({showMenu: false, inGameMenu: false}, this.saveData);
        this.canvas.focus();
    }

    openKeyHelp() {
        this.setState({keyHelp: true}, this.saveData);
    }

    closeKeyHelp() {
        this.setState({keyHelp: false}, this.saveData);
    }

    listenerKeyDown(event) {
        const key = event.code || event.which || event.keyCode;
        if (!this.state.video) {
            if (key === 'Escape' || key === 27) {
                if (this.state.teleportMenu) {
                    this.setState({teleportMenu: false});
                } else if (!this.state.game.isPaused()) {
                    this.showMenu(true);
                } else if (this.state.showMenu && this.state.inGameMenu) {
                    this.hideMenu();
                }
            }
            const isMac = /^Mac/.test(navigator && navigator.platform);
            const showBehaviourMenu =
                this.state.ask.choices.length === 0 &&
                this.state.text === null &&
                this.state.foundObject === null &&
                (!this.state.showMenu || !this.state.inGameMenu);
            if (showBehaviourMenu &&
                ((!isMac && (key === 'ControlLeft' || key === 'ControlRight' || key === 17))
                || (isMac && (key === 'MetaLeft' || key === 'MetaRight' || key === 91)))) {
                this.setState({ behaviourMenu: true });
                if (!this.state.cinema && this.state.scene && this.state.scene.actors[0]) {
                    this.state.scene.actors[0].cancelAnims();
                }
                this.state.game.pause(false);
            }
        }
    }

    listenerKeyUp(event) {
        const key = event.code || event.which || event.keyCode;
        const isMac = /^Mac/.test(navigator && navigator.platform);
        const hideBehaviourMenu =
            this.state.ask.choices.length === 0 &&
            this.state.text === null &&
            this.state.foundObject === null &&
            (!this.state.showMenu || !this.state.inGameMenu);
        if (hideBehaviourMenu &&
            ((!isMac && (key === 'ControlLeft' || key === 'ControlRight' || key === 17))
            || (isMac && (key === 'MetaLeft' || key === 'MetaRight' || key === 91)))) {
            this.setState({ behaviourMenu: false });
            this.state.game.resume(false);
        }
    }

    pick(event) {
        const scene = this.state.scene;
        if (this.props.params.editor && scene && this.canvas) {
            const { clientWidth, clientHeight } = this.canvas;
            const mouse = new THREE.Vector2(
                ((event.clientX / clientWidth) * 2) - 1,
                -((event.clientY / clientHeight) * 2) + 1
            );
            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, scene.camera.threeCamera);

            const tgt = new THREE.Vector3();

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
                const onEnded = () => {
                    this.setState({video: null}, this.saveData);
                    this.startNewGameScene();
                    this.state.game.controlsState.skipListener = null;
                };
                this.state.game.controlsState.skipListener = onEnded;
                this.state.game.pause();
                this.setState({
                    video: {
                        path: getResourcePath(ResourceType.VIDEO_INTRO),
                        onEnded
                    }
                }, this.saveData);
                break;
            }
            case -1: { // Teleport
                this.setState({teleportMenu: true});
                break;
            }
            case -2: { // Editor Mode
                const renderer = this.state.renderer;
                if (renderer) {
                    renderer.dispose();
                }
                const game = this.state.game;
                if (game) {
                    const audio = game.getAudioManager();
                    audio.stopMusicTheme();
                }
                if ('exitPointerLock' in document) {
                    document.exitPointerLock();
                }
                if (window.location.hash) {
                    window.location.hash = `${window.location.hash}&editor=true`;
                } else {
                    window.location.hash = 'editor=true';
                }
                break;
            }
            case -3: { // Exit editor
                const renderer = this.state.renderer;
                if (renderer) {
                    renderer.dispose();
                }
                const game = this.state.game;
                if (game) {
                    const audio = game.getAudioManager();
                    audio.stopMusicTheme();
                }
                if ('exitPointerLock' in document) {
                    document.exitPointerLock();
                }
                window.location.hash = '';
                break;
            }
        }
    }

    frame() {
        const {game, clock, renderer, sceneManager, controls} = this.state;
        if (renderer && sceneManager) {
            this.checkResize();
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
            if (this.props.params.editor) {
                DebugData.scope = {
                    params: this.props.params,
                    game,
                    clock,
                    renderer,
                    scene,
                    sceneManager,
                    hero: scene && scene.actors[0],
                    controls,
                    ui: omit(
                        this.state,
                        'clock',
                        'game',
                        'renderer',
                        'sceneManager',
                        'controls',
                        'scene'
                    )
                };
                DebugData.sceneManager = sceneManager;
                updateLabels(scene, this.props.sharedState.labels);
                setFog(scene, this.props.sharedState.fog);
            }
        }
    }

    checkResize() {
        if (this.canvasWrapperElem && this.canvas && this.state.renderer) {
            const { clientWidth, clientHeight } = this.canvasWrapperElem;
            const rWidth = `${clientWidth}px`;
            const rHeight = `${clientHeight}px`;
            const style = this.canvas.style;
            if (rWidth !== style.width || rHeight !== style.height) {
                this.state.renderer.resize(clientWidth, clientHeight);
                if (this.state.video) {
                    this.setState({
                        video: clone(this.state.video)
                    }, this.saveData); // Force video rerender
                }
            }
        }
    }

    onAskChoiceChanged(choice) {
        this.setState({choice}, this.saveData);
    }

    textAnimEndedHandler() {
        this.setUiState({ skip: true });
    }

    async noAudioClick() {
        const audio = this.state.game.getAudioManager();
        audio.resumeContext();
        this.setState({ noAudio: false }, () => {
            if (this.state.showMenu) {
                audio.playMusicTheme();
            }
        });
    }

    render() {
        return <div ref={this.onRenderZoneRef} id="renderZone" style={fullscreen} tabIndex={0}>
            <div ref={this.onCanvasWrapperRef} style={fullscreen} onClick={this.pick}/>
            {this.renderGUI()}
        </div>;
    }

    renderGUI() {
        const {
            cinema,
            scene,
            renderer,
            interjections,
            video,
            behaviourMenu,
            game,
            showMenu,
            teleportMenu,
            inGameMenu,
            sceneManager,
            loading,
            text,
            skip,
            foundObject,
            keyHelp,
            ask,
            noAudio,
        } = this.state;
        return <React.Fragment>
            <CinemaEffect enabled={cinema} />
            <TextInterjections
                scene={scene}
                renderer={renderer}
                interjections={interjections}
            />
            <Video video={video} renderer={renderer} />
            {behaviourMenu ?
                <BehaviourMenu
                    game={game}
                    sceneManager={scene}
                />
            : null }
            <Menu
                params={this.props.params}
                showMenu={showMenu && !teleportMenu}
                texts={game.menuTexts}
                inGameMenu={inGameMenu}
                onItemChanged={this.onMenuItemChanged}
            />
            {showMenu && !teleportMenu
                && <KeyHelpIcon open={this.openKeyHelp}/>}
            <Ribbon mode={showMenu ? 'menu' : 'game'} />
            {teleportMenu
                && <TeleportMenu
                    inGameMenu={inGameMenu}
                    game={game}
                    sceneManager={sceneManager}
                    exit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.setState({teleportMenu: false});
                    }}
                />}
            <div id="stats" style={{position: 'absolute', top: 0, left: 0, width: '50%'}}/>
            {loading ? <Loader/> : null}
            {!showMenu ? <TextBox
                text={text}
                skip={skip}
                textAnimEnded={this.textAnimEndedHandler}
            /> : null}
            {!showMenu ? <AskChoice
                ask={ask}
                onChoiceChanged={this.onAskChoiceChanged}
            /> : null}
            {foundObject !== null && !showMenu ? <FoundObject foundObject={foundObject} /> : null}
            {keyHelp && <KeyHelpScreen close={this.closeKeyHelp}/>}
            {noAudio && (
                <NoAudio onClick={this.noAudioClick} />
            )}
        </React.Fragment>;
    }
}
