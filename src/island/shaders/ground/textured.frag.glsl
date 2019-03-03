#version 300 es
precision highp float;

uniform sampler2D uTexture;
uniform sampler2D palette;
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
    float colorIndex = mipmapLookup(vUv / 255.0);
    vec4 tex = texturePal(colorIndex, shadow(vIntensity, 1.0));
    vec4 color = dither(vColor, shadow(vIntensity, 0.5));
    vec3 fColor = mix(color.rgb, tex.rgb, tex.a);
    fragColor = vec4(fog(fColor), 1.0);
}
