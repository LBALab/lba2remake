import React from 'react';
import {getVarInfo, getVarName, renameVar} from '../../../DebugData';
import {identity} from 'lodash';

export function formatVar(varDef, value) {
    const info = getVarInfo(varDef);
    if (info) {
        if (info.type === 'boolean') {
            return <i style={{color: value === 1 ? '#00ff00' : '#ff0000'}}>{value === 1 ? 'true' : 'false'}</i>;
        } else if (info.type === 'enum') {
            return info.enumValues[value];
        }
    }
    return value;
}

export const Var = {
    dynamic: true,
    needsData: true,
    allowRenaming: () => true,
    rename: (varDef, newName) => {
        renameVar(varDef, newName);
    },
    name: (varDef) => getVarName(varDef),
    props: (varDef) => [
        {
            id: 'value',
            value: varDef.value(),
            render: (value) => formatVar(varDef, value)
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
            return {
                type: type,
                value: () => getVars()[idx],
                idx
            };
        }
    }
}
