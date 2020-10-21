import { map } from 'lodash';
import { loadModel } from './models';

export async function loadMetadata(entry, library, mergeReplacements = false) {
    const layoutsReq = await fetch('/metadata/layouts.json');
    const layoutsMetadata = await layoutsReq.json();
    const isoScenesReq = await fetch('/metadata/iso_scenes.json');
    const isoScenesMetadata = await isoScenesReq.json();
    const hasFullReplacement = !mergeReplacements && isoScenesMetadata.includes(entry);
    const libMetadata = layoutsMetadata[library.index];
    const layouts = {};
    const variants = [];
    await Promise.all(map(libMetadata, async (data, idx) => {
        let info = null;
        if (data.replace) {
            if (hasFullReplacement) {
                info = {...data};
            } else {
                const model = await loadModel(`/models/layouts/${data.file}`, true);
                model.scene.name = data.file;
                info = {
                    ...data,
                    threeObject: model.scene,
                    animations: model.animations
                };
            }
        } else if (data.mirror) {
            info = {...data};
        } else if (data.suppress) {
            info = {...data};
        }

        if (info) {
            const m = idx.match(/^(\d+):(.*)$/);
            const key = m ? m[1] : idx;
            if (!(key in layouts)) {
                layouts[key] = {};
            }
            if (m) {
                const [szRaw, blocksRaw] = m[2].split(':');
                const sz = szRaw.split('x');
                variants.push({
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
    variants.sort((v0, v1) => {
        const sz0 = v0.props.nX * v0.props.nY * v0.props.nZ;
        const sz1 = v1.props.nX * v1.props.nY * v1.props.nZ;
        return sz1 - sz0;
    });
    return { hasFullReplacement, mergeReplacements, layouts, variants };
}
