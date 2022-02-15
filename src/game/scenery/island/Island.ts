import * as THREE from 'three';

import IslandPhysics from './IslandPhysics';
import { IslandProps } from './data/islands';
import islandSceneMapping from './data/sceneMapping';
import Game from '../../Game';
import Scene from '../../Scene';
import { Time } from '../../../datatypes';
import { LBA2GameFlags } from '../../data/gameFlags';
import { buildIsland, IslandBuildInfo, IslandComponent } from './buildIsland';
import { loadIslandData } from './data';
export interface IslandOptions {
    cache: 'none' | 'regular' | 'editor' | 'editor_baked' | 'preview';
    preview: boolean;
    editor: boolean;
    export: boolean;
    flags?: any[];
    withBaking: boolean;
}

const islandsCache = {
    regular: new Map<string, Island>(),
    editor: new Map<string, Island>(),
    editor_baked: new Map<string, Island>(),
    preview: new Map<string, Island>()
};

export default class Island {
    readonly name: string;
    readonly threeObject: THREE.Object3D;
    readonly physics: IslandPhysics;
    readonly props: IslandProps;
    readonly sections: any;
    private readonly components: IslandComponent[];

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
        const data = await loadIslandData(name, ambience);
        const buildInfo = await buildIsland(data, options);
        const island = new Island(buildInfo);
        if (options.cache !== 'none') {
            islandsCache[options.cache].set(name, island);
        }
        return island;
    }

    private constructor(islandContent: IslandBuildInfo) {
        const { name, threeObject, physics, props, sections, components } = islandContent;
        this.name = name;
        this.threeObject = threeObject;
        this.physics = physics;
        this.props = props;
        this.sections = sections;
        this.components = components;
    }

    update(game: Game, scene: Scene, time: Time) {
        for (const component of this.components) {
            component.update(game, scene, time);
        }
    }
}
