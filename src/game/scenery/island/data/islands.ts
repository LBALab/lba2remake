import environments, { EnvInfo } from './environments';

export interface IslandProps {
    name: string;
    envInfo: EnvInfo;
    startPosition: [number, number];
}

const islandProps: Record<string, IslandProps> = {
    CITADEL: {
        name: 'CITADEL',
        envInfo: environments.TWINSUN_RAIN,
        startPosition: [
            0,
            1
        ]
    },
    CITABAU: {
        name: 'CITABAU',
        envInfo: environments.TWINSUN_SUNNY,
        startPosition: [
            0,
            1
        ]
    },
    DESERT: {
        name: 'DESERT',
        envInfo: environments.TWINSUN_SUNNY,
        startPosition: [
            0.8,
            1.7
        ]
    },
    EMERAUDE: {
        name: 'EMERAUDE',
        envInfo: environments.MOON,
        startPosition: [
            1.4,
            0.5
        ]
    },
    OTRINGAL: {
        name: 'OTRINGAL',
        envInfo: environments.ZEELISH,
        startPosition: [
            0.8,
            -1.2
        ]
    },
    KNARTAS: {
        name: 'KNARTAS',
        envInfo: environments.ZEELISH,
        startPosition: [
            1,
            0.8
        ]
    },
    ILOTCX: {
        name: 'ILOTCX',
        envInfo: environments.ZEELISH,
        startPosition: [
            3.3,
            -1.2
        ]
    },
    CELEBRAT: {
        name: 'CELEBRAT',
        envInfo: environments.ZEELISH,
        startPosition: [
            3.1,
            -1.4
        ]
    },
    CELEBRA2: {
        name: 'CELEBRA2',
        envInfo: environments.ZEELISH,
        startPosition: [
            3.1,
            -1.4
        ]
    },
    ASCENCE: {
        name: 'ASCENCE',
        envInfo: environments.ZEELISH,
        startPosition: [
            2.5,
            -1.1
        ]
    },
    MOSQUIBE: {
        name: 'MOSQUIBE',
        envInfo: environments.UNDERGAS,
        startPosition: [
            0.75,
            1.24
        ]
    },
    PLATFORM: {
        name: 'PLATFORM',
        envInfo: environments.UNDERGAS,
        startPosition: [
            1.78,
            1.47
        ]
    },
    SOUSCELB: {
        name: 'SOUSCELB',
        envInfo: environments.UNDERGAS,
        startPosition: [
            1.39,
            1.1
        ]
    }
};

export default islandProps;
