import { Resource } from '../load';

const parsePalette = (resource: Resource) => {
    return resource.getBufferUint8();
};

export { parsePalette };
