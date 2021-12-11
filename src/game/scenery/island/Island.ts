import * as THREE from 'three';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

import IslandLayout from './IslandLayout';
import IslandPhysics from './IslandPhysics';
import { createBoundingBox } from '../../../utils/rendering';
import { loadLUTTexture } from '../../../utils/lut';
import islandsInfo, { IslandProps } from './data/islands';
import { getCommonResource, getPalette, getIsland, getIslandObjects } from '../../../resources';
import islandSceneMapping from './data/sceneMapping';
import Game from '../../Game';
import Scene from '../../Scene';
import { Time } from '../../../datatypes';
import { loadEnvironmentComponents } from './environment';
import { loadGeometries, loadGeometriesInfoOnly } from './geometries';
import { loadPickingPlanes } from './preview';
import { getParams } from '../../../params';
import { LBA2GameFlags } from '../../data/gameFlags';
import LightMapPlugin from '../../../graphics/gltf/LightMapPlugin';
import LBAMaterialsPlugin from '../../../graphics/gltf/LBAMaterialsPlugin';
import IslandShadows from './IslandShadows';

const textureLoader = new THREE.TextureLoader();

const islandsCache = {
    regular: new Map<string, Island>(),
    editor: new Map<string, Island>(),
    editor_baked: new Map<string, Island>(),
    preview: new Map<string, Island>()
};

export interface IslandData {
    name: string;
    ress: any;
    palette: any;
    ile: any;
    obl: any;
    ambience: any;
    lutTexture: THREE.DataTexture;
    smokeTexture: THREE.Texture;
    bakedModel: GLTF;
}

export interface IslandOptions {
    cache: 'none' | 'regular' | 'editor' | 'editor_baked' | 'preview';
    preview: boolean;
    editor: boolean;
    export: boolean;
    flags?: any[];
    withBaking: boolean;
}

interface IslandComponent {
    update: (game: Game, scene: Scene, time: Time) => void;
    threeObject?: THREE.Object3D;
}

export default class Island {
    readonly name: string;
    readonly threeObject: THREE.Object3D;
    readonly physics: IslandPhysics;
    readonly props: IslandProps;
    readonly sections: any;
    private components: IslandComponent[] = [];

    static async load(game: Game, sceneData: any): Promise<Island> {
        let name = islandSceneMapping[sceneData.index].island;
        if (game.getState().flags.quest[LBA2GameFlags.CHAPTER] < 2 && name === 'CITABAU') {
            name = 'CITADEL';
        }
        return Island.loadWithCache(name, sceneData.ambience, {
            cache: 'none',
            preview: false,
            editor: false,
            export: false,
            flags: game.getState().flags.quest,
            withBaking: true
        });
    }

    static async loadForEditor(name: string, ambience: any, baked: boolean): Promise<Island> {
        return Island.loadWithCache(name, ambience, {
            cache: baked ? 'editor_baked' : 'editor',
            preview: false,
            editor: true,
            export: false,
            withBaking: baked
        });
    }

    static async loadForPreview(name: string, ambience: any): Promise<Island> {
        return Island.loadWithCache(name, ambience, {
            cache: 'preview',
            preview: true,
            editor: false,
            export: false,
            withBaking: true
        });
    }

    static async loadForExport(name: string, ambience: any): Promise<Island> {
        return Island.loadWithCache(name, ambience, {
            cache: 'none',
            preview: false,
            editor: false,
            export: true,
            withBaking: false
        });
    }

    private static async loadWithCache(
        name: string,
        ambience: any,
        options: IslandOptions
    ): Promise<Island> {
        if (options.cache !== 'none' && islandsCache[options.cache].has(name)) {
            return islandsCache[options.cache].get(name);
        }
        const data = await Island.loadData(name, ambience, options);
        const island = new Island(data, options);
        if (options.cache !== 'none') {
            islandsCache[options.cache].set(name, island);
        }
        return island;
    }

    private static async loadData(
        name: string,
        ambience: any,
        options: IslandOptions
    ): Promise<IslandData> {
        const [ress, palette, ile, obl, lutTexture, smokeTexture, bakedModel] = await Promise.all([
            getCommonResource(),
            getPalette(),
            getIsland(name),
            getIslandObjects(name),
            loadLUTTexture(),
            textureLoader.loadAsync('images/smoke.png'),
            Island.loadBakedModel(name, options),
        ]);
        return {
            name,
            ress,
            palette,
            ile,
            obl,
            ambience,
            lutTexture,
            smokeTexture,
            bakedModel,
        };
    }

    private static async loadBakedModel(name: string, options: IslandOptions): Promise<GLTF> {
        if (!options.withBaking) {
            return null;
        }
        const info = await fetch(`models/lba2/islands/${name}.glb`, {
            method: 'HEAD'
        });
        if (!info.ok) {
            return null;
        }
        const loader = new GLTFLoader();
        loader.register(parser => new LightMapPlugin(parser));
        loader.register(parser => new LBAMaterialsPlugin(parser));
        return loader.loadAsync(`models/lba2/islands/${name}.glb`);
    }

    private constructor(data: IslandData, options: IslandOptions) {
        this.name = data.name;
        this.props = islandsInfo[data.name];
        if (data.bakedModel) {
            this.threeObject = data.bakedModel.scene;
        } else {
            this.threeObject = new THREE.Object3D();
        }
        this.threeObject.name = `island_${data.name}`;
        this.threeObject.matrixAutoUpdate = false;
        const layout = new IslandLayout(data.ile, options);

        const geomInfo = data.bakedModel
            ? loadGeometriesInfoOnly(this.threeObject, data, layout)
            : loadGeometries(this.threeObject, this.props, data, options, layout);

        if (!options.export) {
            this.addObjectBoundingBoxes(layout);
        }
        if (options.export) {
            this.patchObjectForExport(this.name, layout);
        }
        if (options.preview) {
            loadPickingPlanes(this.threeObject, layout);
        }

        if (!options.export) {
            this.physics = new IslandPhysics(layout);
            if (!options.withBaking && !options.editor) {
                this.components.push(new IslandShadows(geomInfo));
            }
            this.components.push(
                ...loadEnvironmentComponents(
                    data,
                    this.props.envInfo,
                    this.physics,
                    layout,
                    geomInfo,
                    options
                )
            );
            this.addComponentNodes();
            this.sections = layout.groundSections;
        }
    }

    update(game: Game, scene: Scene, time: Time) {
        for (const component of this.components) {
            component.update(game, scene, time);
        }
    }

    private addComponentNodes() {
        for (const component of this.components) {
            if (component.threeObject) {
                this.threeObject.add(component.threeObject);
            }
        }
    }

    private addObjectBoundingBoxes(layout: IslandLayout) {
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
        this.threeObject.add(boundingBoxes);
    }

    private patchObjectForExport(name: string, layout: IslandLayout) {
        for (const section of layout.groundSections) {
            for (const obj of section.objects) {
                if (obj.index === 26 && name === 'CITADEL') { // Lamp post
                    const lamp = new THREE.PointLight();
                    lamp.color.set(0xffffaa);
                    lamp.intensity = 500.0;
                    lamp.userData.radius = 0.6;
                    lamp.position.set(obj.x, obj.y + 3, obj.z);
                    this.threeObject.add(lamp);
                }
            }
        }
    }
}
