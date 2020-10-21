import * as React from 'react';

import {fullscreen} from './styles/index';

import CinemaEffect from './game/CinemaEffect';
import TextBox from './game/TextBox';
import AskChoice from './game/AskChoice';
import TextInterjections from './game/TextInterjections';
import FoundObject from './game/FoundObject';
import Loader from './game/Loader';
import Video from './game/Video';
import Menu from './game/Menu';
import TeleportMenu from './game/TeleportMenu';
import Ribbon from './game/Ribbon';
import {KeyHelpIcon, KeyHelpScreen} from './game/KeyboardHelp';
import { getVideoPath } from '../resources';
import BehaviourMenu from './game/BehaviourMenu';
import Inventory from './game/Inventory';
import NoAudio from './game/NoAudio';
import UIState from './UIState';
import { SceneManager } from '../game/SceneManager';
import Renderer from '../renderer';
import Game from '../game/Game';

interface GameUIProps {
    uiState: UIState;
    game: Game;
    renderer: Renderer;
    sceneManager: SceneManager;
    setUiState: (state: any, callback?: Function) => void;
    sharedState?: any;
    stateHandler?: any;
    showMenu: (inGameMenu?: boolean) => void;
    hideMenu: (wasPaused?: boolean) => void;
}

interface GameUIState {
    keyHelp: boolean;
}

export default class GameUI extends React.Component<GameUIProps, GameUIState> {
    constructor(props) {
        super(props);

        this.listenerKeyDown = this.listenerKeyDown.bind(this);
        this.listenerKeyUp = this.listenerKeyUp.bind(this);
        this.openKeyHelp = this.openKeyHelp.bind(this);
        this.closeKeyHelp = this.closeKeyHelp.bind(this);
        this.startNewGameScene = this.startNewGameScene.bind(this);
        this.onMenuItemChanged = this.onMenuItemChanged.bind(this);
        this.textAnimEndedHandler = this.textAnimEndedHandler.bind(this);
        this.noAudioClick = this.noAudioClick.bind(this);
        this.onAskChoiceChanged = this.onAskChoiceChanged.bind(this);

        this.state = {
            keyHelp: false
        };
    }

    componentWillMount() {
        window.addEventListener('keydown', this.listenerKeyDown);
        window.addEventListener('keyup', this.listenerKeyUp);
    }

    componentWillUnmount() {
        window.removeEventListener('keyup', this.listenerKeyUp);
        window.removeEventListener('keydown', this.listenerKeyDown);
    }

    openKeyHelp() {
        this.setState({keyHelp: true});
    }

    closeKeyHelp() {
        this.setState({keyHelp: false});
    }

    listenerKeyDown(event) {
        const key = event.code || event.which || event.keyCode;
        const {
            uiState,
            game,
            sceneManager,
            stateHandler,
            sharedState
        } = this.props;
        if (!uiState.video) {
            if (key === 'Escape' || key === 27) {
                if (sharedState && sharedState.objectToAdd) {
                    stateHandler.setAddingObject(null);
                } else if (uiState.teleportMenu) {
                    this.props.setUiState({ teleportMenu: false });
                } else if (!game.isPaused()) {
                    this.props.showMenu(true);
                } else if (uiState.showMenu && uiState.inGameMenu) {
                    this.props.hideMenu();
                }
            }
            const showBehaviourMenu =
                !uiState.loading &&
                uiState.ask.choices.length === 0 &&
                uiState.text === null &&
                uiState.foundObject === null &&
                !(uiState.showMenu || uiState.inGameMenu) &&
                !this.props.uiState.inventory;
            if (showBehaviourMenu && this.isBehaviourKey(key)) {
                this.props.setUiState({ behaviourMenu: true });
                const scene = sceneManager.getScene();
                if (!uiState.cinema && scene && scene.actors[0]) {
                    scene.actors[0].cancelAnims();
                }
                game.pause(false);
            }
            const showInventory =
                !uiState.loading &&
                uiState.ask.choices.length === 0 &&
                uiState.text === null &&
                uiState.foundObject === null &&
                !(uiState.showMenu || uiState.inGameMenu) &&
                !this.props.uiState.behaviourMenu;
            if (showInventory && this.isInventoryKey(key)) {
                this.props.setUiState({ inventory: !this.props.uiState.inventory });
                if (game.isPaused()) {
                    game.resume(false);
                } else {
                    game.pause(false);
                }
            }
        }
    }

