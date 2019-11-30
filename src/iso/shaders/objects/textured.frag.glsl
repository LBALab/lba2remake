#version 300 es
#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif
#ifdef GL_EXT_shader_texture_lod
#extension GL_EXT_shader_texture_lod : enable
#endif
precision highp float;

uniform sampler2D uTexture;
uniform vec3 light;

in vec3 vNormal;
in vec2 vUv;

out vec4 fragColor;

#require "../../../island/shaders/common/lut.frag"

vec4 textureMipMap(sampler2D s, vec2 uv) {
#ifdef WEBGL2
    vec2 dx = dFdx(vUv);
    vec2 dy = dFdy(vUv);
    float d = max(dot(dx, dx), dot(dy, dy));
    float level = floor(0.5 * log2(d) + 0.5);
    return textureLod(s, uv, min(level, 3.0));
#else
#if defined(GL_EXT_shader_texture_lod) && defined(GL_OES_standard_derivatives)
    vec2 dx = dFdx(vUv);
    vec2 dy = dFdy(vUv);
    float d = max(dot(dx, dx), dot(dy, dy));
    float level = floor(0.5 * log2(d) + 0.5);
    return texture2DLodEXT(s, uv, min(level, 3.0));
#else
    return texture(s, uv);
#endif
#endif
}

float intensity() {
    float dp = dot(vNormal, light);
    return clamp(dp, 0.1, 1.0) * 15.0;
}

void main() {
    vec4 texColor = textureMipMap(uTexture, vUv);
    vec3 palColor = lutLookup(texColor.rgb, intensity());
    fragColor = vec4(palColor, texColor.a);
}
