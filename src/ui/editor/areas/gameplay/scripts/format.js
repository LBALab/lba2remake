import React from 'react';
import {map} from 'lodash';
import {getVarInfo} from '../../../DebugData';

export function formatVar(varDef, value) {
    const info = getVarInfo(varDef);
    if (info) {
        if (info.type === 'boolean') {
            return <span style={{color: '#03A9F4'}}>{value === 1 ? 'true' : 'false'}</span>;
        } else if (info.type === 'enum') {
            if (value in info.enumValues) {
                const allValues = map(info.enumValues, (v, k) => `${k}:${v}`).join('\n');
                return <span style={{color: '#b9a0b3'}}>
                    <span title={allValues}>{info.enumValues[value].toUpperCase()}</span>
                    ({value})
                </span>;
            }
            return <span style={{color: '#b9a0b3'}}>({value})</span>;
        }
    }
    return value;
}
