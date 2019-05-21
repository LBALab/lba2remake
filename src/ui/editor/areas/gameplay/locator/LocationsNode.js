import Twinsun from './locations/Twinsun';
import Moon from './locations/Moon';
import ZeelishSurface from './locations/ZeelishSurface';
import ZeelishUndergas from './locations/ZeelishUndergas';

const LocationsNode = {
    name: 'Planets',
    type: 'all',
    children: [
        Twinsun,
        Moon,
        ZeelishSurface,
        ZeelishUndergas
    ]
};

export default LocationsNode;
