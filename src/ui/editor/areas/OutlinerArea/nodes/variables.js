import {getVarName, renameVar} from '../../../DebugData';

const Var = {
    dynamic: true,
    allowRenaming: () => true,
    rename: (varDef, newName) => {
        renameVar(varDef, newName);
    },
    name: (varDef) => getVarName(varDef),
    props: (varDef) => [
        {
            id: 'value',
            value: varDef.value,
            render: (value) => value
        }
    ],
    onClick: () => {}
};

export function makeVariables(type, name, getVars) {
    return {
        dynamic: true,
        name: () => name,
        numChildren: () => getVars().length,
        child: () => Var,
        childData: (data, idx) => {
            const variables = getVars();
            return {
                type: type,
                value: variables[idx],
                idx
            };
        }
    }
}
