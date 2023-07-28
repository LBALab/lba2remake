import { degreesToLBA } from '../../../../../../../../utils/lba';

export function mapValue(value, type) {
    switch (type) {
        case 'angle':
            return degreesToLBA(value);
        case 'actor':
        case 'sceneric_zone':
        case 'ladder_zone':
        case 'rail_zone':
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
        case 'choice_value':
            return Number(value);
    }
    return value;
}
