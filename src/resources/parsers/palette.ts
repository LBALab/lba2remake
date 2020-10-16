import { Resource } from '../load';

const parsePalette = async (resource: Resource) => {
    return resource.getBufferUint8();
};

export { parsePalette };
