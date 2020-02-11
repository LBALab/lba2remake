attribute float size;
attribute float tint;
attribute float intensity;

varying float vTint;
varying float vIntensity;

void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (7500.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
    vTint = tint;
    vIntensity = intensity;
}
