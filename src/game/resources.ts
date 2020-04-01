
import { getLanguageConfig } from '../lang';
import { getTextFile } from '../text';
import {
    registerStaticResource,
    registerTransientResource,
    ResourceType,
} from '../resources';

export const registerResources = {
    lba1: () => {
        const { language } = getLanguageConfig();

        registerStaticResource(ResourceType.ANIM, 'LBA1/ANIM.HQR');
        registerStaticResource(ResourceType.BODY, 'LBA1/BODY.HQR');
        registerStaticResource(ResourceType.RESS, 'LBA1/RESS.HQR');
        registerStaticResource(ResourceType.PALETTE, 'LBA1/RESS.HQR', 0);
        registerStaticResource(ResourceType.SAMPLES, 'LBA1/SAMPLES.HQR');
        registerStaticResource(ResourceType.SCENE, 'LBA1/SCENE.HQR');
        registerStaticResource(ResourceType.SPRITES, 'LBA1/SPRITES.HQR');
        registerStaticResource(ResourceType.TEXT, getTextFile(language));

        registerStaticResource(ResourceType.ENTITIES, 'LBA1/FILE3D.HQR');
        registerStaticResource(ResourceType.OBJECTS, 'LBA1/INVOBJ.HQR');
        registerStaticResource(ResourceType.BRICKS, 'LBA1/LBA_BRK.HQR');
        registerStaticResource(ResourceType.LAYOUTS, 'LBA1/LBA_BLL.HQR');
        registerStaticResource(ResourceType.GRIDS, 'LBA1/LBA_GRI.HQR');
        registerStaticResource(ResourceType.MUSIC, 'LBA1/MIDI_MI_WIN.HQR');
    },
    lba2: () => {
        const { language, languageVoice } = getLanguageConfig();

        registerStaticResource(ResourceType.ANIM, 'ANIM.HQR');
        registerStaticResource(ResourceType.BODY, 'BODY.HQR');
        registerStaticResource(ResourceType.RESS, 'RESS.HQR');
        registerStaticResource(ResourceType.ENTITIES, 'RESS.HQR', 44);
        registerStaticResource(ResourceType.PALETTE, 'RESS.HQR', 0);
        registerStaticResource(ResourceType.SAMPLES, 'SAMPLES_AAC.HQR.zip');
        registerStaticResource(ResourceType.SCENE, 'SCENE.HQR');
        registerStaticResource(ResourceType.SPRITES, 'SPRITES.HQR');
        registerStaticResource(ResourceType.SPRITERAW, 'SPRIRAW.HQR');
        registerStaticResource(ResourceType.TEXT, getTextFile(language));

        registerStaticResource(ResourceType.OBJECTS, 'OBJFIX.HQR');
        registerStaticResource(ResourceType.BRICKS, 'LBA_BKG.HQR');
        registerStaticResource(ResourceType.LAYOUTS, 'LBA_BKG.HQR');
        registerStaticResource(ResourceType.GRIDS, 'LBA_BKG.HQR');

        registerStaticResource(ResourceType.MENU_BACKGROUND,
            '../images/2_screen_menubg_extended.png');
        registerStaticResource(ResourceType.LOGO, '../images/remake_logo.png');

        registerStaticResource(ResourceType.THEME_ADELINE, 'MUSIC/LOGADPCM.mp4');
        registerStaticResource(ResourceType.THEME_MAIN, 'MUSIC/JADPCM15.mp4');
        registerStaticResource(ResourceType.THEME_MENU, 'MUSIC/Track6.mp4');

        registerStaticResource(ResourceType.VOICES_GAM,
            `VOX/${languageVoice.code}_GAM_AAC.VOX.zip`);
        registerStaticResource(ResourceType.VOICES_000,
            `VOX/${languageVoice.code}_000_AAC.VOX.zip`);

        // Transient resources
        registerTransientResource(ResourceType.VOICES_001,
            `VOX/${languageVoice.code}_001_AAC.VOX.zip`);
        registerTransientResource(ResourceType.VOICES_002,
            `VOX/${languageVoice.code}_002_AAC.VOX.zip`);
        registerTransientResource(ResourceType.VOICES_003,
            `VOX/${languageVoice.code}_003_AAC.VOX.zip`);
        registerTransientResource(ResourceType.VOICES_004,
            `VOX/${languageVoice.code}_004_AAC.VOX.zip`);
        registerTransientResource(ResourceType.VOICES_005,
            `VOX/${languageVoice.code}_005_AAC.VOX.zip`);
        registerTransientResource(ResourceType.VOICES_006,
            `VOX/${languageVoice.code}_006_AAC.VOX.zip`);
        registerTransientResource(ResourceType.VOICES_007,
            `VOX/${languageVoice.code}_007_AAC.VOX.zip`);
        registerTransientResource(ResourceType.VOICES_008,
            `VOX/${languageVoice.code}_008_AAC.VOX.zip`);
        registerTransientResource(ResourceType.VOICES_009,
            `VOX/${languageVoice.code}_009_AAC.VOX.zip`);
        registerTransientResource(ResourceType.VOICES_010,
            `VOX/${languageVoice.code}_010_AAC.VOX.zip`);
        registerTransientResource(ResourceType.VOICES_011,
            `VOX/${languageVoice.code}_010_AAC.VOX.zip`);

        registerTransientResource(ResourceType.ASCENCE_ILE,  'ASCENCE.ILE');
        registerTransientResource(ResourceType.ASCENCE_OBL,  'ASCENCE.OBL');
        registerTransientResource(ResourceType.CELEBRA2_ILE, 'CELEBRA2.ILE');
        registerTransientResource(ResourceType.CELEBRA2_OBL, 'CELEBRA2.OBL');
        registerTransientResource(ResourceType.CELEBRAT_ILE, 'CELEBRAT.ILE');
        registerTransientResource(ResourceType.CELEBRAT_OBL, 'CELEBRAT.OBL');
        registerTransientResource(ResourceType.CITABAU_ILE,  'CITABAU.ILE');
        registerTransientResource(ResourceType.CITABAU_OBL,  'CITABAU.OBL');
        registerTransientResource(ResourceType.CITADEL_ILE,  'CITADEL.ILE');
        registerTransientResource(ResourceType.CITADEL_OBL,  'CITADEL.OBL');
        registerTransientResource(ResourceType.DESERT_ILE,   'DESERT.ILE');
        registerTransientResource(ResourceType.DESERT_OBL,   'DESERT.OBL');
        registerTransientResource(ResourceType.EMERAUDE_ILE, 'EMERAUDE.ILE');
        registerTransientResource(ResourceType.EMERAUDE_OBL, 'EMERAUDE.OBL');
        registerTransientResource(ResourceType.ILOTCX_ILE,   'ILOTCX.ILE');
        registerTransientResource(ResourceType.ILOTCX_OBL,   'ILOTCX.OBL');
        registerTransientResource(ResourceType.KNARTAS_ILE,  'KNARTAS.ILE');
        registerTransientResource(ResourceType.KNARTAS_OBL,  'KNARTAS.OBL');
        registerTransientResource(ResourceType.MOON_ILE,     'MOON.ILE');
        registerTransientResource(ResourceType.MOON_OBL,     'MOON.OBL');
        registerTransientResource(ResourceType.MOSQUIBE_ILE, 'MOSQUIBE.ILE');
        registerTransientResource(ResourceType.MOSQUIBE_OBL, 'MOSQUIBE.OBL');
        registerTransientResource(ResourceType.OTRINGAL_ILE, 'OTRINGAL.ILE');
        registerTransientResource(ResourceType.OTRINGAL_OBL, 'OTRINGAL.OBL');
        registerTransientResource(ResourceType.PLATFORM_ILE, 'PLATFORM.ILE');
        registerTransientResource(ResourceType.PLATFORM_OBL, 'PLATFORM.OBL');
        registerTransientResource(ResourceType.SOUSCELB_ILE, 'SOUSCELB.ILE');
        registerTransientResource(ResourceType.SOUSCELB_OBL, 'SOUSCELB.OBL');

        registerTransientResource(ResourceType.VIDEO_ASCENSEU, 'VIDEO/VIDEO01.mp4');
        registerTransientResource(ResourceType.VIDEO_ASRETOUR, 'VIDEO/VIDEO02.mp4');
        registerTransientResource(ResourceType.VIDEO_BALDINO,  'VIDEO/VIDEO03.mp4');
        registerTransientResource(ResourceType.VIDEO_BOAT1,    'VIDEO/VIDEO04.mp4');
        registerTransientResource(ResourceType.VIDEO_BOAT2,    'VIDEO/VIDEO05.mp4');
        registerTransientResource(ResourceType.VIDEO_BOAT3,    'VIDEO/VIDEO06.mp4');
        registerTransientResource(ResourceType.VIDEO_BOAT4,    'VIDEO/VIDEO07.mp4');
        registerTransientResource(ResourceType.VIDEO_BU,       'VIDEO/VIDEO08.mp4');
        registerTransientResource(ResourceType.VIDEO_CRASH,    'VIDEO/VIDEO09.mp4');
        registerTransientResource(ResourceType.VIDEO_DARK,     'VIDEO/VIDEO10.mp4');
        registerTransientResource(ResourceType.VIDEO_DELUGE,   'VIDEO/VIDEO11.mp4');
        registerTransientResource(ResourceType.VIDEO_END,      'VIDEO/VIDEO12.mp4');
        registerTransientResource(ResourceType.VIDEO_END2,     'VIDEO/VIDEO13.mp4');
        registerTransientResource(ResourceType.VIDEO_ENFA,     'VIDEO/VIDEO14.mp4');
        registerTransientResource(ResourceType.VIDEO_FRAGMENT, 'VIDEO/VIDEO15.mp4');
        registerTransientResource(ResourceType.VIDEO_GROTTE,   'VIDEO/VIDEO16.mp4');
        registerTransientResource(ResourceType.VIDEO_INTRO,    'VIDEO/VIDEO17_EN.mp4');
        registerTransientResource(
            ResourceType[`VIDEO_INTRO_${languageVoice.code}`],
            `VIDEO/VIDEO17_${languageVoice.code}.mp4`
        );
        registerTransientResource(ResourceType.VIDEO_LUNES1,  'VIDEO/VIDEO18.mp4');
        registerTransientResource(ResourceType.VIDEO_LUNES2,  'VIDEO/VIDEO19.mp4');
        registerTransientResource(ResourceType.VIDEO_MONTCH,  'VIDEO/VIDEO20.mp4');
        registerTransientResource(ResourceType.VIDEO_MOON,    'VIDEO/VIDEO21.mp4');
        registerTransientResource(ResourceType.VIDEO_PASSEUR, 'VIDEO/VIDEO22.mp4');
        registerTransientResource(ResourceType.VIDEO_PUB1,    'VIDEO/VIDEO23.mp4');
        registerTransientResource(ResourceType.VIDEO_PUB2,    'VIDEO/VIDEO24.mp4');
        registerTransientResource(ResourceType.VIDEO_PUB3,    'VIDEO/VIDEO25.mp4');
        registerTransientResource(ResourceType.VIDEO_PUB4A6,  'VIDEO/VIDEO26.mp4');
        registerTransientResource(ResourceType.VIDEO_SENDELL, 'VIDEO/VIDEO27.mp4');
        registerTransientResource(ResourceType.VIDEO_SORT,    'VIDEO/VIDEO28.mp4');
        registerTransientResource(ResourceType.VIDEO_SURSAUT, 'VIDEO/VIDEO29.mp4');
        registerTransientResource(ResourceType.VIDEO_TAXI,    'VIDEO/VIDEO30.mp4');
        registerTransientResource(ResourceType.VIDEO_TAXI_J,  'VIDEO/VIDEO31.mp4');
        registerTransientResource(ResourceType.VIDEO_VOYAGEZ, 'VIDEO/VIDEO32.mp4');
        registerTransientResource(ResourceType.VIDEO_ZEELP,   'VIDEO/VIDEO33.mp4');
        registerTransientResource(ResourceType.VIDEO_BABY,    'VIDEO/VIDEO34.mp4');

        registerTransientResource(ResourceType.MUSIC_SCENE_0,  'MUSIC/TADPCM1.mp4');
        registerTransientResource(ResourceType.MUSIC_SCENE_1,  'MUSIC/TADPCM2.mp4');
        registerTransientResource(ResourceType.MUSIC_SCENE_2,  'MUSIC/TADPCM3.mp4');
        registerTransientResource(ResourceType.MUSIC_SCENE_3,  'MUSIC/TADPCM4.mp4');
        registerTransientResource(ResourceType.MUSIC_SCENE_4,  'MUSIC/TADPCM5.mp4');
        registerTransientResource(ResourceType.MUSIC_SCENE_5,  'MUSIC/JADPCM01.mp4');
        registerTransientResource(ResourceType.MUSIC_SCENE_6,  'MUSIC/Track6.mp4');
        registerTransientResource(ResourceType.MUSIC_SCENE_7,  'MUSIC/JADPCM02.mp4');
        registerTransientResource(ResourceType.MUSIC_SCENE_8,  'MUSIC/JADPCM03.mp4');
        registerTransientResource(ResourceType.MUSIC_SCENE_9,  'MUSIC/JADPCM04.mp4');
        registerTransientResource(ResourceType.MUSIC_SCENE_10, 'MUSIC/JADPCM05.mp4');
        registerTransientResource(ResourceType.MUSIC_SCENE_11, 'MUSIC/JADPCM06.mp4');
        registerTransientResource(ResourceType.MUSIC_SCENE_12, 'MUSIC/JADPCM07.mp4');
        registerTransientResource(ResourceType.MUSIC_SCENE_13, 'MUSIC/JADPCM08.mp4');
        registerTransientResource(ResourceType.MUSIC_SCENE_14, 'MUSIC/JADPCM09.mp4');
        registerTransientResource(ResourceType.MUSIC_SCENE_15, 'MUSIC/JADPCM10.mp4');
        registerTransientResource(ResourceType.MUSIC_SCENE_16, 'MUSIC/JADPCM11.mp4');
        registerTransientResource(ResourceType.MUSIC_SCENE_17, 'MUSIC/JADPCM12.mp4');
        registerTransientResource(ResourceType.MUSIC_SCENE_18, 'MUSIC/JADPCM13.mp4');
        registerTransientResource(ResourceType.MUSIC_SCENE_19, 'MUSIC/JADPCM14.mp4');
        registerTransientResource(ResourceType.MUSIC_SCENE_20, 'MUSIC/JADPCM15.mp4');
        registerTransientResource(ResourceType.MUSIC_SCENE_21, 'MUSIC/JADPCM16.mp4');
        registerTransientResource(ResourceType.MUSIC_SCENE_22, 'MUSIC/JADPCM17.mp4');
        registerTransientResource(ResourceType.MUSIC_SCENE_23, 'MUSIC/JADPCM18.mp4');
        registerTransientResource(ResourceType.MUSIC_SCENE_24, 'MUSIC/LOGADPCM.mp4');
    },
};
