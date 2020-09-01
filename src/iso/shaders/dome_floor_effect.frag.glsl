#if (NUM_ACTORS > 0)
uniform vec3 actorPos[NUM_ACTORS];
#endif

float getFloorOpacity(vec3 pos) {
#if (NUM_ACTORS > 0)
    float dist = 1000.0;
    for (int i = 0; i < NUM_ACTORS; i += 1) {
        dist = min(dist, length(pos - actorPos[i]));
    }
#else
    float dist = 0.0;
#endif
    return 1.0 - clamp(dist - 0.38, 0.0, 1.0);
}
