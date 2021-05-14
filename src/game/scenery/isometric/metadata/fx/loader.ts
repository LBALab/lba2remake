import { Fx, FxProps, FxConstructor } from './Fx';
import DomeFloor from './DomeFloor';

type FxMap = {
    [key: string]: FxConstructor;
};

const effects: FxMap = {
    dome_floor: DomeFloor
};

export function loadFx(node: THREE.Mesh, props: FxProps): Fx {
    for (const name in effects) {
        if (node.name.substring(0, 3 + name.length) === `fx_${name}`) {
            const FxClass = effects[name];
            const fx = new FxClass(props);
            fx.init(node);
            return fx;
        }
    }
    return null;
}
