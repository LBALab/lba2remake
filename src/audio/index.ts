import { createMusicSource } from './music';
import { createVoiceSource } from './voice';
import { createSampleSource } from './sample';

declare global {
    interface Window {
        AudioContext?: any;
        webkitAudioContext?: any;
    }
}

const MUSIC_THEME = 6;
const samples = {};

function createAudioContext() {
    window.AudioContext = window.AudioContext || window.webkitAudioContext; // needed for Safari
    return new AudioContext();
}

export function createAudioManager(state) {
    const context = createAudioContext();
    const menuContext = createAudioContext();

    const isActive = (ctx: AudioContext) => ctx.state === 'running';

    const musicSource = createMusicSource(context);
    const menuMusicSource = createMusicSource(menuContext);
    const voiceSource = createVoiceSource(context);

    // tune volumes
    musicSource.setVolume(state.config.musicVolume);
    menuMusicSource.setVolume(state.config.musicVolume);
    voiceSource.setVolume(state.config.voiceVolume);

    return {
        // music
        playMusic: (index: number) => {
            if (!musicSource.isPlaying()) {
                musicSource.play(index);
            }
        },
        playMusicTheme: () => {
            if (!menuMusicSource.isPlaying()) {
                menuMusicSource.play(MUSIC_THEME);
            }
        },
        isPlayingMusic: () => {
            return musicSource.isPlaying();
        },
        stopMusic: () => {
            musicSource.stop();
        },
        stopMusicTheme: () => {
            menuMusicSource.stop();
        },
        preloadMusicTheme: async () => {
            await menuMusicSource.preload(MUSIC_THEME);
        },
        resumeMusicTheme: () => {
            menuMusicSource.resume();
        },

        // voice
        playVoice: (index: number, textBankId: number, onEndedCallback = null) => {
            voiceSource.play(index, textBankId, onEndedCallback);
        },
        stopVoice: () => {
            voiceSource.stop();
        },

        // samples
        playSample: (index: number, frequency: number = 0x1000, loopCount: number = 0) => {
            const sampleSource = createSampleSource(context);
            sampleSource.setVolume(state.config.soundFxVolume);
            sampleSource.play(index, frequency, loopCount);
            samples[index] = sampleSource;
            return sampleSource;
        },
        isPlayingSample: (index: number) => {
            const sampleSource = samples[index];
            if (sampleSource) {
                return sampleSource.isPlaying();
            }
            return false;
        },
        stopSample: (index: number) => {
            const sampleSource = samples[index];
            if (sampleSource) {
                sampleSource.stop();
            }
        },
        stopSamples: () => {
            Object.keys(samples).forEach((index: string) => {
                const sampleSource = samples[index];
                if (sampleSource) {
                    sampleSource.stop();
                }
            });
        },

        // shared
        pause: () => {
            Object.keys(samples).forEach((index: string) => {
                const sampleSource = samples[index];
                if (sampleSource) {
                    sampleSource.pause();
                }
            });
            voiceSource.pause();
            musicSource.pause();
        },
        resume: () => {
            musicSource.resume();
            voiceSource.resume();
            Object.keys(samples).forEach((index: string) => {
                const sampleSource = samples[index];
                if (sampleSource) {
                    sampleSource.resume();
                }
            });
        },
        resumeContext: () => {
            context.resume();
            menuContext.resume();
        },
        isContextActive: () => {
            return isActive(context) && isActive(menuContext);
        }
    };
}
