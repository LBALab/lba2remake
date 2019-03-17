#version 300 es
precision highp float;

uniform sampler2D uTexture;
uniform vec3 light;

in vec2 vUv;
in vec4 vUvGroup;
in vec3 vNormal;

out vec4 fragColor;

#require "../../island/shaders/common/fog.frag"
#require "../../island/shaders/common/intensity.frag"

void main() {
    vec2 uv = mod(vUv, vUvGroup.zw + 1.0) + vUvGroup.xy;
    vec4 tex = texture(uTexture, uv / 256.0);
    fragColor = vec4(fog(tex.rgb * intensity() * 0.125), tex.a);
}
