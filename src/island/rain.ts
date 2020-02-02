import * as THREE from 'three';

const rainMaterial = new THREE.ShaderMaterial({
    vertexShader: `
        uniform float time;

        varying float opacity;

        void main() {
            float t = mod(position.y + time, 1.0);
            vec4 pos = vec4(
                position.x * 40.0 - 20.0,
                (1.0 - t) * 20.0,
                position.z * 40.0 - 20.0,
                1.0
            );
            float lim = 1.0 - step(0.94, t);
            opacity = t * lim;
            gl_Position = projectionMatrix * modelViewMatrix * pos;
        }`,
    fragmentShader: `
        varying float opacity;

        void main() {
            vec3 color = vec3(0.7, 0.7, 1.0);
            gl_FragColor = vec4(color, 0.25 * opacity);
        }`,
    transparent: true,
    uniforms: {
        time: { value: 1.0 },
    }
});

export function loadRain() {
    const rainCount = 200000;
    const rainGeo = new THREE.BufferGeometry();
    const positions = [];
    for (let i = 0; i < rainCount; i += 1) {
        const x = Math.random();
        const y = Math.random();
        const z = Math.random();
        positions.push(x);
        positions.push(y);
        positions.push(z);
        positions.push(x);
        positions.push(y + 0.05);
        positions.push(z);
    }
    const posArray = new Float32Array(positions);
    const posAttr = new THREE.BufferAttribute(posArray, 3);
    rainGeo.setAttribute('position', posAttr);

    const rain = new THREE.LineSegments(rainGeo, rainMaterial);
    rain.renderOrder = 100;
    rain.frustumCulled = false;
    const update = (scene, time) => {
        const camPos = scene.camera.controlNode.position;
        rainMaterial.uniforms.time.value = time.elapsed;
    };
    return {rain, update};
}
