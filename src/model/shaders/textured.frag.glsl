#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif
#ifdef GL_EXT_shader_texture_lod
#extension GL_EXT_shader_texture_lod : enable
#endif
precision highp float;

uniform sampler2D texture;
uniform vec3 light;

varying vec3 vPosition;
varying vec3 vNormal;
varying float vColor;
varying vec2 vUv;

#require "../../island/shaders/common/fog.frag"

void main() {
    vec4 tex = texture2D(texture, vUv);
    gl_FragColor = vec4(fog(tex.rgb), tex.a);
}
