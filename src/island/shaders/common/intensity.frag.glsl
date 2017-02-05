float intensity() {
    float dp = dot(normalize(vNormal), light);
    return clamp(dp, 0.1, 1.0) * 14.0; // 16
}
