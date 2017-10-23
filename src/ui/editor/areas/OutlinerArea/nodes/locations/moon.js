import {planet, section, iso} from './functions';

export const Moon = planet('Emerald moon', 'moon', [
    section(75, 'Landing zone', [
        iso(115, 'Esmer Spacecraft')
    ]),
    section(77, 'Switches Building Area'),
    section(76, 'Baldino\'s Spaceship Area'),
    section(74, 'Antena Area'),
    section(208, '[DEMO] Landing zone'),
]);
