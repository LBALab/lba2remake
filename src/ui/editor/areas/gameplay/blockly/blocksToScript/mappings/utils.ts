import { degreesToLBA } from '../../../../../../../utils/lba';

export function mapValue(value, type) {
    switch (type) {
        case 'angle':
            return degreesToLBA(value);
        case 'actor':
        case 'zone':
        case 'anim':
        case 'body':
        case 'vargame':
        case 'varscene':
        case 'item':
        case 'track':
        case 'behaviour':
        case 'text':
        case 'scene':
        case 'dirmode':
        case 'hero_behaviour':
            return Number(value);
    }
    return value;
}
