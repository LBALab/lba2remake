float shadow(float intensity, float factor) {
    float dist = 1.0 - clamp(length(vGridPos - actorPos) * 90.0, 0.0, 1.0);
    dist = dist - 1.0;
    dist = (dist * dist * dist * dist * dist + 1.0);
    return intensity - dist * (intensity + 6.0) * factor * 0.5;
}
