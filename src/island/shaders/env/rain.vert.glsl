uniform float time;
uniform vec2 wind;
uniform vec3 lightningPos;

varying float alpha;
varying vec3 vMVPos;
varying float vDistLightning;

void main() {
    float t = mod(position.y + time * 0.2, 1.0);
    float rt = 1.0 - (t * t * t);
    vec4 pos = vec4(
        position.x * 20.0 - 10.0 + wind.x * t,
        rt * 20.0,
        position.z * 20.0 - 10.0 + wind.y * t,
        1.0
    );
    float lim = 1.0 - step(0.99, t);
    float lim2 = 1.0 - step(0.99, 1.0 - t);
    alpha = min(1.0 - rt, lim);
    vec4 mPos = modelViewMatrix * pos;
    gl_Position = projectionMatrix * mPos;
    vMVPos = mPos.xyz;
    vec4 aPos = modelMatrix * pos;
    aPos.y = 0.0;
    vec3 lp = vec3(lightningPos.x, 0, lightningPos.z);
    vDistLightning = length(aPos.xyz - lp);
}