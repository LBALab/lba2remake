import Actor from '../Actor';
import Game from '../Game';
import Scene from '../Scene';

export interface ScriptContext {
    type: 'life' | 'move';
    game: Game;
    scene: Scene;
    actor: Actor;
    moveState: any;
    state: any;
}
