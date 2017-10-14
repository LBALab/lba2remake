import React from 'react';
import {map, extend} from 'lodash';
import FrameListener from '../../utils/FrameListener';
import DebugData from '../DebugData';
import {fullscreen} from '../../styles/index';

class OutlinerContent extends FrameListener {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return <div style={extend({overflow: 'auto', padding: 8}, fullscreen)}>
            Actors:
            <ul>
            {
                map(this.state.actors, (actor, idx) => {
                    const selectActor = () => {
                        DebugData.selection.actor = idx;
                    };
                    const name = idx === 0 ? 'hero' : `actor_${idx}`;
                    const selected = this.state.selection === idx;
                    const aProps = [];
                    if (actor.isVisible)
                        aProps.push('visible');
                    if (actor.isSprite)
                        aProps.push('sprite');
                    return <li key={idx} onClick={selectActor} style={{fontSize: 16, cursor: 'pointer', color: selected ? 'red' : 'white'}}>
                        {name} [{aProps.join(' ')}]
                    </li>;
                })
            }
            </ul>
        </div>;
    }

    frame() {
        const scene = DebugData.scope.scene;
        if (scene && scene.actors !== this.state.actors) {
            this.setState({actors: scene.actors});
        }
        if (DebugData.selection.actor !== this.state.selection) {
            this.setState({selection: DebugData.selection.actor});
        }
    }
}

const Outliner = {
    id: 'outliner',
    name: 'Outliner',
    content: OutlinerContent,
    getInitialState: () => ({})
};

export default Outliner;


