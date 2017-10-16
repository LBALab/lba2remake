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

const ZONE_TYPE = [
    'CUBE',
    'CAMERA',
    'SCENERIC',
    'FRAGMENT',
    'BONUS',
    'TEXT',
    'LADDER',
    'CONVEYOR',
    'SPIKE',
    'RAIL'
];

const ZonesNode = {
    name: 'Zones',
    children: () => {
        const scene = DebugData.scope.scene;
        return map(scene && scene.zones, (zone, idx) => {
            const name = `zone_${idx}`;
            const type = ZONE_TYPE[zone.props.type];
            return {
                name: `${name} [${type}]`,
                children: []
            }
        });
    }
};

const PointsNode = {
    name: 'Points',
    children: () => {
        const scene = DebugData.scope.scene;
        return map(scene && scene.points, (point, idx) => {
            const name = `point_${idx}`;
            return {
                name: `${name}`,
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
            ZonesNode,
            PointsNode
        ] : [];
    }
};

const LocationsNode = {
    name: 'Locations',
    children: [
        {
            name: 'Twinsun',
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
            children: [

            ]
        },
        {
            name: 'Zeelish',
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