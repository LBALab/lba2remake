import { loadLibrary } from '../../game/scenery/isometric/grid';
import { Resource } from '../load';
import { getCells } from './grids2';

export const parseGridLBA1 = async (resource: Resource, index: number, param: any) => {
    // this dependency shouldn't be here
    const { bricks, mask, palette, is3D, gridMetadata } = param;
    const gridData = new DataView(resource.getEntry(index));
    const library = await loadLibrary(bricks, mask, palette, index);
    const maxOffset = 4096 * 2;
    const offsets: number[] = [];
    for (let i = 0; i < maxOffset; i += 2) {
        offsets.push(gridData.getUint16(i, true));
    }
    const cells = getCells(gridData, offsets, library, is3D, gridMetadata);
    return {
        library,
        cells,
    };
};
