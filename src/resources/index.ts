import {
    ResourceName,
    preloadResources,
    loadResource,
    getResourcePath,
    registerResources,
    getResource,
    releaseResource,
}  from './load';
import { getLanguageConfig } from '../lang';
import { getBodyIndex, getAnimIndex } from '../model/entity';

const getVideoPath = (video: string) => {
    return getResourcePath(`VIDEO_${video}`);
};

const getCommonResource = async() => {
    return await loadResource(ResourceName.RESS);
};

const getPalette = async() => {
    return await loadResource(ResourceName.PALETTE);
};

const getSprites = async () => {
    const resource = await loadResource(ResourceName.SPRITES);
    const entriesPromise = [];
    for (let i = 0; i < resource.length; i += 1) {
        entriesPromise.push(loadResource(ResourceName.SPRITES, i));
    }
    return await Promise.all(entriesPromise);
};

const getSpritesClipInfo = async () => {
    return await loadResource(ResourceName.SPRITES_CLIP);
};

const getSpritesRaw = async () => {
    const resource = await loadResource(ResourceName.SPRITERAW);
    const entriesPromise = [];
    for (let i = 0; i < resource.length; i += 1) {
        entriesPromise.push(loadResource(ResourceName.SPRITERAW, i));
    }
    return await Promise.all(entriesPromise);
};

const getSpritesRawClipInfo = async () => {
    return await loadResource(ResourceName.SPRITESRAW_CLIP);
};

const getSpritesAnim3DSClipInfo = async () => {
    return await loadResource(ResourceName.ANIM3DS_CLIP);
};

const getEntities = async () => {
    return await loadResource(ResourceName.ENTITIES);
};

const getAnimations = async (animIdx: number, entityIdx: number) => {
    const entities = await getEntities();

    const entity = entities[entityIdx];
    const realAnimIdx = getAnimIndex(entity, animIdx);

    return await loadResource(ResourceName.ANIM, realAnimIdx);
};

const getAnimationsSync = (animIdx: number, entityIdx: number) => {
    const entities = getResource(ResourceName.ENTITIES);

    const entity = entities[entityIdx];
    const realAnimIdx = getAnimIndex(entity, animIdx);

    return getResource(ResourceName.ANIM, realAnimIdx);
};

const getModels = async (bodyIdx: number, entityIdx: number) => {
    const entities = await getEntities();

    const entity = entities[entityIdx];
    const bodyProps = entity.bodies[bodyIdx];
    const index = getBodyIndex(entity, bodyIdx);

    return await loadResource(ResourceName.BODY, index, bodyProps);
};

const getInventoryObjects = async (invIdx: number) => {
    return await loadResource(ResourceName.OBJECTS, invIdx);
};

const getModelsTexture = async () => {
    return await loadResource(ResourceName.BODY_TEXTURE);
};

// for ad-hoc usage only
// currently used in some Editor custom parsing
const getBricksHQR = async () => {
    return await loadResource(ResourceName.BRICKS);
};

const getBricks = async () => {
    const resource = await loadResource(ResourceName.BRICKS);
    const entriesPromise = [];
    for (let i = resource.first; i <= resource.last; i += 1) {
        entriesPromise.push(loadResource(ResourceName.BRICKS, i));
    }
    return await Promise.all(entriesPromise);
};

const getGrid = async (index: number, params: any) => {
    return await loadResource(ResourceName.GRIDS, index, params);
};

const getLibraries = async (index: number) => {
    return await loadResource(ResourceName.LIBRARIES, index);
};

const getIsland = async (name: string) => {
    return await loadResource(`${name}_ILE`);
};

const getIslandObjects = async (name: string) => {
    return await loadResource(`${name}_OBL`);
};

const getText = async (index: number) => {
    const { language } = getLanguageConfig();
    return await loadResource(ResourceName.TEXT, index, language);
};

const getScene = async (index: number) => {
    return await loadResource(ResourceName.SCENE, index);
};

const getSceneMap = async () => {
    return await loadResource(ResourceName.SCENE_MAP);
};

const getSamples = async () => {
    return await loadResource(ResourceName.SAMPLES);
};

const getSample = async (index: number, context: AudioContext) => {
    return await loadResource(ResourceName.SAMPLES, index, context);
};

const getVoices = async (textBankId) => {
    const textBank = `${textBankId}`;
    let resId = `VOICES_${(`000${textBank}`)
        .substring(0, 3 - textBank.length) + textBank}`;
    if (textBankId === -1) {
        resId = 'VOICES_GAM';
    }
    return await loadResource(resId);
};

const getMusic = async (index: number | string) => {
    if (typeof(index) === 'string') {
        return await loadResource(index);
    }
    if (index < 0) {
        return null;
    }
    return await loadResource(`MUSIC_SCENE_${index}`);
};

const getModelReplacements = async () => {
    return await loadResource(ResourceName.MODEL_REPLACEMENTS);
};

const releaseSamples = async () => {
    return await releaseResource(ResourceName.SAMPLES);
};

const releaseAnimations = async () => {
    return await releaseResource(ResourceName.ANIM);
};

const releaseModels = async () => {
    return await releaseResource(ResourceName.BODY);
};

const releaseLibraries = async () => {
    return await releaseResource(ResourceName.LIBRARIES);
};

const releaseGrids = async () => {
    return await releaseResource(ResourceName.GRIDS);
};

const releaseScenes = async () => {
    return await releaseResource(ResourceName.SCENE);
};

export {
    registerResources,
    preloadResources,
    getVideoPath,
    // helper functions
    getCommonResource,
    getPalette,
    getSprites,
    getSpritesClipInfo,
    getSpritesRaw,
    getSpritesRawClipInfo,
    getSpritesAnim3DSClipInfo,
    getEntities,
    getAnimations,
    getAnimationsSync,
    getModels,
    getModelsTexture,
    getBricks,
    getBricksHQR,
    getGrid,
    getLibraries,
    getIsland,
    getIslandObjects,
    getText,
    getScene,
    getSceneMap,
    getInventoryObjects,
    getSamples,
    getSample,
    getVoices,
    getMusic,
    getModelReplacements,
    // release assets
    releaseSamples,
    releaseAnimations,
    releaseModels,
    releaseLibraries,
    releaseGrids,
    releaseScenes,
};
