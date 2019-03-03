#version 300 es
precision highp float;

uniform sampler2D uTexture;
uniform vec3 light;

in vec2 vUv;

out vec4 fragColor;

#require "../../island/shaders/common/fog.frag"

void main() {
    vec4 tex = texture(uTexture, vUv);
    fragColor = vec4(fog(tex.rgb), tex.a);
}
