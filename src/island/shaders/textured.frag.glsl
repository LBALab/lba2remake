precision highp float;

uniform sampler2D texture;

varying vec4 vColor;
varying vec2 vUv;

#require "./fog.frag"

void main() {
    vec2 uv = vUv * 0.99609375 + vec2(0.001953125);
    vec4 tex = texture2D(texture, uv);
    vec3 color = mix(vColor.rgb, tex.rgb * vColor.a, tex.a);
    gl_FragColor = vec4(fog(color), 1.0);
}
