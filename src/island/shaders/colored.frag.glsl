precision highp float;

uniform vec3 fogColor;

varying vec4 vColor;

#define saturate(a) clamp( a, 0.0, 1.0 )
#define whiteComplement(a) ( 1.0 - saturate( a ) )
#define LOG2 1.442695

void main() {
    float depth = gl_FragCoord.z / gl_FragCoord.w;
    float fogDensity = 0.25;
    float fogFactor = whiteComplement(exp2(-fogDensity * fogDensity * depth * depth * LOG2));
    gl_FragColor = vec4(mix(vColor.rgb, fogColor, fogFactor), 1.0);
}
