float shadow(float intensity, float factor) {
    float iOffset = 0.0;
    for (int i = 0; i < 10; i += 1) {
        float dist = 1.0 - clamp(length(vGridPos - actorPos[i].xy) * actorPos[i].z, 0.0, 1.0);
        dist = --dist * dist * dist + 1.0;
        iOffset = max(iOffset, dist * (intensity + 6.0) * factor * 0.5 * actorPos[i].w);
    }
    return intensity - iOffset;
}
