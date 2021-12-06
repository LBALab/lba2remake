import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { getParams } from '../../params';
import Renderer from '../../renderer';

// Inspired by https://github.com/Kitware/VTK/blob/master/Filters/General/vtkSphericalHarmonics.cxx
export function equirectangularTextureToLightProbe(texture: THREE.DataTexture) {
    const { width, height, data } = texture.image;
    const solidAngle = 2.0 * Math.PI * Math.PI / (width * height);
    let totalWeight = 0;
    const harmonics = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];
    let numComponents;
    switch (texture.format) {
        case THREE.RGBFormat:
            numComponents = 3;
            break;
        case THREE.RGBAFormat:
            numComponents = 4;
            break;
        default:
            throw new Error(`Unsupported texture format: ${texture.format}`);
    }

    for (let tY = 0; tY < height; tY += 1) {
        const tfY = texture.flipY ? tY : height - tY - 1;
        const theta = ((tfY + 0.5) / height) * Math.PI;
        const ct = Math.cos(theta);
        const st = Math.sin(theta);
        const weight = solidAngle * st;

        for (let tX = 0; tX < width; tX += 1) {
            const tfX = width - tX - 1;
            const phi = (((tfX + 0.5) / width) * 2) * Math.PI;
            const cp = Math.cos(phi);
            const sp = Math.sin(phi);

            // conversion to cartesian coordinates
            const n = [st * cp, -ct, st * sp];

            const basis = [
                0.282095,
                -0.488603 * n[1],
                0.488603 * n[2],
                -0.488603 * n[0],
                1.092548 * n[0] * n[1],
                -1.092548 * n[1] * n[2],
                0.315392 * (3.0 * n[2] * n[2] - 1.0),
                -1.092548 * n[0] * n[2],
                0.546274 * (n[0] * n[0] - n[1] * n[1])
            ];

            totalWeight += weight;

            // in case we have an alpha channel, we ignore it
            for (let k = 0; k < 3; k += 1) {
                const idx = (tY * width + tX) * numComponents + k;
                const v = data[idx];

                // TODO: colorspace conversion when not using float textures

                const compSH = harmonics[k];

                for (let y = 0; y < 9; y += 1) {
                    compSH[y] += weight * v * basis[y];
                }
            }
        }
    }
    const norm = (4 * Math.PI) / totalWeight;

    const sh = new THREE.SphericalHarmonics3();
    const shCoefficients = sh.coefficients;
    for (let i = 0; i < 9; i += 1) {
        shCoefficients[i].set(
            harmonics[0][i] * norm,
            harmonics[1][i] * norm,
            harmonics[2][i] * norm
        );
    }

    return new THREE.LightProbe(sh);
}

const loader = new RGBELoader();
loader.setDataType(THREE.FloatType);

async function loadHDREnvImpl(renderer: Renderer, url: string, intensity: number = 1) {
    const texture = await loader.loadAsync(url);
    const pmremGenerator = new THREE.PMREMGenerator(renderer.threeRenderer);
    pmremGenerator.compileEquirectangularShader();
    const exrCubeRenderTarget = pmremGenerator.fromEquirectangular(texture);

    const lightProbe = equirectangularTextureToLightProbe(texture);
    lightProbe.intensity = intensity;
    texture.dispose();

    return {
        texture: exrCubeRenderTarget.texture,
        lightProbe
    };
}

export async function loadHDREnv(renderer: Renderer) {
    const { hdrEnv } = getParams();
    const [env, intensity] = hdrEnv.split(':');
    return loadHDREnvImpl(
        renderer,
        `data/hdr/${env}.hdr`,
        intensity !== undefined ? parseFloat(intensity) : 1
    );
}
