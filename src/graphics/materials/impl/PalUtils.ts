import { getPalette } from '../../../resources';
import { loadPaletteTexture } from '../../../texture';

export let paletteUniform = {
    value: null
};

let loading = false;

export async function registerPalette() {
    if (loading) {
        return;
    }
    loading = true;
    const palette = await getPalette();
    paletteUniform.value = await loadPaletteTexture(palette);
}
