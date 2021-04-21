import { saveAs } from 'file-saver';

let expCanvas;
let expCtx;

export async function saveTexture(texture, filename) {
    const data = await textureToPNG(texture);
    const blob = new Blob([data], {type: 'image/png;charset=utf-8'});
    saveAs(blob, filename);
}

export async function textureToPNG(texture) {
    const image = await extractImageFromTexture(texture);
    expCanvas = expCanvas || document.createElement('canvas');
    expCtx = expCtx || expCanvas.getContext('2d');

    expCanvas.width = (image as any).naturalWidth;
    expCanvas.height = (image as any).naturalHeight;

    expCtx.drawImage(image, 0, 0);

    // Get the base64 encoded data
    const base64data = expCanvas
        .toDataURL('image/png', 1)
        .replace(/^data:image\/png;base64,/, '');

    // Convert to a uint8 array
    return base64ToBuffer(base64data);
}

export async function convertTextureForExport(texture, index) {
    const newTexture = texture.clone();
    newTexture.image = await extractImageFromTexture(texture);
    newTexture.name = `library_${index}`;
    return newTexture;
}

async function extractImageFromTexture(texture) {
    const {width, height, data: image_data} = texture.image;
    const arr = new Uint8ClampedArray(width * height * 4);
    for (let i = 0; i < arr.length; i += 1) {
        arr[i] = image_data[i];
    }
    const imageData = new ImageData(arr, width, height);
    const img = await createImageBitmap(imageData);
    (img as any).naturalWidth = width;
    (img as any).naturalHeight = height;
    return img;
}

function base64ToBuffer(str) {
    const b = atob(str);
    const buf = new Uint8Array(b.length);

    for (let i = 0, l = buf.length; i < l; i += 1) {
        buf[i] = b.charCodeAt(i);
    }

    return buf;
}
