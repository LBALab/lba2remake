import {planet, island, section, iso} from './functions';

const Moon = planet('Emerald moon', 'moon', [
    island(-1, 'Moon base', 'EMERAUDE', [
        section(75, 'Landing zone', [
            iso(115, 'Esmer Spacecraft'),
            iso(52, 'Circle Airlock'),
            iso(167, 'Triangle Airlock'),
            iso(13, 'L-shaped corridors'),
            iso(54, 'Jail Cell'),
        ]),
        section(77, 'Switches Building Area', [
            iso(31, 'Switches Building'),
            iso(168, 'Square Airlock'),
            iso(23, 'Radar room')
        ]),
        section(76, 'Baldino\'s Spaceship Area', [
            iso(53, 'Cross Airlock'),
        ]),
        section(74, 'Antena Area'),
        section(208, '[DEMO] Landing zone'),
    ]),
]);

export default Moon;
