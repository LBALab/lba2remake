import { map } from 'lodash';
import { loadModel } from './models';

export async function loadMetadata(entry, library, forceReplacements = false) {
    const layoutsReq = await fetch('/metadata/layouts.json');
    const layoutsMetadata = await layoutsReq.json();
    const isoScenesReq = await fetch('/metadata/iso_scenes.json');
    const isoScenesMetadata = await isoScenesReq.json();
    const hasFullReplacement = !forceReplacements && isoScenesMetadata.includes(entry);
    const libMetadata = layoutsMetadata[library.index];
    const layouts = {};
    await Promise.all(map(libMetadata, async (data, idx) => {
        if (data.replace) {
            if (hasFullReplacement) {
                layouts[idx] = {...data};
            } else {
                const threeObject = await loadModel(`/models/layouts/${data.file}`, true);
                layouts[idx] = {
                    ...data,
                    threeObject
                };
            }
        } else if (data.mirror) {
            layouts[idx] = {...data};
        }
    }));
    return { hasFullReplacement, layouts };
}
