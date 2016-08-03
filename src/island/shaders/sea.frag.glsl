precision highp float;

uniform sampler2D texture;
uniform float scale;

varying vec2 vUv;
varying float shore;

#require "./fog.frag"

void main() {
    vec4 tex = texture2D(texture, vUv * scale);
    vec3 color = mix(vec3(1.0), tex.rgb, shore);
    gl_FragColor = vec4(fog(color), 1.0);
}
