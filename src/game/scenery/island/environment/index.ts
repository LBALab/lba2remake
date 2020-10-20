import { loadSea } from './sea';
import { loadClouds } from './clouds';
import { loadRain } from './rain';
import { loadLightning } from './lightning';
import { loadStars } from './stars';

export function loadEnvironmentComponents(
    data,
    envInfo,
    physics,
    layout,
    { usedTiles, meshes },
    options
) {
    const components = [];
    const {
        sea,
        groundClouds,
        clouds,
        rain,
        lightning,
        stars
    } = envInfo;

    if (sea) {
        components.push(loadSea(sea, {
            layout,
            usedTiles,
            envInfo,
            ress: data.ress,
            palette: data.palette,
            ambience: data.ambience
        }));
    }
    if (groundClouds) {
        components.push(loadClouds(groundClouds, {
            envInfo,
            ress: data.ress,
            palette: data.palette,
            smokeTexture: data.smokeTexture
        }));
    }

    if (clouds && !options.preview) {
        components.push(loadClouds(envInfo.clouds, {
            envInfo,
            ress: data.ress,
            palette: data.palette,
            smokeTexture: data.smokeTexture
        }));
    }

    if (rain && !options.preview) {
        components.push(loadRain(envInfo.rain));
    }
    if (lightning && !options.preview) {
        components.push(loadLightning(envInfo.lightning, physics, meshes));
    }
    if (stars && !options.preview) {
        components.push(loadStars(envInfo.stars));
    }
    return components;
}
