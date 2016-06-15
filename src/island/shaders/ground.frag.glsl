precision lowp float;

uniform sampler2D tiles;

varying vec4 vColor;
varying vec2 vUv;

void main() {
    vec3 color = vColor.rgb;
    float flag = vColor.a;
    if (flag == 0.0) {
        gl_FragColor = vec4(color, 1.0);
    } else {
        vec4 tex = texture2D(tiles, vUv);
        if (flag == 1.0) {
            gl_FragColor = vec4(tex.rgb * color.r, 1.0);
        } else {
            gl_FragColor = vec4(mix(color, tex.rgb * length(color), tex.a), 1.0);
        }
    }
}
