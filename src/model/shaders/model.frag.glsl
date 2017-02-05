precision lowp float;

uniform sampler2D texture;

varying vec4 vColor;
varying vec2 vUv;

const float epsilon = 0.01;

#require "../../island/shaders/common/fog.frag"

bool equals(float value, float refValue) {
    return (abs(value - refValue) <= epsilon);
}

void main() {
    if (equals(vColor.a, 0.0)) {
        vec4 tex = texture2D(texture, vUv);
        gl_FragColor = vec4(fog(tex.rgb), tex.a);
    } else {
        gl_FragColor = vec4(fog(vColor.rgb), vColor.a);
    }
}
