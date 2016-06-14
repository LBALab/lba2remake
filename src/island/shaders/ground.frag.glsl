precision lowp float;

uniform sampler2D tiles;

varying vec3 vColor;
varying vec2 vUv;

void main() {
    if (vUv.s < -1000.0) {
        gl_FragColor = vec4(vColor.rgb, 1.0);
    } else if (vUv.s < 0.0){
        vec4 tex = texture2D(tiles, vUv * -1.0);
        vec3 color = mix(vColor, tex.rgb * length(vColor), tex.a);
        gl_FragColor = vec4(color, 1.0);
    } else {
        gl_FragColor = vec4(texture2D(tiles, vUv).rgb * vColor.r, 1.0);
    }
}
