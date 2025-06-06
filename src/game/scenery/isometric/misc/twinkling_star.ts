import * as THREE from 'three';
import STAR_VERT from './shaders/star_twinkle.vert.glsl';
import STAR_FRAG from './shaders/star_twinkle.frag.glsl';

const loader = new THREE.TextureLoader();

/**
 * Create a twinkling star effect at a given position.
 * Returns an object with the star's Three.js mesh and an update function.
 */
export async function createTwinklingStar(
    position: THREE.Vector3,
    color: number | string | THREE.Color,
    size = 1.0,
    speed = 1.5
) {
    // Load star texture (with alpha channel for transparency)
    const starTexture = await new Promise<THREE.Texture>((resolve) => {
        loader.load('images/stars/B_OPC1.png', resolve);
    });

    // Create a RawShaderMaterial for the star using custom shaders
    const starMaterial = new THREE.RawShaderMaterial({
        vertexShader: STAR_VERT,
        fragmentShader: STAR_FRAG,
        uniforms: {
            starTex: { value: starTexture },
            uColor:  { value: new THREE.Color(color) },
            time:    { value: 0.0 },
            uSpeed:  { value: speed }
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.FrontSide
    });

    // Define star geometry as a quad (two triangles at the given position)
    const starGeo = new THREE.BufferGeometry();
    const positions: number[]   = [];
    const uvs: number[]         = [];
    const intensities: number[] = [];
    const sizes: number[]       = [];
    const sparkles: number[]    = [];

    // Base attributes for the star
    const baseIntensity = 0.4;         // base brightness intensity
    const baseSize      = 0.1 * size;  // base sprite size in world units
    const baseSparkle   = 0.7;         // base sparkle variation factor

    // Add 6 vertices at the star position (two triangles forming a quad)
    for (let j = 0; j < 6; j += 1) {
        positions.push(position.x, position.y, position.z);
        intensities.push(baseIntensity);
        sizes.push(baseSize);
        sparkles.push(baseSparkle);
    }
    // Set UV coordinates for the two triangles (covering the full texture)
    uvs.push(
        0, 0,
        0, 1,
        1, 0,
        1, 1,
        1, 0,
        0, 1
    );

    starGeo.setAttribute('position',  new THREE.Float32BufferAttribute(positions, 3));
    starGeo.setAttribute('uv',        new THREE.Float32BufferAttribute(uvs, 2));
    starGeo.setAttribute('intensity', new THREE.Float32BufferAttribute(intensities, 1));
    starGeo.setAttribute('size',      new THREE.Float32BufferAttribute(sizes, 1));
    starGeo.setAttribute('sparkle',   new THREE.Float32BufferAttribute(sparkles, 1));
    // Set the index buffer to form two triangles (0-1-2 and 3-4-5)
    starGeo.setIndex([5, 4, 3,  2, 1, 0]);

    // Create the star mesh with its geometry and material
    const starMesh = new THREE.Mesh(starGeo, starMaterial);
    starMesh.name = 'twinkling_star';
    starMesh.frustumCulled = false;  // always render (disable frustum culling)
    starMesh.renderOrder = 2;       // draw after scene objects to avoid overlap

    // Return the Three.js mesh and an update function for the twinkle animation
    return {
        threeObject: starMesh,
        update: (time: { elapsed: number }) => {
            // Update the time uniform to animate the flicker effect
            starMaterial.uniforms.time.value = time.elapsed;
        }
    };
}
