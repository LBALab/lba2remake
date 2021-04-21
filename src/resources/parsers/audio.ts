import { Resource } from '../load';

export const parseAudio = async (resource: Resource, index: number, context) => {
    const buffer = await resource.getEntryAsync(index);
    try {
        return await context.decodeAudioData(buffer);
    } catch (err) {
        // tslint:disable-next-line: no-console
        console.error(`Failed to parse audio, entry=${index}:`, err);
    }
};
