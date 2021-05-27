// This is a padding comment to workaround
// a shader compilation issue on WebGL1
// when specifying shader version in
// JS instead of on the first line of the shader.
precision highp float;

uniform vec3 color1;
uniform vec3 color2;
uniform vec3 color3;

in float vDist;

out vec4 fragColor;

void main() {
    float r = clamp(vDist * vDist, 0.0, 1.0);
    vec3 cIn = mix(color3, color2, clamp(r * 2.0, 0.0, 1.0));
    vec3 cOut = mix(cIn, color1, clamp(r * 2.0 - 1.0, 0.0, 1.0));
    fragColor = vec4(cOut, 1.0);
}
