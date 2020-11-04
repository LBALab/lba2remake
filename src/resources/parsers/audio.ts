import { Resource } from '../load';

export const parseAudio = async (resource: Resource, index: number, context) => {
    const buffer = await resource.getEntryAsync(index);
    return await context.decodeAudioData(buffer);
};
