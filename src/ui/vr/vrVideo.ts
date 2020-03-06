import * as THREE from 'three';

export function createVideoScreen(video) {
    const videoElem = document.createElement('video');
    videoElem.src = video.src;
    videoElem.autoplay = true;
    videoElem.onended = video.onEnded;
    videoElem.onerror = video.onEnded;

    const density = 512;
    const texture = new THREE.VideoTexture(videoElem);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBFormat;
    texture.encoding = THREE.GammaEncoding;

    const geometry = new THREE.PlaneBufferGeometry(640 / density, 480 / density);
    const material = new THREE.MeshBasicMaterial({
        map: texture
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 0, 768 / density);
    mesh.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);

    return {
        mesh,
        videoElem
    };
}
