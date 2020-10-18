import { killActor, reviveActor } from './scripting';
import { pure } from '../utils/decorators';
import { getParams } from '../params';
import { Game } from './Game';
import * as DBG from '../ui/editor/DebugData';
import { Scene, relocateHero } from './Scene';

declare global {
    var ga: Function;
}

const { initSceneDebugData } = DBG;

export class SceneManager {
    private scene: any;
    private hideMenu: Function;
    private game: Game;
    private renderer: any;

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

    async goto(index, force = false, wasPaused = false, teleport = true) {
        if ((!force && this.scene && index === this.scene.index) || this.game.isLoading())
            return this.scene;

        ga('set', 'page', `/scene/${index}`);
        ga('send', 'pageview');

        if (this.scene)
            this.scene.isActive = false;

        this.game.setUiState({ text: null, cinema: false });
        this.game.controlsState.skipListener = null;

        const hash = window.location.hash;
        if (hash.match(/scene=\d+/)) {
            window.location.hash = hash.replace(/scene=\d+/, `scene=${index}`);
        }

        const audio = this.game.getAudioManager();
        if (this.scene && this.scene.sideScenes && index in this.scene.sideScenes) {
            killActor(this.scene.actors[0]);
            const sideScene = this.scene.sideScenes[index];
            sideScene.sideScenes = this.scene.sideScenes;
            delete sideScene.sideScenes[index];
            delete this.scene.sideScenes;
            sideScene.sideScenes[this.scene.index] = this.scene;
            relocateHero(this.scene.actors[0], sideScene.actors[0], sideScene, teleport);
            this.scene = sideScene;
            reviveActor(this.scene.actors[0], this.game); // Awake twinsen
            this.scene.isActive = true;
            audio.stopMusicTheme();
            audio.playMusic(this.scene.data.ambience.musicIndex);
            initSceneDebugData();
            return this.scene;
        }
        this.game.loading(index);
        this.renderer.setClearColor(0x000000);
        this.scene = await Scene.load(this.game, this.renderer, this, index);
        this.renderer.applySceneryProps(this.scene.scenery.props);
        this.scene.isActive = true;
        audio.stopMusicTheme();
        audio.playMusic(this.scene.data.ambience.musicIndex);
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
}
