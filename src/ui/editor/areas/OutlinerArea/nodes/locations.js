import React from 'react';
import DebugData from '../../../DebugData';
import {each} from 'lodash';

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
                                makeScene(0, 'Twinsen\'s House', [
                                    makeScene(193, 'Demo variant')
                                ]),
                                makeScene(1, 'Twinsen\'s House (cellar)', [
                                    makeScene(194, 'Demo variant')
                                ]),
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
                                makeScene(26, 'Inside the Dome', [
                                    makeScene(202, 'Demo variant')
                                ]),
                                makeScene(191, 'Esmer Spacecraft (Spying)'),
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
                                makeScene(10, 'Temple of Bu', [
                                    makeScene(207, 'Demo variant')
                                ]),
                                makeScene(127, 'Temple of Bu (well)'),
                                makeScene(11, 'Temple of Bu (downstairs)'),
                                makeScene(12, 'Temple of Bu (spacecraft area)', [
                                    makeScene(220, 'Demo variant')
                                ]),
                                makeScene(114, 'Esmer Spacecraft (Temple of Bu)'),
                                makeScene(24, 'Hacienda'),
                                makeScene(29, 'Hacienda (central area)'),
                                makeScene(25, 'Hacienda (women\'s bath)'),
                                makeScene(30, 'Hacienda (men\'s bath)'),
                                makeScene(32, 'Hacienda (secret room)'),
                                makeScene(28, 'School of Magic (lobby)'),
                                makeScene(27, 'School of Magic (classroom)'),
                                makeScene(33, 'School of Magic (blowgun test)'),
                                makeScene(183, 'Protection Spell cave (skeletons)'),
                                makeScene(184, 'Protection Spell cave (monster)'),
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
                    children: [
                        makeScene(115, 'Esmer Spacecraft'),
                    ],
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
                                    children: [
                                        makeScene(86, 'Spaceport (corridor)'),
                                        makeScene(78, 'Spaceport (ticket office)'),
                                        makeScene(41, 'Esmer Spacecraft'),
                                        makeScene(85, 'Control Tower (stairs)'),
                                        makeScene(83, 'Jail (lobby)'),
                                        makeScene(84, 'Jail (cells)'),
                                        makeScene(134, 'Bar (rehearsal room)'),
                                        makeScene(136, 'Bar (main room)', [
                                            makeScene(210, 'Demo variant')
                                        ]),
                                        makeScene(137, 'Bar (Johny Rocket)'),
                                        makeScene(82, 'Elevators to Town Square (downstairs)'),
                                        makeScene(139, 'Elevators to Town Square (upstairs)'),
                                        makeScene(135, 'Casino (games room)'),
                                        makeScene(133, 'Casino (wheel room)'),
                                        makeScene(147, 'Shop'),
                                        makeScene(148, 'Shop (secret room)'),
                                        makeScene(150, 'Elevator to Upper City'),
                                        makeScene(81, 'Hotel (lobby)'),
                                        makeScene(79, 'Hotel (meeting room)'),
                                        makeScene(170, 'Hotel (spy room)'),
                                        makeScene(169, 'Hotel (woman\'s room)'),
                                        makeScene(189, 'Emperor Spacecraft'),
                                        makeScene(154, 'Palace (entrance)'),
                                        makeScene(153, 'Palace (bottom-left 1, dogs)'),
                                        makeScene(152, 'Palace (bottom-left 2, francos)'),
                                        makeScene(151, 'Palace (left corner, dogs)'),
                                        makeScene(155, 'Palace (top-left 1, hussar)'),
                                        makeScene(159, 'Palace (top-left 2, time commando)'),
                                        makeScene(163, 'Palace (top-left 3, pig farmers)', [
                                            makeScene(217, 'Demo variant')
                                        ]),
                                        makeScene(156, 'Palace (middle 1)'),
                                        makeScene(157, 'Palace (middle 2, treasure chest)'),
                                        makeScene(160, 'Palace (middle 3, hussar)'),
                                        makeScene(161, 'Palace (middle 4, treasure chest)'),
                                        makeScene(158, 'Palace (bottom-right 1)'),
                                        makeScene(162, 'Palace (bottom-right 2, hussar)'),
                                        makeScene(164, 'Palace (top-right 1, treasure chest)'),
                                        makeScene(165, 'Palace (top-right 2, treasure chest + chimney)'),
                                        makeScene(166, 'Palace (right corner, francos)'),
                                        makeScene(80, 'Palace (final boss room)'),
                                    ],
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
                        makeIslandScene(95, 'Celebration Island', [
                            makeScene(93, 'Temple'),
                            makeScene(186, 'Statue (top)'),
                            makeScene(192, 'Statue (meca-pinguins)'),
                            makeScene(187, 'Statue (middle)', [
                                makeScene(218, 'Demo variant')
                            ]),
                            makeScene(188, 'Statue (bottom, FF)'),
                            makeScene(190, 'Statue (lava)'),
                        ]),
                        {
                            name: 'Franco Island',
                            children: [
                                {
                                    name: 'Buildings',
                                    children: [
                                        makeScene(171, 'Shop'),
                                        makeScene(172, 'Bar'),
                                        makeScene(173, 'Mr. Kurtz House (retired colonel)'),
                                        makeScene(174, 'Nursery'),
                                        makeScene(175, 'Roger de la Fontaine\'s House'),
                                        makeScene(140, 'Refinery (entrance)'),
                                        makeScene(141, 'Refinery (room 2)'),
                                        makeScene(142, 'Refinery (room 3)'),
                                        makeScene(145, 'Refinery (tanks room)'),
                                        makeScene(146, 'Refinery (secret room)'),
                                        makeScene(143, 'Refinery (last room)'),
                                        makeScene(144, 'Access to Zeppelin Port'),
                                    ],
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
                        makeIslandScene(110, 'Island CX', [
                            makeScene(177, 'Control Tower (stairs)'),
                            makeScene(178, 'Control Tower (switches room)', [
                                makeScene(221, 'Demo variant')
                            ]),
                            makeScene(179, 'Control Tower (entrance)'),
                            makeScene(180, 'Corridor (dragon)'),
                            makeScene(182, 'Emperor Spacecraft (CX)'),
                        ])
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
                                    children: [
                                        makeScene(123, 'Elevator Building'),
                                        makeScene(125, 'Bank (lobby)'),
                                        makeScene(124, 'Bank/Mine (box transit room)'),
                                        makeScene(126, 'Bank/Mine (hatch room)'),
                                        makeScene(111, 'Mine (gem corridor)'),
                                        makeScene(116, 'Church (Monk assistant)'),
                                        makeScene(119, 'Church (stairs + lava)'),
                                        makeScene(117, 'Church (fragment room)'),
                                        makeScene(121, 'Church (fragment room, with Monk)'),
                                    ],
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
                                    children: [
                                        makeScene(106, 'Nest (lobby)'),
                                        makeScene(128, 'Nest (blowtron test)'),
                                        makeScene(149, 'Nest (upper exit room)'),
                                        makeScene(176, 'Access to Island CX'),
                                    ],
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
                                    children: [
                                        makeScene(129, 'Cave'),
                                    ],
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
                makeScene(113, 'Broken113'),
                makeScene(118, 'Broken118'),
                makeScene(122, 'Broken122'),
                makeScene(167, 'Broken167'),
                makeScene(168, 'Broken168'),
                makeScene(181, 'Broken181'),
                makeScene(185, 'Broken185'),
                makeScene(214, 'Broken214'),
                makeScene(215, 'Broken215'),
            ]
        }
    ]
};
