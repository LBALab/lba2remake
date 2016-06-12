varying vec3 vColor;
varying vec2 vUv;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vColor = color;
    vUv = uv;
}
