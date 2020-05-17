export default interface UIState {
    cinema: boolean;
    text?: {
        value: string;
        color: string;
        type: string;
    };
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
}
