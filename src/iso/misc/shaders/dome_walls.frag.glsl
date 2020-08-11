#version 300 es
precision highp float;

uniform float time;

in float vDist;
in float vY;

out vec4 fragColor;

void main() {
    float t = time * 0.1;
    float lp = vY + sin(vDist * 0.3 + sin(t) * 10.0) * 2.0 + sin(vDist + sin(t) * 20.5) * 0.3 + sin(vDist * 2.1 + sin(t) * 40.1) * 0.2;
    float c = 1.0 - clamp(abs(0.0 - lp) * 0.1, 0.0, 1.0);
    vec3 blue = vec3(0.063, 0.429, 0.451);
    fragColor = vec4(vec3(0.03) + c * c * 0.3 * blue, 1.0);
}
