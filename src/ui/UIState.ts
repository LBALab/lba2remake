import Game from '../game/Game';

export default interface UIState {
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
    behaviourMenu: boolean;
    inventory: boolean;
    noAudio: boolean;
}

export function initUIState(game: Game): UIState {
    return {
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
        behaviourMenu: false,
        inventory: false,
        noAudio: !game.getAudioManager().isContextActive()
    };
}
