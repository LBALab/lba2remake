import * as life_structural from './life/structural';
import * as life_control from './life/control';
import * as life_actions from './life/actions';
import * as life_conditions from './life/conditions';
import * as move_structural from './move/structural';
import * as move_actions from './move/actions';

export default {
    ...life_structural,
    ...life_control,
    ...life_actions,
    ...life_conditions,
    ...move_structural,
    ...move_actions
};
