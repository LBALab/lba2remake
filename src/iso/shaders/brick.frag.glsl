precision highp float;

uniform sampler2D library;
uniform vec2 tileSize;

varying vec2 vCenter;
varying vec2 vTile;

void main() {
    vec2 offset = floor(vCenter - gl_FragCoord.xy);
    vec2 nOffset = offset / vec2(48.0, 38.0) + 0.5;
    gl_FragColor = vec4(texture2D(library, vTile + nOffset * tileSize));
}
