import { Fx, FxProps, FxConstructor } from './Fx';
import DomeFloor from './DomeFloor';
import RadarTrail from './RadarTrail';
import RadarRotate from './Rotate';

type FxMap = {
    [key: string]: FxConstructor;
};

const effects: FxMap = {
    dome_floor: DomeFloor,
    trail: RadarTrail,
    rotate: RadarRotate
};

export function loadFx(node: THREE.Mesh, props: FxProps): Fx {
    if (node.userData.fx in effects) {
        const FxClass = effects[node.userData.fx];
        const fx = new FxClass(props);
        fx.init(node);
        return fx;
    }
    return null;
}
