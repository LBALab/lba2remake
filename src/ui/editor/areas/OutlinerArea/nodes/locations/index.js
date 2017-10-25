import {Twinsun} from './twinsun';
import {Moon} from './moon';
import {ZeelishSurface} from './zeelish_surface';
import {ZeelishUndergas} from './zeelish_undergas';

export const LocationsNode = {
    name: 'Locations',
    children: [
        Twinsun,
        Moon,
        ZeelishSurface,
        ZeelishUndergas
    ]
};
