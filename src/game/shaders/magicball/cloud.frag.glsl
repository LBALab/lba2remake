// This is a padding comment to workaround
// a shader compilation issue on WebGL1
// when specifying shader version in
// JS instead of on the first line of the shader.
precision highp float;

uniform vec3 color;
uniform sampler2D clouds;

in float vDist;
in vec2 vUv;

out vec4 fragColor;

void main() {
    float r = clamp(vDist * vDist, 0.0, 1.0);
    float p = texture(clouds, vUv).r;
    float t = p * (1.0 - r);
    fragColor = vec4(mix(vec3(1.0), color, 0.3), t);
}
