import { map } from 'lodash';
import { loadModel } from './models';
import { getBricksHQR } from '../../../../resources';
import { loadLayout } from '../layouts';
import { getParams } from '../../../../params';

export async function loadLayoutsMetadata(
    entry,
    library,
    isEditor: boolean,
    isForExport: boolean,
    useBaked: boolean | undefined,
    mergeReplacements = false
) {
    const { game } = getParams();
    const bkg = await getBricksHQR();
    const layoutsReq = await fetch(`/metadata/${game}/layouts.json`);
    const layoutsMetadata = await layoutsReq.json();
    let hasReplacements = false;
    if (!mergeReplacements) {
        const res = await fetch(`/models/${game}/iso_scenes/${entry}.glb`, {
            method: 'HEAD'
        });
        hasReplacements = res.ok;
    }
    let hasBakedReplacements = false;
    if (!mergeReplacements && !isForExport && (useBaked === undefined || useBaked)) {
        const res = await fetch(`/baked_models/${game}/iso_scenes/${entry}.glb`, {
            method: 'HEAD'
        });
        hasBakedReplacements = res.ok;
    }
    const libMetadata = layoutsMetadata[library.index];
    const layouts = {};
    const variants = [];
    await Promise.all(map(libMetadata, async (data, idx) => {
        let info = null;
        if (data.replace) {
            if (hasReplacements) {
                info = {...data};
            } else {
                const model = await loadModel(
                    `/models/${game}/layouts/${data.file}`,
                    !isEditor && !isForExport
                );
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
                const layoutInfo = loadLayout(bkg, {
                    library: library.index,
                    index: Number(key)
                });
                if (info.replace) {
                    variants.push({
                        props: {
                            nX: layoutInfo.nX,
                            nY: layoutInfo.nY,
                            nZ: layoutInfo.nZ,
                            layout: Number(key),
                            blocks: layoutInfo.bricks
                        },
                        ...info
                    });
                }
                Object.assign(layouts[key], info);
            }
        }
    }));
    variants.sort((v0, v1) => {
        const sz0 = v0.props.nX * v0.props.nY * v0.props.nZ;
        const sz1 = v1.props.nX * v1.props.nY * v1.props.nZ;
        return sz1 - sz0;
    });
    return { hasReplacements, hasBakedReplacements, mergeReplacements, layouts, variants };
}
