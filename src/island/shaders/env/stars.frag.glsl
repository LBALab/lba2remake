varying float vTint;
varying float vIntensity;

void main() {
    float l = 1.0 - min(length(gl_PointCoord - 0.5) * 4.0, 1.0);
    float rg = vTint * 0.5 + 0.5;
    float b = 1.0 - vTint * 0.2;
    float a = l * vIntensity;
    gl_FragColor = vec4(vec3(rg, rg, b) * a, a);
    if (a < 0.01) discard;
}
