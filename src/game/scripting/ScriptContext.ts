import Actor from '../Actor';
import Game from '../Game';
import Scene from '../Scene';
import { Time } from '../../datatypes';

export interface ScriptContext {
    type: 'life' | 'move';
    game: Game;
    scene: Scene;
    actor: Actor;
    moveState: any;
    state: any;
    time: Time;
}
