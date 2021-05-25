// This is a padding comment to workaround
// a shader compilation issue on WebGL1
// when specifying shader version in
// JS instead of on the first line of the shader.
precision highp float;

uniform sampler2D library;

in vec2 vUv;
#ifdef GRID_EDITOR
    uniform float mode;
    flat in float vFlag;
#endif

out vec4 fragColor;

void main() {
    vec4 fColor = texture(library, vUv);
    if (fColor.a < 0.5) {
        discard;
    }
#ifdef GRID_EDITOR
    if (mode < 0.5 && vFlag > 0.5) {
        discard;
    }
    if (mode < 1.5 && vFlag > 1.5) {
        discard;
    }
    vec3 tColor = mix(vec3(1.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0), vFlag - 1.0);
    fragColor = mix(fColor, vec4(tColor, fColor.a), min(vFlag, 1.0) * 0.75 * (mode - 1.0));
#else
    fragColor = fColor;
#endif
}
