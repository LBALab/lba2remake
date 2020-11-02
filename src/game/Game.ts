import * as THREE from 'three';

import { initControlsState, ControlsState } from './ControlsState';
import { createGameState, GameState } from './GameState';
import { createAudioManager } from '../audio';
import { getLanguageConfig } from '../lang';
import DebugData from '../ui/editor/DebugData';
import { registerResources, preloadResources, getText } from '../resources';
import { getParams } from '../params';
import { pure } from '../utils/decorators';
import Renderer from '../renderer';
import Scene from './Scene';
import { Time } from '../datatypes';
import { getRandom } from '../utils/lba';

const emptyVRScene = {
    threeScene: new THREE.Scene(),
    camera: {
        resize: () => {},
        threeCamera: new THREE.PerspectiveCamera()
    }
};

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
    private _dbgClock: THREE.Clock;
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
        this._dbgClock = new THREE.Clock(true);
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

    update(renderer: Renderer, scene: Scene, controls: any[], vrScene = null) {
        const time = this.getTime();
        const uiState = this.getUiState();

        renderer.stats.begin();
        for (const ctrl of controls) {
            if (ctrl.update) {
                ctrl.update();
            }
        }
        if (scene && !uiState.showMenu && !uiState.video) {
            const step = this.isPaused() && DebugData.step;
            if (!this.isPaused() || step) {
                if (step) {
                    time.delta = 0.05;
                    time.elapsed += 0.05;
                    this.clock.elapsedTime += 0.05;
                }
                this.executePreloopFunctions();

                scene.scenery.update(this, scene, time);
                this.playAmbience(scene, time);
                scene.update(this, time);
                renderer.render(scene);
                DebugData.step = false;
                this.executePostloopFunctions();
            } else if (this.controlsState.freeCamera || DebugData.firstFrame) {
                const dbgTime = {
                    delta: Math.min(this._dbgClock.getDelta(), 0.05),
                    elapsed: this._dbgClock.getElapsedTime()
                };
                if (scene.firstFrame) {
                    scene.camera.init(scene, this.controlsState);
                }
                scene.camera.update(scene, this.controlsState, dbgTime);
                renderer.render(scene);
            } else if (renderer.vr) {
                renderer.render(emptyVRScene);
            }
            scene.firstFrame = false;
            delete DebugData.firstFrame;
        } else if (vrScene) {
            renderer.render(vrScene);
        }
        renderer.stats.end();
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

    private playAmbience(scene: Scene, time: Time) {
        let samplePlayed = 0;
        const audio = this.getAudioManager();

        if (time.elapsed >= scene.props.ambience.sampleElapsedTime) {
            let currentAmb = getRandom(1, 4);
            currentAmb &= 3;
            for (let s = 0; s < 4; s += 1) {
                if (!(samplePlayed & (1 << currentAmb))) {
                    samplePlayed |= (1 << currentAmb);
                    if (samplePlayed === 15) {
                        samplePlayed = 0;
                    }
                    const sample = scene.props.ambience.samples[currentAmb];
                    if (sample.ambience !== -1 && sample.repeat !== 0) {
                        if (!audio.isPlayingSample(sample.ambience)) {
                            audio.playSample(sample.ambience, sample.frequency);
                        }
                        break;
                    }
                }
                currentAmb += 1;
                currentAmb &= 3;
            }
            const { sampleMinDelay, sampleMinDelayRnd } = scene.props.ambience;
            scene.props.ambience.sampleElapsedTime =
                time.elapsed + (getRandom(0, sampleMinDelayRnd) + sampleMinDelay);
        }
        if (scene.props.ambience.sampleMinDelay < 0) {
            scene.props.ambience.sampleElapsedTime = time.elapsed + 200000;
        }
    }
}
