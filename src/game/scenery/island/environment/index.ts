import Sea from './Sea';
import Clouds from './Clouds';
import Rain from './Rain';
import Lightning from './Lightning';
import Stars from './Stars';

export function loadEnvironmentComponents(
    data,
    envInfo,
    physics,
    layout,
    { usedTiles },
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
        components.push(new Sea(sea, data, envInfo, usedTiles, layout));
    }
    if (groundClouds) {
        components.push(new Clouds(groundClouds, data, envInfo));
    }
    if (clouds && !options.preview) {
        components.push(new Clouds(clouds, data, envInfo));
    }
    if (rain && !options.preview) {
        components.push(new Rain(rain));
    }
    if (lightning && !options.preview) {
        components.push(new Lightning(lightning, physics));
    }
    if (stars && !options.preview) {
        components.push(new Stars(stars));
    }
    return components;
}
