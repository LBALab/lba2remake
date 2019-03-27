#version 300 es
precision highp float;

uniform sampler2D uTexture;
uniform sampler2D palette;
uniform sampler2D noise;
uniform sampler2D lutTexture;
uniform vec4 actorPos[10];

in float vColor;
in float vIntensity;
in vec2 vUv;
in vec3 vPosition;
in vec2 vGridPos;
in vec3 vMVPos;

out vec4 fragColor;

#require "../common/mipmap.frag"
#require "../common/dither.frag"
#require "../common/palette.frag"
#require "../common/fog.frag"
#require "../common/shadow.frag"

void main() {
    float intensity = shadow(vIntensity, 0.5);
    vec4 texColor = texture(uTexture, vUv / 255.0);
    vec4 color = dither(vColor, intensity);
    vec3 texPalColor = mapToPal(texColor.rgb, intensity);
    vec3 tgtColor = mix(color.rgb, texPalColor.rgb, texColor.a);
    fragColor = vec4(fog(tgtColor), 1.0);
}
