import { getPalette } from '..';
import { Resource } from '../load';
import { loadTexture } from '../../texture';

const parseTexture = async (resource: Resource) => {
    const buffer = resource.getBuffer();
    const palette = await getPalette();
    return loadTexture(buffer, palette, false);
};

export { parseTexture };
