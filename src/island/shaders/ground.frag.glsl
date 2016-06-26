precision lowp float;

#pragma require("constants");

uniform sampler2D tiles;

varying vec4 vColor;
varying vec2 vUv;

const float epsilon = 0.01;

bool equals(float value, float refValue) {
    return (abs(value - refValue) <= epsilon);
}

void main() {
    vec3 color = vColor.rgb;
    float type = vColor.a;
    if (equals(type, USE_COLOR)) {
        gl_FragColor = vec4(color, 1.0);
    } else {
        vec4 tex = texture2D(tiles, vUv);
        if (equals(type, USE_TEXTURE)) {
            gl_FragColor = vec4(tex.rgb * color.r, 1.0);
        } else {
            gl_FragColor = vec4(mix(color, tex.rgb * length(color), tex.a), 1.0);
        }
    }
}
