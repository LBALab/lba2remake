precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 modelMatrix;
uniform mat4 projectionMatrix;

in vec3 position;
out vec3 vPos;

#if (SHADE > 0)
in vec3 normal;
out vec3 vNormal;
#endif

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vPos = position;
#if (SHADE > 0)
    vNormal = normal;
#endif
}
