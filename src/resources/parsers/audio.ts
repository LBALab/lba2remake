import { Resource } from '../load';

export const parseAudio = async (resource: Resource, index: number, context) => {
    const buffer = resource.getEntry(index);
    try {
        return await context.decodeAudioData(buffer.slice(0));
    } catch (err) {
        // tslint:disable-next-line: no-console
        console.error(`Failed to parse audio, entry=${index}:`, err);
    }
};
