import Game from '../../../../Game';
import Scene from '../../../../Scene';
import { Time } from '../../../../../datatypes';

export interface FxProps {
    numActors: number;
    paletteTexture: THREE.DataTexture;
    lutTexture: THREE.DataTexture;
    light: THREE.Vector3;
}

export interface FxConstructor {
    new(props: FxProps): Fx;
}

export interface Fx {
    init: (node: THREE.Mesh) => void;
    update: (game: Game, scene: Scene, time: Time) => void;
}
