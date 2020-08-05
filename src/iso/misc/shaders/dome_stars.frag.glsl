varying float vTint;
varying float vIntensity;

void main() {
    float l = 1.0 - min(length(gl_PointCoord - 0.5) * 4.0, 1.0);
    vec3 blue = vec3(0.063, 0.429, 0.451);
    vec3 color = mix(blue, vec3(1.0), vTint);
    float a = l * l * l * vIntensity;
    gl_FragColor = vec4(color * a * 8.0, a);
}
