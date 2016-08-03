precision highp float;

uniform sampler2D texture;
uniform vec3 fogColor;

varying vec4 vColor;
varying vec2 vUv;

#define saturate(a) clamp( a, 0.0, 1.0 )
#define whiteComplement(a) ( 1.0 - saturate( a ) )
#define LOG2 1.442695

void main() {
    float depth = gl_FragCoord.z / gl_FragCoord.w;
    float fogDensity = 0.25;
    float fogFactor = whiteComplement(exp2(-fogDensity * fogDensity * depth * depth * LOG2));
    vec4 tex = texture2D(texture, vUv);
    vec3 color = mix(vColor.rgb, tex.rgb * vColor.a, tex.a);
    gl_FragColor = vec4(mix(color, fogColor, fogFactor), 1.0);
}
