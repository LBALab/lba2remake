import { Resource } from '../load';

const parseSceneMap = (resource: Resource, index: number) => {
    const buffer = resource.getEntry(index);
    const data = new DataView(buffer);
    let offset = 0;
    const map = [];

    while (true) {
        const opcode = data.getUint8(offset);
        const sceneIndex = data.getUint8(offset + 1);
        offset += 2;
        if (opcode === 0) {
            break;
        }

        map.push({
            isIsland: opcode === 2,
            index: sceneIndex,
        });
    }
    return map;
};

export { parseSceneMap };
