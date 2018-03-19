import {planet, island, section, iso} from './functions';

export const Twinsun = planet('Twinsun', 'twinsun', [
    island(-1, 'Citadel island', [
        section(49, 'Twinsen\'s House Area', [
            iso(0, 'Twinsen\'s House', [
                iso(1, 'Cellar'),
            ]),
            iso(9, 'Neighbour\'s House')
        ]),
        section(46, 'Lighthouse Area'),
        section(42, 'Lupin-Bourg (landing zone)', [
            iso(14, 'Mr. Bazoo\'s shop'),
            iso(3, 'Chez Luc', [
                iso(4, 'Cellar'),
            ]),
            iso(17, 'Sewers', [
                iso(18, 'Treasure room'),
                iso(34, 'Sendell\'s ball room'),
            ]),
            iso(191, 'Esmer Spacecraft (Spying)')
        ]),
        section(48, 'Lupin-Bourg (statue)', [
            iso(15, 'Museum'),
            iso(5, 'Baggage Claim', [
                iso(6, 'Downstairs'),
                iso(16, 'Labyrinth room'),
            ]),
            iso(22, 'Pharmacy'),
            iso(37, 'School'),
        ]),
        section(43, 'Harbour', [
            iso(7, 'Paul\'s House'),
            iso(8, 'Tickets Office'),
        ]),
        section(44, 'Dome', [
            iso(26, 'In the Dome'),
        ]),
        section(47, 'Flower\'s Circle', [
            iso(51, 'Spider Cave')
        ]),
        section(45, 'Wizard\'s Tent Area', [
            iso(21, 'Wizard\'s Tent'),
            iso(2, 'Tralü\'s Cave', [
                iso(20, 'Meet Joe the Elf'),
                iso(19, 'Small tralüs'),
            ])
        ]),
        section(50, 'Woodbridge')
    ]),
    island(-1, 'Desert island', [
        section(55, 'Oasis'),
        section(56, 'Between Oasis and Racetrack'),
        section(57, 'Racetrack'),
        section(58, 'Behind Racetrack'),
        section(60, 'Town Square', [
            iso(40, 'Tickets Office'),
            iso(35, 'Leone\'s House'),
            iso(36, 'Shop'),
            iso(38, 'Baldino\'s House'),
            iso(39, 'Bar near the Beach'),
        ]),
        section(59, 'Headland'),
        section(64, 'Pearl Cave (Moya)', [
            iso(113, 'Pearl of Incandescence Cave'),
        ]),
        section(69, 'Behind Perl Cave'),
        section(61, 'Graveyard', [
            iso(28, 'School of Magic', [
                iso(27, 'Classroom'),
                iso(33, 'Blowgun Test'),
            ]),
        ]),
        section(66, 'Center Dunes'),
        section(67, 'Temple of Bu', [
            iso(10, 'Temple of Bu', [
                iso(127, 'Well'),
                iso(11, 'Downstairs'),
                iso(12, 'Spacecraft Area', [
                    iso(114, 'Spacecraft'),
                ]),
            ])
        ]),
        section(68, 'Behind Temple of Bu'),
        section(62, 'Springboard'),
        section(63, 'Behind Temple of Bu 2?'),
        section(65, 'Esmer Landing Zone'),
        section(70, 'Behind Landing Zone'),
        section(71, 'Between Hacienda and Landing Zone'),
        section(72, 'Hacienda', [
            iso(24, 'Hacienda', [
                iso(29, 'Central Area'),
                iso(25, 'Women\'s Bath'),
                iso(30, 'Men\'s Bath'),
                iso(32, 'Secret Room'),
            ])
        ]),
        section(73, 'Small island (facing Hacienda)', [
            iso(183, 'Protection Spell Cave', [
                iso(184, 'Monster Room'),
            ]),
        ])
    ]),
    island(-1, '[DEMO] Citadel island', [
        section(195, '[DEMO] Twinsen\'s House Area', [
            iso(193, '[DEMO] Twinsen\'s House', [
                iso(194, '[DEMO] Cellar')
            ])
        ]),
        section(196, '[DEMO] Lighthouse Area'),
        section(197, '[DEMO] Harbour'),
        section(-1, '[DEMO] Dome', [
            iso(202, '[DEMO] In the Dome')
        ]),
    ]),
    island(-1, '[DEMO] Desert island', [
        section(203, '[DEMO] Oasis'),
        section(200, '[DEMO] Town Square'),
        section(198, '[DEMO] Headland'),
        section(201, '[DEMO] Graveyard'),
        section(206, '[DEMO] Temple of Bu', [
            iso(207, '[DEMO] Temple of Bu', [
                iso(220, '[DEMO] Spacecraft Area')
            ])
        ]),
        section(199, '[DEMO] Esmer Landing Zone'),
        section(204, '[DEMO] Hacienda')
    ])
]);
