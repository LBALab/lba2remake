import DebugData from '../../../DebugData';

function goto(index) {
    if (DebugData.sceneManager) {
        DebugData.sceneManager.goto(index);
    }
}

function isSelected(index) {
    const scene = DebugData.scope.scene;
    if (scene) {
        return scene.index === index;
    }
    return false;
}

function makeScene(index, name) {
    return {
        name,
        onClick: goto.bind(null, index),
        children: [],
        props: [
            {
                id: 'index',
                value: index,
                render: (value) => `#${value}`
            }
        ],
        selected: isSelected.bind(null, index)
    }
}

export const LocationsNode = {
    name: 'Locations',
    children: [
        {
            name: 'Twinsun',
            children: [
                {
                    name: 'Citadel island',
                    children: [
                        makeScene(49, 'Near Twinsen\'s house'),
                        makeScene(46, 'Near Lighthouse'),
                        makeScene(42, 'Lupin-Bourg (landing zone)'),
                        makeScene(48, 'Lupin-Bourg (statue)'),
                        makeScene(43, 'Harbour'),
                        makeScene(44, 'Dome'),
                        makeScene(47, 'Flower\'s Circle'),
                        makeScene(45, 'Near the Wizard\'s tent'),
                        makeScene(50, 'Woodbridge')
                    ]
                },
                {
                    name: 'Desert island',
                    children: [
                        makeScene(55, 'Oasis (Moya)'),
                        makeScene(56, 'Between Oasis and Racetrack'),
                        makeScene(57, 'Racetrack'),
                        makeScene(58, 'Behind Racetrack'),
                        makeScene(60, 'Town Square'),
                        makeScene(59, 'Headland (harbour)'),
                        makeScene(64, 'Perl Cave (Moya)'),
                        makeScene(69, 'Behind Perl Cave'),
                        makeScene(61, 'Graveyard'),
                        makeScene(66, 'Center Dunes'),
                        makeScene(67, 'Temple of Bu'),
                        makeScene(68, 'Behind Temple of Bu'),
                        makeScene(62, 'Springboard'),
                        makeScene(63, 'Behind Temple of Bu 2?'),
                        makeScene(65, 'Esmer Landing Zone'),
                        makeScene(70, 'Behind Landing Zone'),
                        makeScene(71, 'Between Hacienda and Landing Zone'),
                        makeScene(72, 'Hacienda'),
                        makeScene(73, 'Small island (facing Hacienda)')
                    ]
                }
            ],
        },
        {
            name: 'Emerald moon',
            children: []
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
