varying float vTint;
varying float vIntensity;

void main() {
    float l = 1.0 - min(length(gl_PointCoord - 0.5) * 4.0, 1.0);
    float rg = vTint * 0.3 + 0.7;
    float a = l * l * l * vIntensity;
    gl_FragColor = vec4(vec3(rg, rg, 1.0) * a, a);
}
