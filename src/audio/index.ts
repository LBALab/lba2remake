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
const samples = [];

function createAudioContext() {
    window.AudioContext = window.AudioContext || window.webkitAudioContext; // needed for Safari
    return new AudioContext();
}

export function createAudioManager(state) {
    const context = createAudioContext();
    const menuContext = createAudioContext();

    const musicSource = createMusicSource(context);
    const menuMusicSource = createMusicSource(menuContext);
    const voiceSource = createVoiceSource(context);
    const sampleSource = createSampleSource(context);

    // tune volumes
    musicSource.setVolume(state.config.musicVolume);
    menuMusicSource.setVolume(state.config.musicVolume);
    voiceSource.setVolume(state.config.voiceVolume);
    sampleSource.setVolume(state.config.soundFxVolume);

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

        // voice
        playVoice: (index: number, textBankId: number, onEndedCallback = null) => {
            voiceSource.play(index, textBankId, onEndedCallback);
        },
        stopVoice: () => {
            voiceSource.stop();
        },

        // samples
        playSample: (index: number) => {
            sampleSource.play(index);
            samples.push(index);
        },
        isPlayingSample: () => { // index: number
            return sampleSource.isPlaying();
        },
        stopSample: () => { // index: number
            sampleSource.stop();
        },
        stopSamples: () => {
            sampleSource.stop();
        },
        setVolumeSample: (vol: number) => {
            sampleSource.setVolume(vol);
        },

        // shared
        pause: () => {
            sampleSource.pause();
            voiceSource.pause();
            musicSource.pause();
        },
        resume: () => {
            musicSource.resume();
            voiceSource.resume();
            sampleSource.resume();
        },
    };
}
