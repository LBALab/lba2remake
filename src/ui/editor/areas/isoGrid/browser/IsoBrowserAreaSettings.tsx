import * as React from 'react';
import { map } from 'lodash';
import LibrariesData from '../../layouts/data/libraries';

/*
const inputStyle = {
    textAlign: 'center' as const,
    verticalAlign: 'middle' as const,
    marginRight: '1ch'
};
*/

export default function IsoBrowserAreaSettings(props) {
    const setLibraryFilter = e => props.stateHandler.setLibraryFilter(Number(e.target.value));
    const selectedLib = props.sharedState.libraryFilter;
    return <div>
        Filter library:&nbsp;
        <select onChange={setLibraryFilter} value={selectedLib}>
            <option value={-1}>All</option>
            {map(LibrariesData, lib =>
            <option key={lib.index} value={lib.index}>{lib.name}
            </option>)}
        </select>
    </div>;
}
