import { Resource } from '../load';
import { parseText } from './text2';

export const parseTextLBA1 = (resource: Resource, index: number, language: any) => {
    const languageIndex = index + (28 * language.index);
    return parseText(resource, languageIndex, language, 0);
};
