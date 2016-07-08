precision lowp float;

//#pragma require("constants");

uniform sampler2D body;

varying vec4 vColor;
varying vec2 vUv;

const float epsilon = 0.01;

bool equals(float value, float refValue) {
    return (abs(value - refValue) <= epsilon);
}

void main() {
    vec3 color = vColor.rgb;
    float type = vColor.a;

    gl_FragColor = vec4(1,0,0,1);//color, 1.0);
/*
    if (equals(type, USE_COLOR)) {
        gl_FragColor = vec4(color, 1.0);
    } else {
        bool isGround = equals(type, USE_TEXTURE_GROUND) || equals(type, USE_COLOR_AND_TEXTURE_GROUND);
        bool useColorAndTexture = equals(type, USE_COLOR_AND_TEXTURE_GROUND);
        vec4 tex = texture2D(body, vUv);
        if (useColorAndTexture) {
            gl_FragColor = vec4(mix(color, tex.rgb * length(color), tex.a), 1.0);
        } else {
            gl_FragColor = vec4(tex.rgb * color.r, 1.0);
        }
    }*/
}
