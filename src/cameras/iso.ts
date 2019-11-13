import THREE from 'three';

const CAMERA_HERO_OFFSET = new THREE.Vector3(-24, 19.2, 24);

export function getIsometricCamera() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const camera = new THREE.OrthographicCamera(
        -w * 0.5,
        w * 0.5,
        h * 0.5,
        -h * 0.5,
        0,
        1000
    );
    setCameraScale(camera, w, h);
    camera.name = 'IsoCamera';
    return {
        width: w,
        height: h,
        threeCamera: camera,
        resize(width, height) {
            if (width !== this.width || height || this.height) {
                camera.left = -width * 0.5;
                camera.right = width * 0.5;
                camera.top = height * 0.5;
                camera.bottom = -height * 0.5;
                setCameraScale(camera, width, height);
                camera.updateProjectionMatrix();
            }
        },
        init: (scene, controlsState) => {
            if (!scene.actors[0].threeObject)
                return;

            const { objectPos, cameraPos } = getTargetPos(scene.actors[0]);
            controlsState.cameraLerp.copy(cameraPos);
            controlsState.cameraLookAtLerp.copy(objectPos);
            camera.position.copy(controlsState.cameraLerp);
            camera.lookAt(controlsState.cameraLookAtLerp);
        },
        update: (scene, controlsState, time) => {
            if (controlsState.freeCamera) {
                processFreeIsoMovement(controlsState, camera, scene, time);
            } else {
                if (!scene.actors[0].threeObject)
                    return;

                const { objectPos, cameraPos } = getTargetPos(scene.actors[0]);

                controlsState.cameraLerp.lerpVectors(camera.position, cameraPos, 0.2);
                controlsState.cameraLookAtLerp.lerpVectors(
                    controlsState.cameraLookAtLerp.clone(),
                    objectPos,
                    0.2);

                camera.position.copy(controlsState.cameraLerp);
                camera.lookAt(controlsState.cameraLookAtLerp);
            }
        },
        centerOn: (object) => {
            if (!object.threeObject)
                return;

            const { objectPos, cameraPos } = getTargetPos(object);

            camera.position.copy(cameraPos);
            camera.lookAt(objectPos);
        }
    };
}

function setCameraScale(camera, width, height) {
    const baseSize = 8;
    const scale = baseSize / (width < height ? width : height);
    camera.scale.set(scale, scale, 1);
}

function getTargetPos(object) {
    const objectPos = new THREE.Vector3();
    objectPos.applyMatrix4(object.threeObject.matrixWorld);
    const cameraPos = objectPos.clone();
    cameraPos.add(CAMERA_HERO_OFFSET);
    return { objectPos, cameraPos };
}

export function processFreeIsoMovement(controlsState, camera, scene, time) {
    const speedX = new THREE.Vector3().set(
        3.6,
        0,
        3.6
    );
    speedX.multiplyScalar(-controlsState.cameraSpeed.x);
    const speedZ = new THREE.Vector3().set(
        5,
        0,
        -5
    );
    speedZ.multiplyScalar(controlsState.cameraSpeed.z);
    const speed = speedZ;
    speed.add(speedX);
    speed.multiplyScalar(time.delta);

    camera.position.add(speed);
}
