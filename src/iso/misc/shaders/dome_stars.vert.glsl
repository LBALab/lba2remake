attribute float size;
attribute float tint;
attribute float intensity;
attribute float sparkle;

varying float vTint;
varying float vIntensity;
varying float vSparkle;

void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (650.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
    vTint = tint;
    vIntensity = intensity;
    vSparkle = sparkle;
}
