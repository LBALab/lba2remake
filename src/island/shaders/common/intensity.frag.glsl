float intensity() {
    float dp = dot(normalize(vNormal), light);
    return clamp(dp, 0.0, 1.0) * 16.0;
}
