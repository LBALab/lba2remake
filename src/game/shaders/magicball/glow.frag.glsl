// This is a padding comment to workaround
// a shader compilation issue on WebGL1
// when specifying shader version in
// JS instead of on the first line of the shader.
precision highp float;

uniform vec3 color;
uniform float opacity;

in float vDist;

out vec4 fragColor;

void main() {
    float r = clamp(vDist * 0.7, 0.0, 1.0);
    fragColor = vec4(color, r * opacity);
}
