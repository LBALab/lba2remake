import * as THREE from 'three';

import IslandLayout, { IslandSection } from './IslandLayout';
import IslandPhysics from './IslandPhysics';
import { createBoundingBox } from '../../../utils/rendering';
import islandsInfo, { IslandProps } from './data/islands';
import Game from '../../Game';
import Scene from '../../Scene';
import { Time } from '../../../datatypes';
import { loadEnvironmentComponents } from './environment';
import { loadGeometries, loadGeometriesInfoOnly } from './geometries';
import { loadPickingPlanes } from './preview';
import { getParams } from '../../../params';
import IslandShadows from './IslandShadows';
import { addObjects } from './patches';
import { IslandData } from './data';
import { IslandOptions } from './Island';
import { hasBakedModel, loadBakedModel } from './bakedModel';
import { loadIslandModels } from './model';

export interface IslandComponent {
    update: (game: Game, scene: Scene, time: Time) => void;
    threeObject?: THREE.Object3D;
}

export interface IslandBuildInfo {
    name: string;
    threeObject: THREE.Object3D;
    physics: IslandPhysics | null;
    props: IslandProps;
    sections: IslandSection[];
    components: IslandComponent[];
}

export async function buildIsland(
    data: IslandData,
    options: IslandOptions
): Promise<IslandBuildInfo> {
    const name = data.name;
    const props = islandsInfo[data.name];
    let threeObject;
    const useBakedModel = options.withBaking && await hasBakedModel(data.name);
    const models = loadIslandModels(data);
    if (useBakedModel) {
        threeObject = await loadBakedModel(data, models);
    } else {
        threeObject = new THREE.Object3D();
    }
    threeObject.name = `island_${data.name}`;
    threeObject.matrixAutoUpdate = false;
    const layout = new IslandLayout(data.ile, options);

    const geomInfo = useBakedModel
        ? loadGeometriesInfoOnly(threeObject, data, layout, models)
        : loadGeometries(threeObject, props, data, options, layout, models);

    if (!options.export) {
        addObjectBoundingBoxes(threeObject, layout);
    }
    if (options.export) {
        patchObjectForExport(threeObject, name, layout);
    }
    if (options.preview) {
        loadPickingPlanes(threeObject, layout);
    }

    const components = [];
    let physics = null;
    let sections = [];
    if (!options.export) {
        physics = new IslandPhysics(layout);
        if (!options.withBaking && !options.editor) {
            components.push(new IslandShadows(geomInfo));
        }
        components.push(
            ...loadEnvironmentComponents(
                data,
                props.envInfo,
                physics,
                layout,
                geomInfo,
                options
            )
        );
        for (const component of components) {
            if (component.threeObject) {
                threeObject.add(component.threeObject);
            }
        }
        sections = layout.groundSections;
    }
    return {
        name,
        threeObject,
        physics,
        props,
        sections,
        components,
    };
}

function addObjectBoundingBoxes(threeObject: THREE.Object3D, layout: IslandLayout) {
    const params = getParams();
    if (!params.editor) {
        return;
    }

    const boundingBoxes = new THREE.Object3D();
    boundingBoxes.name = 'BoundingBoxes';
    boundingBoxes.visible = false;
    boundingBoxes.matrixAutoUpdate = false;
    for (const section of layout.groundSections) {
        for (const obj of section.objects) {
            const box = createBoundingBox(obj.boundingBox, new THREE.Vector3(0.9, 0.9, 0.9));
            box.name = `[${section.x},${section.z}]:${obj.index}`;
            if (obj.label) {
                box.add(obj.label);
            }
            boundingBoxes.add(box);
        }
    }
    threeObject.add(boundingBoxes);
}

function patchObjectForExport(threeObject: THREE.Object3D, name: string, layout: IslandLayout) {
    for (const section of layout.groundSections) {
        for (const obj of section.objects) {
            const objects = addObjects(name, obj);
            for (const newObj of objects) {
                newObj.position.x += obj.x;
                newObj.position.y += obj.y;
                newObj.position.z += obj.z;
                threeObject.add(newObj);
            }
        }
    }
}
