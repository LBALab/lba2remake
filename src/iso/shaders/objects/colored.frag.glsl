#version 300 es
precision highp float;

uniform vec3 light;

in vec3 vNormal;
in vec4 vColor;

out vec4 fragColor;

#require "../../../island/shaders/common/lut.frag"

float intensity() {
    float dp = dot(vNormal, light);
    return clamp(dp, 0.1, 1.0) * 15.0;
}

void main() {
    vec3 palColor = lutLookup(vColor.rgb, intensity());
    fragColor = vec4(palColor, vColor.a);
    // fragColor = vec4(vNormal, 1.0);
}
