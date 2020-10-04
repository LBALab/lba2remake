import { getPalette } from '..';
import { Resource } from '../load';
import { loadTextureRGBA } from '../../texture';

const parseTextureRGBA = async (resource: Resource) => {
    const buffer = resource.getBuffer();
    const palette = await getPalette();
    return loadTextureRGBA(buffer, palette);
};

export { parseTextureRGBA };
