import * as React from 'react';

/*
const inputStyle = {
    textAlign: 'center' as const,
    verticalAlign: 'middle' as const,
    marginRight: '1ch'
};
*/

export default function IsoGridEditorSettings(props) {
    const setCam = e => props.stateHandler.setCam(e.target.value);
    return <div>
        Camera:&nbsp;
        <select onChange={setCam} value={props.sharedState.cam}>
            <option value={0}>Isometric</option>
            <option value={1}>Iso 3D</option>
        </select>
    </div>;
}
