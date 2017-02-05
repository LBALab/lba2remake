#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif
#ifdef GL_EXT_shader_texture_lod
#extension GL_EXT_shader_texture_lod : enable
#endif
precision highp float;

uniform sampler2D texture;
uniform sampler2D palette;
uniform vec3 light;

varying vec3 vPosition;
varying vec4 vNormal4;
varying vec3 vNormal;
varying vec4 vColor;
varying vec2 vUv;

const float epsilon = 0.01;

#require "../../island/shaders/common/fog.frag"
#require "../../island/shaders/common/dither.frag"
#require "../../island/shaders/common/intensity.frag"

bool equals(float value, float refValue) {
    return (abs(value - refValue) <= epsilon);
}

void main() {
    if (equals(vColor.a, 0.0)) {
        vec4 tex = texture2D(texture, vUv);
        gl_FragColor = vec4(fog(tex.rgb), tex.a);
    } else {
        gl_FragColor = vec4(fog(dither(vNormal4.a, intensity()).rgb), 1.0);
        //gl_FragColor = vec4(fog(vColor.rgb), vColor.a);
    }
}
