import {planet, island, section, iso} from './functions';
import { getParams } from '../../../../../../params';

const TwinsunLBA2 = planet('Twinsun', 'twinsun', [
    island(-1, 'Citadel island', 'CITABAU', [
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
    island(-1, 'Desert island', 'DESERT', [
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
    island(-1, '[DEMO] Citadel island', 'CITABAU', [
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
    island(-1, '[DEMO] Desert island', 'DESERT', [
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

const TwinsunLBA1 = planet('Twinsun', 'twinsun', [
    island(-1, 'Citadel island', '', [
        section(1, 'Outside the Citadel', [
            iso(0, 'Prison'),
            iso(16, 'Rabbibunny House'),
        ]),
        section(2, 'Lupin-Bourg', [
            iso(14, 'Chez Luc', [
                iso(33, 'Cellar'),
            ]),
            iso(117, 'End Sequence (2)'),
        ]),
        section(3, 'Lupin-Bourg (statue)', [
            iso(7, 'Pharmacy'),
            iso(34, 'Sewer'),
            iso(55, 'Sewer (secret)'),
            iso(116, 'End Sequence (1)'),
        ]),
        section(6, 'Harbor', [
            iso(35, 'Warehouse'),
            iso(104, 'Ticket Office'),
        ]),
        section(4, 'Twinsen\'s House Area', [
            iso(5, 'Twinsen\'s House', [
                iso(21, 'Secret Chamber'),
            ]),
            iso(118, 'Twinsen\'s House Destroyed'),
            iso(20, 'Architects House')
        ]),
    ]),
    island(-1, 'Desert island', '', [
        section(39, 'Militairy Camp', [
            iso(8, 'Temple of Bú (1)'),
        ]),
        section(36, 'Outside the Temple of Bú', [
            iso(57, 'Maze'),
            iso(8, 'Temple of Bú (1)'),
            iso(40, 'Temple of Bú (2)'),
            iso(41, 'Temple of Bú (3)'),
        ]),
    ]),
    island(-1, 'Hamalayi Mountains', '', [
        section(9, 'Landing Place', [
            iso(15, 'Rabbibunny Village'),
            iso(62, '1st Fighting'),
            iso(63, '2nd Fighting'),
            iso(64, 'Prison'),
            iso(65, 'Outside the Transporter'),
            iso(66, 'Inside the Transporter'),
            iso(67, 'Mutation Centre (1)'),
            iso(68, 'Mutation Centre (2)'),
            iso(69, '3rd Fighting'),
            iso(70, 'Entrance to the Prison'),
            iso(71, 'Outside the Prison'),
            iso(72, 'Catamaran Dock'),
            iso(73, 'Bunker near Clear Water'),
            iso(81, 'Sacret Carrot'),
            iso(82, 'Backdoor of the Prison'),
            iso(91, 'Behind the Sacret Carrot'),
            iso(92, 'Clear Water Lake'),
            iso(96, 'Ski Resort'),
        ]),
    ]),
    island(-1, 'Principal Island', '', [
        section(12, 'Outside the Fortress', [
            iso(105, 'Inside the Fortress'),
            iso(10, 'Library'),
            iso(11, 'Harbor'),
            iso(13, 'Old Burg'),
            iso(17, 'Ruins'),
            iso(18, 'Outside the Library'),
            iso(19, 'Militairy Camp'),
            iso(22, 'Ticket Office'),
            iso(23, 'Prison'),
            iso(24, 'Port Belooga'),
            iso(25, 'Peg Leg Street'),
            iso(26, 'Shop'),
            iso(27, 'Locksmith'),
            iso(28, 'Inside a Rabbibunny House'),
            iso(29, 'Astronimers House'),
            iso(30, 'Tavern'),
            iso(31, 'Basement of the Astronomer'),
            iso(32, 'Stables'),
            iso(37, 'Outside the Water Tower'),
            iso(38, 'Inside the Water Tower'),
            iso(52, 'house at Peg Leg Street'),
            iso(56, 'Sewer (secret)'),
            iso(58, 'House with the TV'),
            iso(102, 'House in Port Belooga'),
            iso(61, 'Some room (cut-out ?)'),
        ]),
    ]),
    island(-1, 'Proxima Island', '', [
        section(42, 'Proxim City', [
            iso(43, 'Museum'),
            iso(44, 'Near the Inventors House'),
            iso(45, 'Upper Rune Stone'),
            iso(46, 'Lower Rune Stone'),
            iso(47, 'Before the Upper Rune Stone'),
            iso(48, 'Forgers House'),
            iso(49, 'Prison'),
            iso(50, 'Shop'),
            iso(51, 'Sewer'),
            iso(53, 'Grobo House'),
            iso(54, 'Inventors House'),
        ]),
    ]),
    island(-1, 'Rebellion Island', '', [
        section(59, 'Harbor', [
            iso(60, 'Rebel Camp'),
        ]),
    ]),
    island(-1, 'Tippet Island', '', [
        section(74, 'Village', [
            iso(75, 'Secret Passage (2)'),
            iso(76, 'near the bar'),
            iso(77, 'Secret Passage (1)'),
            iso(78, 'near the Dino-Fly'),
            iso(79, 'Secret Passage (3)'),
            iso(80, 'Twinsun Cafe'),
            iso(101, 'Shop'),
        ]),
    ]),
    island(-1, 'Fortress Island', '', [
        section(84, 'Outside the Forstress', [
            iso(83, 'Inside the Forstress'),
            iso(85, 'Secret Passage Scene'),
            iso(86, 'Secret in the Fortress'),
            iso(87, 'Near Zoe\'s Cell'),
            iso(88, 'Swimming Pool'),
            iso(89, 'Cloning Centre'),
            iso(90, 'Rune Stone'),
            iso(93, 'Outside Fortress Destroyed'),
            iso(100, 'Docks'),
        ]),
    ]),
    island(-1, 'Brundle Island', '', [
        section(94, 'Outside the Teleportation', [
            iso(95, 'Inside the Teleportation'),
            iso(97, 'Docks'),
            iso(98, 'Secret Room'),
            iso(99, 'Near the Telepods'),
            iso(103, 'Painters House'),
        ]),
    ]),
    island(-1, 'Pollar Island', '', [
        section(115, '1st Scene', [
            iso(106, '2nd Scene'),
            iso(107, '3rd Scene'),
            iso(108, 'Before the Rocky Peak'),
            iso(109, '4th Scene'),
            iso(110, 'The Rocky Peak'),
            iso(111, 'On the Rocky Peak'),
            iso(112, 'Before the End Room'),
            iso(113, 'Final Battle'),
            iso(114, 'End Scene'),
        ]),
    ]),
    island(-1, 'Credits', '', [
        section(119, 'Credits List Sequence'),
    ]),
]);

const { game } = getParams();

export default game === 'lba1' ? TwinsunLBA1 : TwinsunLBA2;
