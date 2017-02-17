import THREE from 'three';

export const IsometricCamera = function(windowSize, offset = new THREE.Vector2()) {
    THREE.Camera.call( this );

    this.type = 'IsometricCamera';

    this.size = windowSize;
    this.offset = offset;
    this.zScale = 0.01;

    let scale = 1 / 32;
    this.scale.set(scale, scale, scale);
    this.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2.0);

    this.isoProjectionMatrix = new THREE.Matrix4();

    this.updateProjectionMatrix();
};

IsometricCamera.prototype = Object.create( THREE.Camera.prototype );
IsometricCamera.prototype.constructor = IsometricCamera;

IsometricCamera.prototype.updateProjectionMatrix = function () {
    const ox = -Math.round(this.offset.x * 0.5) * 2 + 1;
    const oy = -Math.round(this.offset.y * 0.5) * 2 + 1;
    this.projectionMatrix.set(
        48 / this.size.x  , 0                , -48 / this.size.x , ox / this.size.x,
        -24 / this.size.y , 60 / this.size.y , -24 / this.size.y , oy / this.size.y,
        -this.zScale      , -this.zScale     , -this.zScale      , 0,
        0                 , 0                , 0                 , 1
    );
    this.isoProjectionMatrix.set(
        24           , 0            , -24          , ox / 2,
        -12          , 30           , -12          , oy / 2,
        -this.zScale , -this.zScale , -this.zScale , 0,
        0            , 0            , 0            , 1
    );
};

IsometricCamera.prototype.copy = function (source ) {
    THREE.Camera.prototype.copy.call( this, source );
    this.size = source.size;
    this.offset = source.offset;
    return this;
};
