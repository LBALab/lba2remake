precision highp float;

uniform sampler2D library;
uniform sampler2D outline;
uniform vec2 tileSize;

varying vec2 vUv;
varying vec2 vCenter;
varying vec2 vTile;

void main() {
    vec2 offset = (vCenter - gl_FragCoord.xy);
    vec2 nOffset = (offset + vec2(24.0, 19.0)) / vec2(48.0, 38.0);
    gl_FragColor = vec4(texture2D(library, vTile + nOffset * tileSize));
    // vec2(1111.0, 854.0)
    //gl_FragColor = vec4(nOffset, 0.0, 1.0);
}
