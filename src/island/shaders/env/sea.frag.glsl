#version 300 es
precision highp float;

uniform sampler2D uTexture;
uniform sampler2D noise;
uniform vec3 light;
uniform float time;

in vec2 vUv;
in float shore;
in vec3 vMVPos;
in vec3 vNormal;
in float vDistLightning;
in vec2 vPos;

out vec4 fragColor;

#require "../common/fog.frag"
#require "../common/lightning.frag"

void main() {
    float dp = dot(vNormal, light);
    vec2 af = vec2(1.8, 3.0);
    vec2 nzUv = sin(vPos * 0.5 + af * time) * 0.0003;
    float nz = texture(noise, nzUv).a;
    vec4 tex = texture(uTexture, vUv + nz * 0.1);
    vec3 color = mix(vec3(1.0), tex.rgb, shore);
    vec3 colorWithLight = color.rgb * (dp * 0.3 + 1.0);
    vec3 colWithFog = fog(colorWithLight);
    vec3 colWithLightning = lightning(colWithFog);
    fragColor = vec4(colWithLightning, 1.0);
    // fragColor = vec4(vec3(dp), 1.0);
    // fragColor = vec4(vNormal, 1.0);
    // fragColor = vec4(vec3(nz), 1.0);
}
