#version 300 es
precision highp float;

uniform float time;

in float vDist;
in float vY;

out vec4 fragColor;

void main() {
    float p = mod(time * 20.0, 100.0);
    float lp = vY + sin(vDist * 0.3 + time * 10.0) * 2.0 + sin(vDist + time * 20.5) * 0.3 + sin(vDist * 2.1 + time * 40.1) * 0.2;
    float c = 1.0 - clamp(abs(p - lp) * (3.0 + sin(vDist + time * 10.5) * 0.5), 0.0, 1.0);
    fragColor = vec4(vec3(c * c * 0.2), 1.0);
}
