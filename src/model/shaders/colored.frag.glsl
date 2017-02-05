#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif
#ifdef GL_EXT_shader_texture_lod
#extension GL_EXT_shader_texture_lod : enable
#endif
precision highp float;

uniform sampler2D palette;
uniform vec3 light;

varying vec3 vPosition;
varying vec3 vNormal;
varying float vColor;

#require "../../island/shaders/common/fog.frag"
#require "../../island/shaders/common/dither.frag"
#require "../../island/shaders/common/intensity.frag"

void main() {
    gl_FragColor = vec4(fog(dither(vColor, intensity()).rgb), 1.0);
}
