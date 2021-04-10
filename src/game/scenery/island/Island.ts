import * as THREE from 'three';

import IslandLayout from './IslandLayout';
import IslandPhysics from './IslandPhysics';
import { createBoundingBox } from '../../../utils/rendering';
import { loadLUTTexture } from '../../../utils/lut';
import islandsInfo from './data/islands';
import { getCommonResource, getPalette, getIsland, getIslandObjects } from '../../../resources';
import islandSceneMapping from './data/sceneMapping';
import Game from '../../Game';
import Scene from '../../Scene';
import { Time } from '../../../datatypes';
import IslandShadows from './IslandShadows';
import { loadEnvironmentComponents } from './environment';
import { loadGeometries } from './geometries';
import { loadPickingPlanes } from './preview';
import { getParams } from '../../../params';
import { LBA2GameFlags } from '../../data/gameFlags';

const textureLoader = new THREE.TextureLoader();

const islandsCache = {
    regular: new Map<string, Island>(),
    editor: new Map<string, Island>(),
    preview: new Map<string, Island>()
};

interface IslandData {
    name: string;
    ress: any;
    palette: any;
    ile: any;
    obl: any;
    ambience: any;
    lutTexture: THREE.DataTexture;
    smokeTexture: THREE.Texture;
}

interface IslandOptions {
    cache: 'regular' | 'editor' | 'preview';
    preview: boolean;
    editor: boolean;
}

interface IslandComponent {
    update: (game: Game, scene: Scene, time: Time) => void;
    threeObject?: THREE.Object3D;
}

export default class Island {
    readonly name: string;
    readonly threeObject: THREE.Object3D;
    readonly physics: IslandPhysics;
    readonly props: any;
    readonly sections: any;
    private components: IslandComponent[] = [];

    static async load(game: Game, sceneData: any): Promise<Island> {
        let name = islandSceneMapping[sceneData.index].island;
        if (game.getState().flags.quest[LBA2GameFlags.CHAPTER] < 2 && name === 'CITABAU') {
            name = 'CITADEL';
        }
        return Island.loadWithCache(name, sceneData.ambience, {
            cache: 'regular',
            preview: false,
            editor: false
        });
    }

    static async loadForEditor(name: string, ambience: any): Promise<Island> {
        return Island.loadWithCache(name, ambience, {
            cache: 'editor',
            preview: false,
            editor: true
        });
    }

    static async loadForPreview(name: string, ambience: any): Promise<Island> {
        return Island.loadWithCache(name, ambience, {
            cache: 'preview',
            preview: true,
            editor: false
        });
    }

    private static async loadWithCache(
        name: string,
        ambience: any,
        options: IslandOptions
    ): Promise<Island> {
        if (islandsCache[options.cache].has(name)) {
            return islandsCache[options.cache].get(name);
        }
        const data = await Island.loadData(name, ambience);
        const island = new Island(data, options);
        islandsCache[options.cache].set(name, island);
        return island;
    }

    private static async loadData(name, ambience): Promise<IslandData> {
        const [ress, palette, ile, obl, lutTexture, smokeTexture] = await Promise.all([
            getCommonResource(),
            getPalette(),
            getIsland(name),
            getIslandObjects(name),
            loadLUTTexture(),
            textureLoader.loadAsync('images/smoke.png')
        ]);
        return {
            name,
            ress,
            palette,
            ile,
            obl,
            ambience,
            lutTexture,
            smokeTexture
        };
    }

    private constructor(data: IslandData, options: IslandOptions) {
        this.name = data.name;
        this.props = islandsInfo[data.name];
        this.threeObject = new THREE.Object3D();
        this.threeObject.name = `island_${data.name}`;
        this.threeObject.matrixAutoUpdate = false;
        const layout = new IslandLayout(data.ile);

        const geomInfo = loadGeometries(this.threeObject, this.props, data, layout);

        this.addObjectBoundingBoxes(layout);
        if (options.preview) {
            loadPickingPlanes(this.threeObject, layout);
        }

        this.physics = new IslandPhysics(layout);
        this.components.push(new IslandShadows(geomInfo));
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
                boundingBoxes.add(box);
            }
        }
        this.threeObject.add(boundingBoxes);
    }
}
