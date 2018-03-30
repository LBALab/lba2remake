import React from 'react';
import {flatMap} from 'lodash';

export function intersperse(arr, inter) {
    return flatMap(arr, (a, i) => (i ? [inter, a] : [a]));
}

export function intersperseBR(arr) {
    return flatMap(arr, (a, i) => (i ? [<br key={`br${i}`}/>, a] : [a]));
}
