import Twinsun from './locations/Twinsun';
import Moon from './locations/Moon';
import ZeelishSurface from './locations/ZeelishSurface';
import ZeelishUndergas from './locations/ZeelishUndergas';
import { getParams } from '../../../../../params';

interface LocationType {
    id?: string;
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

const { game } = getParams();

const LocationsNode : LocationType = {
    name: 'Planets',
    type: 'all',
    children: game === 'lba1' ? [
        Twinsun,
    ] : [
        Twinsun,
        Moon,
        ZeelishSurface,
        ZeelishUndergas
    ]
};

export default LocationsNode;
