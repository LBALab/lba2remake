uniform sampler2D starTex;
uniform float uTint;
uniform float uIntensity;
uniform float uSparkle;
uniform float uAlpha;
uniform float time;

varying vec2 vUv;
varying float vDist;
varying float vTa;
varying float vSpos;

const float PI = 3.14159265359;

float quarticIn(float t) {
  return pow(t, 4.0);
}

void main() {
    vec2 uv = vec2(quarticIn(vUv.x), vUv.y);
    float l = 1.0 - min(length(uv - 0.5), 1.0);
    vec3 blue = vec3(0.063, 0.429, 0.451);
    vec3 color = mix(blue, vec3(1.0), uTint);
    float t = texture(starTex, uv).a;
    float a = l * l * l * uIntensity;
    float b = mix(a, t, uSparkle * 0.62);
    float ts = time * 2.0 + uSparkle * PI;
    float twinkle = mix((4.25 + sin(ts) * 3.75), 8.0, vDist);
    float activ = mix(uAlpha, uAlpha * (sin(time * vSpos + vSpos * 4.0) * 0.5 + 0.5), vTa);
    gl_FragColor = vec4(color * b * twinkle, b * activ);
}