    listenerKeyUp(event) {
        const key = event.code || event.which || event.keyCode;
        const {
            game,
        } = this.props;

        if (this.props.uiState.behaviourMenu && this.isBehaviourKey(key)) {
            this.props.setUiState({ behaviourMenu: false });
            game.resume(false);
        }
    }

    isInventoryKey(key) {
        return key === 'ShiftLeft' || key === 'ShiftRight';
    }

    isBehaviourKey(key) {
        const isMac = /^Mac/.test(navigator && navigator.platform);
        if (isMac) {
            return key === 'MetaLeft' || key === 'MetaRight' || key === 91;
        }
        return key === 'ControlLeft' || key === 'ControlRight' || key === 17;
    }

    startNewGameScene() {
        const { game, sceneManager } = this.props;
        game.resume();
        game.resetState();
        sceneManager.goto(0, true);
    }

    onMenuItemChanged(item) {
        const { game, renderer } = this.props;
        switch (item) {
            case 70: { // Resume
                this.props.hideMenu();
                break;
            }
            case 71: { // New Game
                this.props.hideMenu();
                const onEnded = () => {
                    this.props.setUiState({video: null});
                    this.startNewGameScene();
                    game.controlsState.skipListener = null;
                };
                game.controlsState.skipListener = onEnded;
                game.pause();
                const videoPath = getVideoPath('INTRO');
                if (videoPath !== undefined) {
                    this.props.setUiState({
                        video: {
                            path: videoPath,
                            onEnded
                        }
                    });
                } else {
                    onEnded();
                }
                break;
            }
            case -1: { // Teleport
                this.props.setUiState({teleportMenu: true});
                break;
            }
            case -2: { // Editor Mode
                renderer.dispose();
                const audio = game.getAudioManager();
                audio.stopMusicTheme();
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
                renderer.dispose();
                const audio = game.getAudioManager();
                audio.stopMusicTheme();
                if ('exitPointerLock' in document) {
                    document.exitPointerLock();
                }
                window.location.hash = '';
                break;
            }
            case -4: { // Enable Iso 3d
                if (window.location.hash) {
                    window.location.hash = `${window.location.hash}&iso3d=true`;
                } else {
                    window.location.hash = 'iso3d=true';
                }
                location.reload();
                break;
            }
            case -5: { // Disable Iso 3d
                window.location.hash = window.location.hash.replace('iso3d=true', '');
                location.reload();
                break;
            }
        }
    }

    onAskChoiceChanged(choice) {
        this.props.setUiState({choice});
    }

    textAnimEndedHandler() {
        this.props.setUiState({ skip: true });
    }

    async noAudioClick() {
        const { uiState } = this.props;
        const audio = this.props.game.getAudioManager();
        audio.resumeContext();
        this.props.setUiState({ noAudio: false }, () => {
            if (uiState.showMenu) {
                audio.playMusicTheme();
            }
        });
    }

    render() {
        const {
            game,
            renderer,
            sceneManager,
            uiState
        } = this.props;
        const {
            cinema,
            interjections,
            video,
            behaviourMenu,
            inventory,
            showMenu,
            teleportMenu,
            inGameMenu,
            loading,
            text,
            skip,
            foundObject,
            ask,
            noAudio
        } = uiState;
        const { keyHelp } = this.state;
        const scene = sceneManager.getScene();

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
                    scene={scene}
                />
            : null }
            {inventory ?
                <Inventory
                    game={game}
                    scene={scene}
                />
            : null }
            <Menu
                showMenu={showMenu && !teleportMenu}
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
                        this.props.setUiState({teleportMenu: false});
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
            {this.renderNewObjectPickerOverlay()}
            {keyHelp && <KeyHelpScreen close={this.closeKeyHelp}/>}
            {noAudio && (
                <NoAudio onClick={this.noAudioClick} />
            )}
        </React.Fragment>;
    }

    renderNewObjectPickerOverlay() {
        const { sharedState } = this.props;
        if (sharedState && sharedState.objectToAdd) {
            const baseBannerStyle = {
                ...fullscreen,
                height: 30,
                lineHeight: '30px',
                fontSize: 16,
                background: 'rgba(0, 0, 128, 0.5)',
                color: 'white'
            };
            const headerStyle = { ...baseBannerStyle, bottom: 'initial' };
            const footerStyle = { ...baseBannerStyle, top: 'initial' };
            return <React.Fragment>
                <div style={headerStyle}>
                    Pick a location for the new {sharedState.objectToAdd.type}...
                </div>
                <div style={footerStyle}/>
            </React.Fragment>;
        }
    }
}
