import {
    ResourceName,
    preloadResources,
    loadResource,
    getResourcePath,
    registerResources,
}  from './load';

const getVideoPath = (video: string) => {
    return getResourcePath(`VIDEO_${video}`);
};

export {
    ResourceName,
    preloadResources,
    loadResource,
    getVideoPath,
    registerResources,
};
