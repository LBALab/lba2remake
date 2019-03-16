#version 300 es
precision highp float;
precision highp sampler3D;

uniform sampler2D uTexture;
uniform sampler2D palette;
uniform sampler2D noise;
uniform sampler3D lutTexture;
uniform vec4 actorPos[10];

in float vColor;
in float vIntensity;
in vec2 vUv;
in vec3 vPosition;
in vec2 vGridPos;

out vec4 fragColor;

#require "../common/mipmap.frag"
#require "../common/dither.frag"
#require "../common/texturePal.frag"
#require "../common/fog.frag"
#require "../common/shadow.frag"

void main() {
    float intensity = shadow(vIntensity, 0.5);
    vec4 tex = texture(uTexture, vUv / 255.0);
    vec4 color = dither(vColor, intensity);
    float pColor = texture(lutTexture, tex.rgb).a;
    vec4 tColor = texturePal(pColor, intensity);
    vec3 fColor = mix(color.rgb, tColor.rgb, tex.a);
    fragColor = vec4(fog(fColor), 1.0);
}
