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
        let info = null;
        if (data.replace) {
            if (hasFullReplacement) {
                info = {...data};
            } else {
                const threeObject = await loadModel(`/models/layouts/${data.file}`, true);
                info = {
                    ...data,
                    threeObject
                };
            }
        } else if (data.mirror) {
            info = {...data};
        }

        if (info) {
            const m = idx.match(/^(\d+):(.*)$/);
            const key = m ? m[1] : idx;
            if (!(key in layouts)) {
                layouts[key] = {};
            }
            if (m) {
                if (!('variants' in layouts[key])) {
                    layouts[key].variants = [];
                }
                const [szRaw, blocksRaw] = m[2].split(':');
                const sz = szRaw.split('x');
                layouts[key].variants.push({
                    props: {
                        nX: Number(sz[0]),
                        nY: Number(sz[1]),
                        nZ: Number(sz[2]),
                        layout: Number(key),
                        blocks: blocksRaw.split(',').map(Number)
                    },
                    ...info
                });
            } else {
                Object.assign(layouts[key], info);
            }
        }
    }));
    return { hasFullReplacement, layouts };
}
