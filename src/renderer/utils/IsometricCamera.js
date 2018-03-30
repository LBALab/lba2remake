import * as THREE from 'three';

export const IsometricCamera = function IsometricCamera(windowSize, offset = new THREE.Vector2()) {
    THREE.Camera.call(this);

    this.type = 'IsometricCamera';

    this.size = windowSize;
    this.offset = offset;
    this.zScale = 0.01;

    const scale = 1 / 32;
    this.scale.set(scale, scale, scale);
    this.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2.0);

    this.updateProjectionMatrix();
};

IsometricCamera.prototype = Object.create(THREE.Camera.prototype);
IsometricCamera.prototype.constructor = IsometricCamera;

IsometricCamera.prototype.updateProjectionMatrix = function updateProjectionMatrix() {
    this.projectionMatrix.set(
        48 / this.size.x, 0, -48 / this.size.x, -this.offset.x / this.size.x,
        -24 / this.size.y, 60 / this.size.y, -24 / this.size.y, -this.offset.y / this.size.y,
        -this.zScale, -this.zScale, -this.zScale, 0,
        0, 0, 0, 1
    );
};

IsometricCamera.prototype.copy = function copy(source) {
    THREE.Camera.prototype.copy.call(this, source);
    this.size = source.size;
    this.offset = source.offset;
    return this;
};
