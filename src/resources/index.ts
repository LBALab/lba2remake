import {
    ResourceName,
    preloadResources,
    loadResource,
    getResourcePath,
    registerResources,
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
    return await loadResource(ResourceName.SPRITES);
};

const getSpritesRaw = async () => {
    return await loadResource(ResourceName.SPRITERAW);
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

const getBricks = async () => {
    return await loadResource(ResourceName.BRICKS);
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

const getScene = async () => {
    return await loadResource(ResourceName.SCENE);
};

const getSamples = async () => {
    return await loadResource(ResourceName.SAMPLES);
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

const getMusic = async (index: number) => {
    if (index < 0) {
        return null;
    }
    return await loadResource(`MUSIC_SCENE_${index}`);
};

export {
    registerResources,
    preloadResources,
    getVideoPath,
    // helper functions
    getCommonResource,
    getPalette,
    getSprites,
    getSpritesRaw,
    getEntities,
    getAnimations,
    getModels,
    getModelsTexture,
    getBricks,
    getIsland,
    getIslandObjects,
    getText,
    getScene,
    getInventoryObjects,
    getSamples,
    getVoices,
    getMusic,
};
