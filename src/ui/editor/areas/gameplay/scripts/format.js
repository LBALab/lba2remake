import React from 'react';
import {map} from 'lodash';
import {getVarInfo} from '../../../DebugData';

export function formatVar(varDef, value) {
    const info = getVarInfo(varDef);
    if (info) {
        if (info.type === 'boolean') {
            return <span style={{color: value === 1 ? '#00ff00' : '#e16a42'}}>{value === 1 ? 'true' : 'false'}</span>;
        } else if (info.type === 'enum') {
            if (value in info.enumValues) {
                const allValues = map(info.enumValues, (v, k) => `${k}:${v}`).join('\n');
                return <span style={{color: '#b9a0b3'}}>
                    {value}:
                    <u title={allValues}>{info.enumValues[value].toUpperCase()}</u>
                </span>;
            }
            return <span style={{color: '#b9a0b3'}}>{value}:&lt;?&gt;</span>;
        }
    }
    return value;
}
