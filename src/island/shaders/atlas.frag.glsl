precision highp float;

uniform vec3 fogColor;
uniform sampler2D texture;

varying vec4 vColor;
varying vec2 vUv;
varying vec4 vUvGroup;

#define saturate(a) clamp( a, 0.0, 1.0 )
#define whiteComplement(a) ( 1.0 - saturate( a ) )
#define LOG2 1.442695

void main() {
    float depth = gl_FragCoord.z / gl_FragCoord.w;
    float fogDensity = 0.25;
    float fogFactor = whiteComplement(exp2(-fogDensity * fogDensity * depth * depth * LOG2));
    vec2 uv = mod(vUv, vUvGroup.zw) + vUvGroup.xy;
    vec4 tex = texture2D(texture, uv);
    vec3 color = mix(vColor.rgb, tex.rgb * vColor.a, tex.a);
    gl_FragColor = vec4(mix(color, fogColor, fogFactor), tex.a);
}
