import {planet, island, section, iso} from './functions';

export const Zeelish = planet('Zeelish', 'zeelish', [
    planet('Surface', 'surface', [
        island(-1, 'Otringal', [
            section(92, 'Spaceport', [
                iso(86, 'Spaceport', [
                    iso(78, 'Tourists Area'),
                ]),
                iso(41, 'Esmer Spacecraft'),
                iso(85, 'Control Tower'),
            ]),
            section(90, 'Dog Training Center and Jail', [
                iso(83, 'Jail', [
                    iso(84, 'Cells'),
                ]),
                iso(82, 'Elevators to Town Square', [
                    iso(139, 'Upstairs')
                ])
            ]),
            section(87, 'Harbour', [
                iso(136, 'Bar', [
                    iso(134, 'Rehearsal room'),
                    iso(137, 'Office'),
                ]),
            ]),
            section(94, 'Baldino\'s Landing Zone'),
            section(89, 'Town Square', [
                iso(135, 'Casino', [
                    iso(133, 'Wheel Room'),
                ]),
                iso(147, 'Shop', [
                    iso(148, 'Secret Room'),
                ]),
                iso(150, 'Elevator to Upper City'),
            ]),
            section(88, 'Upper City', [
                iso(81, 'Hotel', [
                    iso(79, 'Meeting Room'),
                    iso(170, 'Spy Room'),
                    iso(169, 'Woman\'s Room')
                ]),
                iso(189, 'Emperor Spacecraft'),
            ]),
            section(91, 'Emperor Palace', [
                iso(154, 'Palace', [
                    iso(153, 'Bottom-left 1, dogs'),
                    iso(152, 'Bottom-left 2, francos'),
                    iso(151, 'Left corner, dogs'),
                    iso(155, 'Top-left 1, hussar'),
                    iso(159, 'Top-left 2, time commando'),
                    iso(163, 'Top-left 3, pig farmers'),
                    iso(156, 'Middle 1'),
                    iso(157, 'Middle 2, treasure chest'),
                    iso(160, 'Middle 3, hussar'),
                    iso(161, 'Middle 4, treasure chest'),
                    iso(158, 'Bottom-right 1'),
                    iso(162, 'Bottom-right 2, hussar'),
                    iso(164, 'Top-right 1, treasure chest'),
                    iso(165, 'Top-right 2, treasure chest + chimney'),
                    iso(166, 'Right corner, francos'),
                    iso(80, 'Final Boss Room')
                ])
            ])
        ]),
        island(95, 'Celebration Island', [
            iso(93, 'Temple'),
            iso(186, 'Statue', [
                iso(187, 'Middle'),
                iso(192, 'Meca-Pinguins Room'),
                iso(188, 'Bottom (FunFrock)'),
                iso(190, 'Lava'),
            ]),
        ]),
        island(-1, 'Franco Island', [
            section(109, 'Village', [
                iso(171, 'Shop'),
                iso(172, 'Bar'),
                iso(173, 'Mr. Kurtz House (retired colonel)'),
                iso(174, 'Nursery'),
                iso(175, 'Roger de la Fontaine\'s House'),
            ]),
            section(108, 'Refinery Area', [
                iso(140, 'Refinery', [
                    iso(141, 'Room 2'),
                    iso(142, 'Room 3'),
                    iso(145, 'Gas Tanks Room'),
                    iso(146, 'Secret Room'),
                    iso(143, 'Last Room'),
                ]),
                iso(144, 'Access to Zeppelin Port')
            ]),
            section(107, 'Zeppelin Port')
        ]),
        island(120, 'Elevator'),
        island(110, 'Island CX', [
            iso(180, 'Corridor (dragon)'),
            iso(179, 'Control Tower', [
                iso(178, 'Switches Room'),
                iso(177, 'Stairs')
            ]),
            iso(182, 'Emperor Spacecraft (CX)')
        ]),
        island(-1, '[DEMO] Otringal', [
            section(205, '[DEMO] Spaceport'),
            section(209, '[DEMO] Harbour', [
                iso(210, '[DEMO] Bar')
            ]),
            section(138, '[DEMO] Baldino\'s Landing Zone'),
            section(211, '[DEMO] Town Square'),
            section(-1, '[DEMO] Emperor Palace', [
                iso(-1, '[DEMO] Palace', [
                    iso(217, '[DEMO] Top-left 3, pig farmers')
                ])
            ])
        ]),
        island(-1, '[DEMO] Celebration Island', [
            iso(-1, '[DEMO] Statue', [
                iso(218, '[DEMO] Middle')
            ]),
        ]),
        island(-1, '[DEMO] Franco Island', [
            section(212, '[DEMO] Village')
        ]),
        island(-1, '[DEMO] Island CX', [
            iso(-1, '[DEMO] Control Tower', [
                iso(221, '[DEMO] Switches Room')
            ])
        ])
    ]),
    planet('Undergas', 'undergas', [
        island(-1, 'Elevator Island', [
            section(98, 'Elevator Area', [
                iso(123, 'Elevator Building')
            ]),
            section(99, 'Mine Area', [
                iso(111, 'Mine'),
                iso(125, 'Bank', [
                    iso(124, 'Box Transit Room'),
                    iso(126, 'Hatch Room')
                ])
            ]),
            section(96, 'Church Area', [
                iso(-1, 'Church', [
                    iso(116, 'Monk Home'),
                    iso(119, 'Stairs (with lava)'),
                    iso(117, 'Fragment room', [
                        iso(121, 'Fragment room (with Monk)')
                    ])
                ])
            ]),
            section(97, 'Ferryman Area')
        ]),
        island(-1, 'Mosquibee Island', [
            section(105, 'Nest Area', [
                iso(106, 'Nest', [
                    iso(128, 'Blowtron Test'),
                    iso(149, 'Upper Exit'),
                ]),
            ]),
            section(103, 'Monster Area', [
                iso(176, 'Access to Island CX')
            ]),
            section(102, 'Mountain Top')
        ]),
        island(-1, 'Volcano Island', [
            section(132, 'Ferryman Area'),
            section(131, 'Cave Area', [
                iso(129, 'Cave')
            ]),
            section(130, 'Mountain Top')
        ]),
        island(-1, '[DEMO] Elevator Island', [
            section(213, '[DEMO] Elevator Area')
        ]),
        island(-1, '[DEMO] Mosquibee Island', [
            section(216, '[DEMO] Nest Area')
        ]),
        island(-1, '[DEMO] Volcano Island', [
            section(219, '[DEMO] Cave Area')
        ])
    ])
]);
