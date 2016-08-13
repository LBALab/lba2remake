#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif
precision highp float;

uniform sampler2D texture;

varying vec4 vColor;
varying vec2 vUv;
varying vec3 vPos;

#require "./fog.frag"
#require "./noise3D"

void main() {
    vec4 tex = texture2D(texture, vUv);
    float bias = max(1.0 - (max(length(dFdx(vPos)), length(dFdy(vPos))) * 512.0), 0.0);
    vec3 color = vColor.rgb * ((snoise(vPos * 2048.0) * bias) * 0.2 + 0.9);
    vec3 fColor = mix(color, tex.rgb * vColor.a, tex.a);
    gl_FragColor = vec4(fog(fColor), 1.0);
}
