uniform sampler2D starTex;

varying float vTint;
varying float vIntensity;
varying float vSparkle;

void main() {
    float l = 1.0 - min(length(gl_PointCoord - 0.5), 1.0);
    vec3 blue = vec3(0.063, 0.429, 0.451);
    vec3 color = mix(blue, vec3(1.0), vTint);
    float t = texture(starTex, gl_PointCoord).a;
    float a = l * l * l * vIntensity;
    float b = mix(a, t, vSparkle * 0.6);
    gl_FragColor = vec4(color * b * 8.0, b);
}
