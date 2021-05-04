import { killActor, reviveActor } from './scripting';
import { pure } from '../utils/decorators';
import { getParams } from '../params';
import Game from './Game';
import * as DBG from '../ui/editor/DebugData';
import Scene from './Scene';
import Renderer from '../renderer';
import {
    releaseSamples,
    releaseAnimations,
    releaseModels,
    releaseLibraries,
    releaseGrids,
    releaseScenes,
} from '../resources';

declare global {
    var ga: Function;
}

const { initSceneDebugData } = DBG;

export class SceneManager {
    private scene: Scene;
    private hideMenu: Function;
    private game: Game;
    private renderer: Renderer;

    constructor(game, renderer, hideMenu: Function) {
        this.game = game;
        this.renderer = renderer;
        this.hideMenu = hideMenu;
    }

    @pure()
    getScene() {
        return this.scene;
    }

    hideMenuAndGoto(index, wasPaused = false) {
        this.hideMenu(wasPaused);
        return this.goto(index, false, wasPaused);
    }

    async goto(index, force = false, wasPaused = false, teleport = true, lifeScript = false) {
        if ((!force && this.scene && index === this.scene.index) || this.game.isLoading())
            return this.scene;

        ga('set', 'page', `/scene/${index}`);
        ga('send', 'pageview');

        if (this.scene)
            this.scene.isActive = false;

        this.game.setUiState({ text: null });
        this.game.controlsState.skipListener = null;

        const hash = window.location.hash;
        if (hash.match(/scene=\d+/)) {
            window.location.hash = hash.replace(/scene=\d+/, `scene=${index}`);
        }

        const audio = this.game.getAudioManager();
        if (this.scene && this.scene.sideScenes &&
            this.scene.sideScenes.has(index) && !lifeScript) {
            killActor(this.scene.actors[0]);
            const sideScene = this.scene.sideScenes.get(index);
            sideScene.sideScenes = this.scene.sideScenes;
            sideScene.sideScenes.delete(index);
            delete this.scene.sideScenes;
            sideScene.sideScenes.set(this.scene.index, this.scene);
            sideScene.relocateHeroFrom(this.scene, teleport);
            this.scene = sideScene;
            reviveActor(this.scene.actors[0], this.game); // Awake twinsen
            this.scene.isActive = true;
            if (audio.isPlayingMusic()) {
                audio.queueMusic(this.scene.props.ambience.musicIndex);
            } else {
                audio.playMusic(this.scene.props.ambience.musicIndex);
            }
            initSceneDebugData();
            return this.scene;
        }
        this.game.loading(index);
        this.renderer.setClearColor(0x000000);
        this.game.getState().actorTalking = -1;
        this.cleanUp();
        this.release();
        this.scene = await Scene.load(this.game, this.renderer, this, index);
        this.renderer.applySceneryProps(this.scene.scenery.props);
        this.scene.isActive = true;
        if (audio.isPlayingMusic()) {
            audio.queueMusic(this.scene.props.ambience.musicIndex);
        } else {
            audio.playMusic(this.scene.props.ambience.musicIndex);
        }
        initSceneDebugData();
        this.scene.firstFrame = true;
        if (getParams().editor) {
            this.scene.savedState = this.game.getState().save(this.scene.actors[0]);
        }
        this.game.loaded(`scene #${index}`, wasPaused);
        return this.scene;
    }

    unloadScene() {
        this.scene = null;
    }

    cleanUp() {
        if (!this.scene)
            return;

        for (const actor of this.scene.actors) {
            actor.stopSamples();
            actor.stopVoice();
        }
    }

    release() {
        const audio = this.game.getAudioManager();
        audio.releaseSamples();

        releaseSamples();
        releaseAnimations();
        releaseModels();
        releaseLibraries();
        releaseGrids();
        releaseScenes();
    }
}
