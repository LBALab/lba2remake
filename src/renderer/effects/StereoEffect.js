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

    let width;
    let height;

    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();

    const cameraL = new THREE.PerspectiveCamera();
    const cameraR = new THREE.PerspectiveCamera();

    let fov;
    let outer;
    let inner;
    let top;
    let bottom;
    let ndfl;
    let halfFocalWidth;
    let halfFocalHeight;
    let innerFactor;
    let outerFactor;

    // initialization

    renderer.autoClear = false;

    this.setSize = function setSize(w, h) {
        width = w / 2;
        height = h;

        renderer.setSize(width, height);
    };

    this.getSize = function getSize() {
        return renderer.getSize();
    };

    this.render = function render(scene, camera, readBuffer) {
        scene.updateMatrixWorld();

        if (camera.parent === null) camera.updateMatrixWorld();

        camera.matrixWorld.decompose(position, quaternion, scale);

        // Effective fov of the camera

        fov = THREE.Math.radToDeg(
            2 * Math.atan(Math.tan(THREE.Math.degToRad(camera.fov) * 0.5) / camera.zoom)
        );

        ndfl = camera.near / this.focalLength;
        halfFocalHeight = Math.tan(THREE.Math.degToRad(fov) * 0.5) * this.focalLength;
        halfFocalWidth = halfFocalHeight * 0.5 * camera.aspect;

        top = halfFocalHeight * ndfl;
        bottom = -top;
        innerFactor = (halfFocalWidth + (this.eyeSeparation / 2.0)) / (halfFocalWidth * 2.0);
        outerFactor = 1.0 - innerFactor;

        outer = halfFocalWidth * 2.0 * ndfl * outerFactor;
        inner = halfFocalWidth * 2.0 * ndfl * innerFactor;

        // left

        cameraL.projectionMatrix.makePerspective(
            -outer,
            inner,
            bottom,
            top,
            camera.near,
            camera.far
        );

        cameraL.position.copy(position);
        cameraL.quaternion.copy(quaternion);
        cameraL.translateX(-this.eyeSeparation / 2.0);

        // right

        cameraR.projectionMatrix.makePerspective(
            -inner,
            outer,
            bottom,
            top,
            camera.near,
            camera.far
        );

        cameraR.position.copy(position);
        cameraR.quaternion.copy(quaternion);
        cameraR.translateX(this.eyeSeparation / 2.0);

        if (this.antialias) {
            if (readBuffer) {
                renderer.setScissorTest(true);
                readBuffer.scissor.set(0, 0, width, height);
                readBuffer.viewport.set(0, 0, width, height);
                renderer.render(scene, cameraL, readBuffer, true);

                readBuffer.scissor.set(width, 0, width, height);
                readBuffer.viewport.set(width, 0, width, height);
                renderer.render(scene, cameraR, readBuffer);
                renderer.setScissorTest(false);
            } else {
                renderer.render(scene, camera, readBuffer);
            }
        } else {
            renderer.clear();
            renderer.setScissorTest(true);
            renderer.setScissor(0, 0, width, height);
            renderer.setViewport(0, 0, width, height);
            renderer.render(scene, cameraL);

            renderer.setScissor(width, 0, width, height);
            renderer.setViewport(width, 0, width, height);
            renderer.render(scene, cameraR);
            renderer.setScissorTest(false);
        }
    };
}

StereoEffect.prototype = Object.create(THREE.EventDispatcher.prototype);
StereoEffect.prototype.constructor = StereoEffect;

export default StereoEffect;
