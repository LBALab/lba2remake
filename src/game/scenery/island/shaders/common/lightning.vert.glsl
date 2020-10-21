uniform vec3 lightningPos;

float distLightning(vec3 pos) {
    return length(pos - lightningPos);
}
