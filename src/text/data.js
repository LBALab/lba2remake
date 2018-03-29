const DEFAULT_CHARMAP = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
    16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31,
    32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47,
    48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63,
    64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79,
    80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95,
    96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111,
    112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127,
    199, 252, 233, 226, 228, 224, 134, 231, 234, 235, 232, 239, 238, 236, 196, 143,
    201, 230, 198, 244, 246, 242, 251, 249, 255, 214, 220, 155, 163, 157, 158, 159,
    225, 237, 243, 250, 241, 209, 166, 167, 191, 169, 170, 171, 172, 161, 174, 175,
    227, 245, 178, 179, 156, 140, 192, 195, 213, 185, 248, 187, 188, 169, 167, 153,
    192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207,
    208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223,
    224, 223, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239,
    240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254, 255
];

/* eslint-disable key-spacing,no-multi-spaces */
export default {
    LANGUAGE: [
        { index: 0, name:'English',   code: 'EN',  culture: 'en-GB', charmap: DEFAULT_CHARMAP, hasVoice: true },
        { index: 1, name:'Français',  code: 'FR',  culture: 'fr-FR', charmap: DEFAULT_CHARMAP, hasVoice: true },
        { index: 2, name:'Deutsch',   code: 'DE',  culture: 'de-DE', charmap: DEFAULT_CHARMAP, hasVoice: true },
        { index: 3, name:'Español',   code: 'SP',  culture: 'es-ES', charmap: DEFAULT_CHARMAP, hasVoice: false },
        { index: 4, name:'Italiano',  code: 'IT',  culture: 'it-IT', charmap: DEFAULT_CHARMAP, hasVoice: false },
        { index: 5, name:'Português', code: 'PO',  culture: 'pt-PT', charmap: DEFAULT_CHARMAP, hasVoice: false },
        { index: 0, name:'Magyar',    code: 'HUN', culture: 'hu-HU', charmap: DEFAULT_CHARMAP, hasVoice: false, isFan: true, author: 'Gergely' }
    ]
};
