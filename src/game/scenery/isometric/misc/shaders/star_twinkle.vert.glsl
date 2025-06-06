precision highp float;

// Standard vertex attributes (not automatically provided in RawShaderMaterial)
attribute vec3 position;
attribute vec2 uv;

// Custom attributes for brightness and sparkle effect
attribute float intensity;
attribute float size;
attribute float sparkle;

// Varyings to pass data to the fragment shader
varying float vIntensity;
varying float vSparkle;
varying vec2  vUv;

// Transformation matrices (provided by Three.js)
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

void main() {
    // Pass custom attribute values to the fragment shader via varyings
    vIntensity = intensity;
    vSparkle   = sparkle;
    vUv        = uv;

    // Center UV coordinates at (0.5, 0.5) and scale by size
    vec2 centeredUV = uv - vec2(0.5);
    vec2 offset = centeredUV * size;

    // Compute vertex position in camera space
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

    // Offset the X and Y position by the computed offset (billboard quad)
    mvPosition.xy += offset;

    // Project the vertex to clip space
    gl_Position = projectionMatrix * mvPosition;
}
