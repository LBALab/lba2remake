import VideoData from '../video/data';
import { getLanguageConfig } from '../lang';
import path from 'path';

export const getIntroVideoSrc = () => {
        const src = VideoData.VIDEO.find(v => v.name === 'INTRO').file;
        const voice = getLanguageConfig().languageVoice.code;
        const ext = path.extname(src);
        return `${path.dirname(src)}/${path.basename(src, ext)}_${voice}${ext}`;
};
