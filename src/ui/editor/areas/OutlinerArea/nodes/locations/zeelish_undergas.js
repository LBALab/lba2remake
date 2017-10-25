import {planet, island, section, iso} from './functions';

export const ZeelishUndergas = planet('Zeelish (undergas)', 'undergas', [
    island(-1, 'Elevator Island (Wannies)', [
        section(98, 'Elevator Area', [
            iso(123, 'Elevator Building')
        ]),
        section(99, 'Mine Area', [
            iso(100, 'Mine', [
                iso(111, 'Gem corridor'),
                iso(112, 'Access to Fragment room'),
                iso(117, 'Fragment room'),
                iso(122, 'Passage to Bank'),
            ]),
            iso(125, 'Bank', [
                iso(124, 'Box Transit Room'),
                iso(126, 'Hatch Room')
            ])
        ]),
        section(96, 'Church Area', [
            iso(118, 'Church Building', [
                iso(116, 'Monk Home'),
                iso(119, 'Stairs (with lava)'),
                iso(101, 'Firefly Tart house'),
                iso(121, 'Church')
            ])
        ]),
        section(97, 'Ferryman Area')
    ]),
    island(-1, 'Mosquibee Island', [
        section(105, 'Nest Area', [
            iso(106, 'Nest', [
                iso(104, 'Queen Throne room'),
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
    island(-1, '[DEMO] Elevator Island (Wannies)', [
        section(213, '[DEMO] Elevator Area'),
        section(-1, '[DEMO] Mine Area', [
            iso(214, '[DEMO] Mine'),
        ])
    ]),
    island(-1, '[DEMO] Mosquibee Island', [
        section(216, '[DEMO] Nest Area', [
            iso(215, '[DEMO] Queen Throne room')
        ])
    ]),
    island(-1, '[DEMO] Volcano Island', [
        section(219, '[DEMO] Cave Area')
    ])
]);
