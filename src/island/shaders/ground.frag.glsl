precision mediump float;

#pragma require("constants");

uniform sampler2D ground;
uniform sampler2D objects;

varying vec4 vColor;
varying vec2 vUv;
varying vec4 vUvGroup;

const float epsilon = 0.01;

bool equals(float value, float refValue) {
    return (abs(value - refValue) <= epsilon);
}

vec2 getObjectUVs() {
    return vec2(mod(vUv[0], vUvGroup[2]) + vUvGroup[0], mod(vUv[1], vUvGroup[3]) + vUvGroup[1]);
}

void main() {
    vec3 color = vColor.rgb;
    float type = vColor.a;
    if (equals(type, USE_COLOR)) {
        gl_FragColor = vec4(color, 1.0);
    } else {
        bool isGround = equals(type, USE_TEXTURE_GROUND) || equals(type, USE_COLOR_AND_TEXTURE_GROUND);
        bool useColorAndTexture = equals(type, USE_COLOR_AND_TEXTURE_GROUND);
        vec4 tex = isGround ? texture2D(ground, vUv) : texture2D(objects, getObjectUVs());
        if (useColorAndTexture) {
            gl_FragColor = vec4(mix(color, tex.rgb * length(color), tex.a), 1.0);
        } else {
            gl_FragColor = vec4(tex.rgb * color.r, 1.0);
        }
    }
}
