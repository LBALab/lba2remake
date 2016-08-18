precision lowp float;

uniform sampler2D body;

varying vec4 vColor;
varying vec2 vUv;

const float epsilon = 0.01;

bool equals(float value, float refValue) {
    return (abs(value - refValue) <= epsilon);
}

void main() {
    if (equals(vColor.a, 0.0)) {
        gl_FragColor = texture2D(body, vUv);
    } else {
        gl_FragColor = vColor;
    }
}
