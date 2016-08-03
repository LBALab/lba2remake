precision highp float;

uniform sampler2D texture;
uniform float scale;

varying vec2 vUv;

#require "./fog.frag"

void main() {
    vec3 color = texture2D(texture, vUv * scale).rgb;
    gl_FragColor = vec4(fog(color), 1.0);
}
