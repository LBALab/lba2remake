import React from 'react';
import {getVarInfo, getVarName, renameVar} from '../../../DebugData';
import {identity} from 'lodash';

export function formatVar(varDef, value) {
    const info = getVarInfo(varDef);
    if (info) {
        if (info.type === 'boolean') {
            return <span style={{color: value === 1 ? '#00ff00' : '#ff0000'}}>{value === 1 ? 'true' : 'false'}</span>;
        } else if (info.type === 'enum') {
            if (value in info.enumValues) {
                return <span style={{color: '#b9a0b3'}}>{info.enumValues[value].toUpperCase()}</span>;
            } else {
                return <span style={{color: '#b9a0b3'}}>undefined(#{value})</span>;
            }
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
            render: (value) => <i style={{color: '#98ee92'}}>{formatVar(varDef, value)}</i>
        }
    ],
    onClick: () => {}
};

export function makeVariables(type, name, getVars) {
    return {
        dynamic: true,
        name: () => name,
        icon: () => 'editor/icons/var.png',
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
