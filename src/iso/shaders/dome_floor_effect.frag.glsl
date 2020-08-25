uniform vec3 actorPos[5];
uniform float distThreshold;

float getFloorOpacity(vec3 pos) {
    float dist = 1000.0;
    for (int i = 0; i < 5; i += 1) {
        float newDist = min(length(pos - actorPos[i]), distThreshold);
        dist = min(dist, newDist);
    }
    return 1.0 - clamp(dist - 0.38, 0.0, 1.0);
}
