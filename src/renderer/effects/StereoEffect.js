/**
 * @author alteredq / http://alteredqualia.com/
 * @authod mrdoob / http://mrdoob.com/
 * @authod arodic / http://aleksandarrodic.com/
 * @authod fonserbc / http://fonserbc.github.io/
 * @authod samsy / http://samsy.ninja/
 *
 * Off-axis stereoscopic effect based on http://paulbourke.net/stereographics/stereorender/
 */

import * as THREE from 'three';

function StereoEffect(renderer) {
    const scope = this;

    this.eyeSeparation = 3;
    this.focalLength = 15; // Distance to the non-parallax or projection plane

    Object.defineProperties(this, {
        separation: {
            get() {
                return scope.eyeSeparation;
            },
            set(value) {
                // eslint-disable-next-line no-console
                console.warn('THREE.StereoEffect: .separation is now .eyeSeparation.');
                scope.eyeSeparation = value;
            }
        },
        targetDistance: {
            get() {
                return scope.focalLength;
            },
            set(value) {
                // eslint-disable-next-line no-console
                console.warn('THREE.StereoEffect: .targetDistance is now .focalLength.');
                scope.focalLength = value;
            }
        }
    });

    // internals

    let _width,
        _height;

    const _position = new THREE.Vector3();
    const _quaternion = new THREE.Quaternion();
    const _scale = new THREE.Vector3();

    const _cameraL = new THREE.PerspectiveCamera();
    const _cameraR = new THREE.PerspectiveCamera();

    let _fov;
    let _outer,
        _inner,
        _top,
        _bottom;
    let _ndfl,
        _halfFocalWidth,
        _halfFocalHeight;
    let _innerFactor,
        _outerFactor;

    // initialization

    renderer.autoClear = false;

    this.setSize = function setSize(width, height) {
        _width = width / 2;
        _height = height;

        renderer.setSize(width, height);
    };

    this.getSize = function getSize() {
        return renderer.getSize();
    };

    this.render = function render(scene, camera, readBuffer) {
        scene.updateMatrixWorld();

        if (camera.parent === null) camera.updateMatrixWorld();

        camera.matrixWorld.decompose(_position, _quaternion, _scale);

        // Effective fov of the camera

        _fov = THREE.Math.radToDeg(
            2 * Math.atan(Math.tan(THREE.Math.degToRad(camera.fov) * 0.5) / camera.zoom)
        );

        _ndfl = camera.near / this.focalLength;
        _halfFocalHeight = Math.tan(THREE.Math.degToRad(_fov) * 0.5) * this.focalLength;
        _halfFocalWidth = _halfFocalHeight * 0.5 * camera.aspect;

        _top = _halfFocalHeight * _ndfl;
        _bottom = -_top;
        _innerFactor = (_halfFocalWidth + this.eyeSeparation / 2.0) / (_halfFocalWidth * 2.0);
        _outerFactor = 1.0 - _innerFactor;

        _outer = _halfFocalWidth * 2.0 * _ndfl * _outerFactor;
        _inner = _halfFocalWidth * 2.0 * _ndfl * _innerFactor;

        // left

        _cameraL.projectionMatrix.makePerspective(
            -_outer,
            _inner,
            _bottom,
            _top,
            camera.near,
            camera.far
        );

        _cameraL.position.copy(_position);
        _cameraL.quaternion.copy(_quaternion);
        _cameraL.translateX(-this.eyeSeparation / 2.0);

        // right

        _cameraR.projectionMatrix.makePerspective(
            -_inner,
            _outer,
            _bottom,
            _top,
            camera.near,
            camera.far
        );

        _cameraR.position.copy(_position);
        _cameraR.quaternion.copy(_quaternion);
        _cameraR.translateX(this.eyeSeparation / 2.0);

        if (this.antialias) {
            if (readBuffer) {
                renderer.setScissorTest(true);
                readBuffer.scissor.set(0, 0, _width, _height);
                readBuffer.viewport.set(0, 0, _width, _height);
                renderer.render(scene, _cameraL, readBuffer, true);

                readBuffer.scissor.set(_width, 0, _width, _height);
                readBuffer.viewport.set(_width, 0, _width, _height);
                renderer.render(scene, _cameraR, readBuffer);
                renderer.setScissorTest(false);
            } else {
                renderer.render(scene, camera, readBuffer);
            }
        } else {
            renderer.clear();
            renderer.setScissorTest(true);
            renderer.setScissor(0, 0, _width, _height);
            renderer.setViewport(0, 0, _width, _height);
            renderer.render(scene, _cameraL);

            renderer.setScissor(_width, 0, _width, _height);
            renderer.setViewport(_width, 0, _width, _height);
            renderer.render(scene, _cameraR);
            renderer.setScissorTest(false);
        }
    };
}

StereoEffect.prototype = Object.create(THREE.EventDispatcher.prototype);
StereoEffect.prototype.constructor = StereoEffect;

export default StereoEffect;
