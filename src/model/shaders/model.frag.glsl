precision lowp float;

uniform sampler2D body;

varying vec4 vColor;
varying vec2 vUv;

void main() {
    vec3 color = vColor.rgb;
    gl_FragColor = texture2D(body, vUv);
    //gl_FragColor = vec4(color, 1.0);
}
