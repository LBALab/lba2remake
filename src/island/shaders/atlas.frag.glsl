precision highp float;

uniform sampler2D texture;

varying vec4 vColor;
varying vec2 vUv;
varying vec4 vUvGroup;

#require "./fog.frag"

void main() {
    vec2 uv = mod(vUv, vUvGroup.zw) + vUvGroup.xy;
    vec4 tex = texture2D(texture, uv);
    vec3 color = mix(vColor.rgb, tex.rgb * vColor.a, tex.a);
    gl_FragColor = vec4(fog(color), tex.a);
}
