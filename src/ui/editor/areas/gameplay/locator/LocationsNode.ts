import Twinsun from './locations/Twinsun';
import Moon from './locations/Moon';
import ZeelishSurface from './locations/ZeelishSurface';
import ZeelishUndergas from './locations/ZeelishUndergas';

interface LocationType {
    name: string;
    type: string;
    children: LocationType[];
    props?: any[];
    onClick?: Function;
    selected?: Function;
    color?: string;
    icon?: string;
    goto?: Function;
}

const LocationsNode : LocationType = {
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
