uniform vec3 heroPos;
uniform float distThreshold;

float getFloorOpacity(vec3 pos) {
    float dist = min(length(pos - heroPos), distThreshold);
    return 1.0 - clamp(dist - 0.38, 0.0, 1.0);
}
