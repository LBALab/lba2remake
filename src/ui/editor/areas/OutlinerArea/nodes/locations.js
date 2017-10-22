import React from 'react';
import DebugData from '../../../DebugData';
import {extend} from 'lodash';

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

function makeScene(index, name, children) {
    return {
        name,
        onClick: goto.bind(null, index),
        children: children ? children : [],
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

function makeIslandScene(index, name, children) {
    const node = makeScene(index, name);
    node.props.splice(0, 0, makeIcon('island'));
    node.children = [
        {
            name: 'Buildings',
            children: children,
            props: [makeIcon('building')]
        }
    ];
    return node;
}

function makeIcon(name) {
    return {
        id: 'icon',
        value: name,
        render: () => <img src={`editor/icons/locations/${name}.png`}/>
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
                        {
                            name: 'Buildings',
                            children: [
                                makeScene(0, 'Twinsen\'s House'),
                                makeScene(1, 'Twinsen\'s House (cellar)'),
                                makeScene(9, 'Neighbour\'s House'),
                                makeScene(14, 'Mr. Bazoo\'s shop'),
                                makeScene(7, 'Paul\'s House'),
                                makeScene(8, 'Tickets Office'),
                                makeScene(3, 'Chez Luc'),
                                makeScene(4, 'Chez Luc (cellar)'),
                                makeScene(15, 'Museum'),
                                makeScene(5, 'Baggage Claim'),
                                makeScene(6, 'Baggage Claim (downstairs)'),
                                makeScene(16, 'Baggage Claim (labyrinth room)'),
                                makeScene(22, 'Pharmacy'),
                                makeScene(37, 'School'),
                                makeScene(17, 'Sewers'),
                                makeScene(18, 'Sewers (treasure)'),
                                makeScene(21, 'Wizard\'s Tent'),
                                makeScene(51, 'Spider Cave'),
                                makeScene(2, 'Tralü\'s Cave'),
                                makeScene(20, 'Tralü\'s Cave (Joe the Elf)'),
                                makeScene(19, 'Tralü\'s Cave (small tralüs)'),
                                makeScene(26, 'Inside the Dome')
                            ],
                            props: [makeIcon('building')]
                        },
                        makeScene(49, 'Twinsen\'s House Area', [
                            makeScene(195, 'Demo variant')
                        ]),
                        makeScene(46, 'Lighthouse Area', [
                            makeScene(196, 'Demo variant')
                        ]),
                        makeScene(42, 'Lupin-Bourg (landing zone)'),
                        makeScene(48, 'Lupin-Bourg (statue)'),
                        makeScene(43, 'Harbour', [
                            makeScene(197, 'Demo variant')
                        ]),
                        makeScene(44, 'Dome'),
                        makeScene(47, 'Flower\'s Circle'),
                        makeScene(45, 'Wizard\'s Tent Area'),
                        makeScene(50, 'Woodbridge')
                    ],
                    props: [makeIcon('island')]
                },
                {
                    name: 'Desert island',
                    children: [
                        {
                            name: 'Buildings',
                            children: [
                                makeScene(35, 'Leone\'s House'),
                                makeScene(36, 'Shop'),
                                makeScene(38, 'Baldino\'s House'),
                                makeScene(39, 'Bar near the Beach'),
                                makeScene(40, 'Tickets Office'),
                                makeScene(10, 'Temple of Bu'),
                                makeScene(11, 'Temple of Bu (downstairs)'),
                                makeScene(12, 'Temple of Bu (shuttle area)'),
                                makeScene(24, 'Hacienda'),
                                makeScene(29, 'Hacienda (central area)'),
                                makeScene(25, 'Hacienda (women\'s bath)'),
                                makeScene(30, 'Hacienda (men\'s bath)'),
                                makeScene(32, 'Hacienda (secret room)'),
                                makeScene(28, 'School of Magic (lobby)'),
                                makeScene(27, 'School of Magic (classroom)'),
                                makeScene(33, 'School of Magic (blowgun test)')
                            ],
                            props: [makeIcon('building')]
                        },
                        makeScene(55, 'Oasis (Moya)', [
                            makeScene(203, 'Demo variant')
                        ]),
                        makeScene(56, 'Between Oasis and Racetrack'),
                        makeScene(57, 'Racetrack'),
                        makeScene(58, 'Behind Racetrack'),
                        makeScene(60, 'Town Square', [
                            makeScene(200, 'Demo variant')
                        ]),
                        makeScene(59, 'Headland (harbour)', [
                            makeScene(198, 'Demo variant')
                        ]),
                        makeScene(64, 'Perl Cave (Moya)'),
                        makeScene(69, 'Behind Perl Cave'),
                        makeScene(61, 'Graveyard', [
                            makeScene(201, 'Demo variant')
                        ]),
                        makeScene(66, 'Center Dunes'),
                        makeScene(67, 'Temple of Bu', [
                            makeScene(206, 'Demo variant')
                        ]),
                        makeScene(68, 'Behind Temple of Bu'),
                        makeScene(62, 'Springboard'),
                        makeScene(63, 'Behind Temple of Bu 2?'),
                        makeScene(65, 'Esmer Landing Zone', [
                            makeScene(199, 'Demo variant')
                        ]),
                        makeScene(70, 'Behind Landing Zone'),
                        makeScene(71, 'Between Hacienda and Landing Zone'),
                        makeScene(72, 'Hacienda', [
                            makeScene(204, 'Demo variant')
                        ]),
                        makeScene(73, 'Small island (facing Hacienda)')
                    ],
                    props: [makeIcon('island')]
                }
            ],
            props: [makeIcon('twinsun')]
        },
        {
            name: 'Emerald moon',
            children: [
                {
                    name: 'Buildings',
                    children: [],
                    props: [makeIcon('building')]
                },
                makeScene(75, 'Landing zone', [
                    makeScene(208, 'Demo variant')
                ]),
                makeScene(77, 'Switches Building Area'),
                makeScene(76, 'Baldino\'s Spaceship Area'),
                makeScene(74, 'Antena Area')
            ],
            props: [makeIcon('moon')]
        },
        {
            name: 'Zeelish',
            children: [
                {
                    name: 'Surface',
                    children: [
                        {
                            name: 'Otringal',
                            children: [
                                {
                                    name: 'Buildings',
                                    children: [],
                                    props: [makeIcon('building')]
                                },
                                makeScene(92, 'Spaceport', [
                                    makeScene(205, 'Demo variant')
                                ]),
                                makeScene(90, 'Dog Training Center and Jail'),
                                makeScene(87, 'Harbour', [
                                    makeScene(209, 'Demo variant')
                                ]),
                                makeScene(94, 'Baldino\'s Landing Zone', [
                                    makeScene(138, 'Demo variant')
                                ]),
                                makeScene(89, 'Town Square', [
                                    makeScene(211, 'Demo variant')
                                ]),
                                makeScene(88, 'Upper Level (hotel & palace)'),
                                makeScene(91, 'Emperor Palace')
                            ],
                            props: [makeIcon('island')]
                        },
                        makeIslandScene(95, 'Celebration Island', []),
                        {
                            name: 'Franco Island',
                            children: [
                                {
                                    name: 'Buildings',
                                    children: [],
                                    props: [makeIcon('building')]
                                },
                                makeScene(109, 'Village', [
                                    makeScene(212, 'Demo variant')
                                ]),
                                makeScene(108, 'Refinery Area'),
                                makeScene(107, 'Zeppelin Port')
                            ],
                            props: [makeIcon('island')]
                        },
                        makeIslandScene(120, 'Elevator', []),
                        makeIslandScene(110, 'Island CX', [])
                    ],
                    props: [makeIcon('surface')]
                },
                {
                    name: 'Undergas',
                    children: [
                        {
                            name: 'Elevator Island',
                            children: [
                                {
                                    name: 'Buildings',
                                    children: [],
                                    props: [makeIcon('building')]
                                },
                                makeScene(98, 'Elvator Area', [
                                    makeScene(213, 'Demo variant')
                                ]),
                                makeScene(99, 'Mine Area'),
                                makeScene(96, 'Church Area'),
                                makeScene(97, 'Ferryman Area')
                            ],
                            props: [makeIcon('island')]
                        },
                        {
                            name: 'Mosquibee Island',
                            children: [
                                {
                                    name: 'Buildings',
                                    children: [],
                                    props: [makeIcon('building')]
                                },
                                makeScene(105, 'Ferryman Area', [
                                    makeScene(216, 'Demo variant')
                                ]),
                                makeScene(103, 'Monster Area'),
                                makeScene(102, 'Mountain Top')
                            ],
                            props: [makeIcon('island')]
                        },
                        {
                            name: 'Volcano Island',
                            children: [
                                {
                                    name: 'Buildings',
                                    children: [],
                                    props: [makeIcon('building')]
                                },
                                makeScene(132, 'Ferryman Area'),
                                makeScene(131, 'Cave Area', [
                                    makeScene(219, 'Demo variant')
                                ]),
                                makeScene(130, 'Mountain Top')
                            ],
                            props: [makeIcon('island')]
                        }
                    ],
                    props: [makeIcon('undergas')]
                }
            ],
            props: [makeIcon('zeelish')]
        },
        {
            name: 'Broken Scenes',
            children: [
                makeScene(13, 'Broken13'),
                makeScene(23, 'Broken23'),
                makeScene(31, 'Broken31'),
                makeScene(34, 'Broken34'),
                makeScene(52, 'Broken52'),
                makeScene(53, 'Broken53'),
                makeScene(54, 'Broken54'),
                makeScene(100, 'Broken100'),
                makeScene(101, 'Broken101'),
                makeScene(104, 'Broken104'),
                makeScene(112, 'Broken112'),
                makeScene(113, 'Broken113')
            ]
        }
    ]
};
