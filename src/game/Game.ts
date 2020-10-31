import * as THREE from 'three';

import { initControlsState, ControlsState } from './ControlsState';
import { createGameState, GameState } from './GameState';
import { createAudioManager } from '../audio';
import { getLanguageConfig } from '../lang';
import DebugData from '../ui/editor/DebugData';
import { registerResources, preloadResources, getText } from '../resources';
import { getParams } from '../params';
import { pure } from '../utils/decorators';

interface LoopFunction {
    preLoopFunction: Function;
    postLoopFunction: Function;
    shouldExecute: boolean;
}

export default class Game {
    readonly setUiState: Function;
    readonly getUiState: Function;
    readonly vr: boolean;
    readonly clock: THREE.Clock;
    readonly controlsState: ControlsState;
    private _gameState: GameState;
    private _isPaused: boolean;
    private _isLoading: boolean;
    private _audio: any;
    private _loopFunctions: LoopFunction[];
    menuTexts: any;
    texts: any;

    constructor(setUiState: Function, getUiState: Function, vr: boolean) {
        this.setUiState = setUiState;
        this.getUiState = getUiState;
        this.vr = vr;
        this.clock = new THREE.Clock(false);
        this.controlsState = initControlsState(vr);
        this._gameState = createGameState();
        this._isPaused = false;
        this._isLoading = false;
        this._audio = createAudioManager(this._gameState);
        this._loopFunctions = [];
    }

    dispose() {
        this._audio.dispose();
    }

    resetState() {
        this._gameState = createGameState();
        this.resetControlsState();
    }

    resetControlsState() {
        this.controlsState.controlVector.set(0, 0),
        this.controlsState.action = 0;
        this.controlsState.jump = 0;
        this.controlsState.fight = 0;
        this.controlsState.crouch = 0;
        this.controlsState.weapon = 0;
    }

    loading(index: number) {
        this._isPaused = true;
        this._isLoading = true;
        this.clock.stop();
        this.setUiState({loading: true});
        // tslint:disable-next-line:no-console
        console.log(`Loading scene #${index}...`);
    }

    loaded(what: string, wasPaused: boolean = false) {
        this._isPaused = wasPaused;
        if (!this._isPaused) {
            this.clock.start();
        } else {
            DebugData.firstFrame = true;
        }
        this._isLoading = false;
        this.setUiState({loading: false});
        // tslint:disable-next-line:no-console
        console.log(`Loaded ${what}!`);
    }

    @pure()
    isPaused() {
        return this._isPaused;
    }

    @pure()
    isLoading() {
        return this._isLoading;
    }

    @pure()
    getState() {
        return this._gameState;
    }

    @pure()
    getAudioManager() {
        return this._audio;
    }

    togglePause() {
        if (this._isPaused) {
            this.resume();
        } else {
            this.pause();
        }
    }

    getTime() {
        return {
            delta: Math.min(this.clock.getDelta(), 0.025),
            elapsed: this.clock.getElapsedTime(),
        };
    }

    pause(pauseAudio = true) {
        this._isPaused = true;
        this.clock.stop();
        if (pauseAudio) {
            this._audio.pause();
        }
    }

    resume(pauseAudio = true) {
        if (this._isPaused) {
            if (pauseAudio) {
                this._audio.resume();
            }
            this._isPaused = false;
            this.clock.start();
        }
    }

    addLoopFunction(preFunc: Function, postFunc: Function) {
        this._loopFunctions.push({
            preLoopFunction: preFunc,
            postLoopFunction: postFunc,
            shouldExecute: false,
        });
    }

    executePreloopFunctions() {
        for (const f of this._loopFunctions) {
            f.shouldExecute = true;
            if (f.preLoopFunction) {
                f.preLoopFunction();
            }
        }
    }

    executePostloopFunctions() {
        const newLoopFunctions = [];
        this._loopFunctions.forEach((f) => {
            if (f.shouldExecute) {
                if (f.postLoopFunction) {
                    f.postLoopFunction();
                }
                // Don't copy this function, it's completed.
                return;
            }
            newLoopFunctions.push(f);
        });
        this._loopFunctions = newLoopFunctions;
    }

    async registerResources() {
        const { language, languageVoice } = getLanguageConfig();
        await registerResources(getParams().game, language.code, languageVoice.code);
    }

    async preload() {
        await preloadResources();
        await this._audio.preloadMusicTheme();

        const [menuTexts, gameTexts] = await Promise.all([
            getText(0),
            getText(4)
        ]);
        this.menuTexts = menuTexts;
        this.texts = gameTexts;
    }
}
