precision highp float;

uniform float time;
uniform vec3 light;

in vec3 vPos;
#if (SHADE > 0)
in vec3 vNormal;
#endif

out vec4 fragColor;

const float tau = atan(1.0) * 8.0;

const vec3 gblue = vec3(0.095, 0.693, 0.515);

highp float rand(vec2 co) {
    return fract(sin(mod(dot(co.xy ,vec2(12.9898,78.233)),3.14))*43758.5453);
}

void main() {
    float ang = time * tau * 0.075;
	float ang2 = atan(vPos.x, vPos.z) * 0.25;
    ang = mod(ang2 + ang, tau * 0.25);
    float col = smoothstep(1.0, 0.0, ang);
    float rnd = 1.0 + rand(vPos.xz * time) * 1.5;
#if (SHADE > 0)
    float dp = dot(vNormal, light);
    float l = 1.0 - (dp * (1.0 - col));
    float dist = distance(vPos.xz, vec2(0));
    float edge = smoothstep(1.0, 0.0, dist * 4.0 - 1.6);
    vec3 mColor = gblue * l * col * rnd;
    fragColor = vec4(mColor, edge * 0.9);
    // fragColor = vec4(mix(vec3(1.0, 0.0, 0.0), vec3(0.0, 0.0, 1.0), edge), 1.0);
#else
    fragColor = vec4(gblue * rnd, col * rnd * 0.2);
#endif
    float s = max(col - 0.999, 0.0) * 1000.0;
    fragColor += vec4(0.7, 0.9, 1.0, 1.0) * s;
}
