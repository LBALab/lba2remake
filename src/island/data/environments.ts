export default {
    TWINSUN_RAIN: {
        index: 11,
        skyColor: [0.02, 0.02, 0.01],
        skyOpacity: 0.5,
        fogDensity: 0.8,
        scale: 1.0,
        rain: { count: 5000 },
        clouds: { speed: 0.04 },
        lightning: {
            intensity: 1,
            frequency: 0.3
        },
        sea: {}
    },
    TWINSUN_SUNNY: {
        index: 13,
        skyColor: [0.51, 0.71, 0.84],
        skyOpacity: 1.0,
        fogDensity: 0.12,
        scale: 2.0,
        clouds: {
            speed: 0.02,
            whiteness: 1,
            opacity: 0.1
        },
        sea: {}
    },
    MOON: {
        index: 14,
        skyColor: [0.0, 0.0, 0.0],
        skyOpacity: 1.0,
        fogDensity: 0,
        scale: 128.0,
        stars: {
            count: 10000
        }
    },
    ZEELISH: {
        index: 16,
        skyColor: [0.45, 0.41, 0.48],
        skyOpacity: 0.75,
        fogDensity: 0.4,
        scale: 1.0,
        clouds: { speed: 0.04 },
        groundClouds: {
            speed: -0.02,
            ground: true,
            whiteness: 0.5,
            scale: 64.0
        }
    },
    UNDERGAS: {
        index: 17,
        skyColor: [0.44, 0.0, 0.0],
        skyOpacity: 0.2,
        skyHeight: 35,
        fogDensity: 0.45,
        scale: 1.0,
        clouds: { speed: 0.1 },
        lightning: {
            intensity: 0.1,
            frequency: 0.7
        },
        sea: {}
    }
};
