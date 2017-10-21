precision highp float;

uniform sampler2D texture;

varying vec2 vUV;

void main() {
    vec4 tex = texture2D(texture, vUV);
    gl_FragColor = vec4(tex.rgb, tex.a);
    //gl_FragColor = vec4(1,0,0,1);
}
