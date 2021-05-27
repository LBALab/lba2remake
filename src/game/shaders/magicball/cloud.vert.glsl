precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 modelMatrix;
uniform mat4 projectionMatrix;
uniform vec3 cameraPosition;

in vec3 position;
in vec3 normal;
in vec2 uv;

out float vDist;
out vec2 vUv;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vec4 mPos = modelMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    vec3 camDir = normalize(mPos.xyz - cameraPosition);
    vDist = dot(camDir, normal);
    vUv = uv;
}
