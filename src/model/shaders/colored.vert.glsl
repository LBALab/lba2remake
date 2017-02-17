precision highp float;

uniform mat4 modelMatrix;
uniform mat4 projectionMatrix;
uniform mat4 bones[50];
uniform mat4 rotationMatrix;
uniform vec2 window;

attribute vec3 position;
attribute vec3 normal;
attribute float color;
attribute float boneIndex;

varying vec3 vPosition;
varying vec3 vNormal;
varying float vColor;

vec4 isoProjection(vec4 basePosition, vec2 scale) {
    mat4 scaleM = mat4(32.0, 0.0, 0.0, 0.0, 0.0, 32.0, 0.0, 0.0, 0.0, 0.0, 32.0, 0.0, 0.0, 0.0, 0.0, 1.0);
    mat4 rotation = mat4(0.0, 0.0, -1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0);
    vec4 pos = scaleM * rotation * modelMatrix  * basePosition;
    return vec4(
        ((pos.x - pos.z) * 48.0 - 3500.0) / scale.x,
        -((pos.x + pos.z) * 24.0 - pos.y * 60.0 + 1000.0) / scale.y,
        0.5,
        1.0
    );
}

void main() {
    gl_Position = isoProjection(bones[int(boneIndex)] * vec4(position, 1.0), window);
    vPosition = position;
    vec4 newNormal = rotationMatrix * bones[int(boneIndex)] * vec4(normal, 1.0);
    vNormal = newNormal.xyz;
    vColor = color;
}
