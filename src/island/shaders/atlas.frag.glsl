precision highp float;

uniform sampler2D texture;

varying vec4 vColor;
varying vec2 vUv;
varying vec4 vUvGroup;

#require "./fog.frag"

void main() {
    vec2 uv = mod(vUv, vUvGroup.zw) * 0.99609375 + vUvGroup.xy + vec2(0.001953125);
    vec4 tex = texture2D(texture, uv);
    vec3 color = mix(vColor.rgb, tex.rgb * vColor.a, tex.a);
    gl_FragColor = vec4(fog(color), tex.a);
}
