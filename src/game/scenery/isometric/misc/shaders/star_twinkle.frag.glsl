precision highp float;

// Varyings from the vertex shader
varying float vIntensity;
varying float vSparkle;
varying vec2  vUv;

// Uniforms set via Three.js
uniform sampler2D starTex;
uniform vec3 uColor;
uniform float time;
uniform float uSpeed;

void main() {
    // Compute twinkle flicker factor
    float flicker = sin(time * uSpeed + vSparkle * 10.0) * vSparkle;
    float finalIntensity = vIntensity + flicker;

    // Sample the star texture and apply the color tint
    vec4 tex = texture2D(starTex, vUv);
    vec3 invertedRGB = vec3(1.0) - tex.rgb;
    vec3 tinted = invertedRGB * uColor;

    // Apply the final intensity to color and alpha
    vec4 color = vec4(tinted * finalIntensity, tex.a * finalIntensity);

    // Discard nearly transparent pixels for cleaner edges
    if (color.a < 0.01) discard;

    gl_FragColor = color;
}
