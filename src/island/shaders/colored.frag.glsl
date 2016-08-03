precision highp float;

varying vec4 vColor;

#require "./fog.frag"

void main() {
    gl_FragColor = vec4(fog(vColor.rgb), 1.0);
}
