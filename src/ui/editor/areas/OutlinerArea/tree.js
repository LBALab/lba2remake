import DebugData from '../../DebugData';
import {map} from 'lodash';

const ActorsNode = {
    name: 'Actors',
    children: () => {
        const scene = DebugData.scope.scene;
        return map(scene && scene.actors, (actor, idx) => {
            const name = idx === 0 ? 'hero' : `actor_${idx}`;
            const aProps = [
                actor.isSprite ? 'sprite' : 'model',
                actor.isVisible ? 'visible' : 'hidden',
            ];
            return {
                name: `${name} [${aProps.join(', ')}]`,
                children: []
            }
        });
    }
};

const SceneNode = {
    name: 'Scene',
    children: () => {
        const scene = DebugData.scope.scene;
        return scene ? [
            ActorsNode,
            { name: 'Zones', children: [] },
            { name: 'Points', children: [] }
        ] : [];
    }
};

const LocationsNode = {
    name: 'Locations',
    children: [
        {
            name: 'Twinsun',
            collapsed: true,
            children: [
                {
                    name: 'Citadel island',
                    children: []
                },
                {
                    name: 'Desert island',
                    children: []
                }
            ],
        },
        {
            name: 'Emerald moon',
            collapsed: true,
            children: [

            ]
        },
        {
            name: 'Zeelish',
            collapsed: true,
            children: [
                {
                    name: 'Surface',
                    children: []
                },
                {
                    name: 'Undergas',
                    children: []
                }
            ]
        }
    ]
};

const OutlinerTree = {
    name: 'Data',
    children: [
        SceneNode,
        LocationsNode
    ]
};

export default OutlinerTree;