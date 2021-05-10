import * as THREE from 'three';
import { WORLD_SIZE } from '../utils/lba';
import { AnimType } from '../game/data/animType';
import Scene from '../game/Scene';
import { ControlsState } from '../game/ControlsState';
import { Time } from '../datatypes';
import IslandPhysics from '../game/scenery/island/IslandPhysics';
import GroundInfo from '../game/scenery/island/physics/GroundInfo';

const CAMERA_OFFSET = new THREE.Vector3(0, 0.15, -0.2);
CAMERA_OFFSET.multiplyScalar(WORLD_SIZE);
const ACTOR_TARGET_POS = new THREE.Vector3(0, 0.08, 0);
ACTOR_TARGET_POS.multiplyScalar(WORLD_SIZE);

export function get3DCamera() {
    const camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        Math.min(0.004 * WORLD_SIZE, 0.1),
        42 * WORLD_SIZE
    );
    camera.name = '3DCamera';
    const controlNode = new THREE.Object3D();
    controlNode.name = 'CameraControlNode';
    const orientation = new THREE.Object3D();
    orientation.name = 'AxisTransform';
    orientation.rotation.set(0, Math.PI, 0);
    orientation.updateMatrix();
    orientation.matrixAutoUpdate = false;
    controlNode.add(orientation);
    orientation.add(camera);
    let actorIndex = 0;

    return {
        width: window.innerWidth,
        height: window.innerHeight,
        threeCamera: camera,
        actorIndex,
        controlNode,
        resize(width, height) {
            if (width !== this.width || height || this.height) {
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
            }
        },
        init: (scene: Scene, controlsState: ControlsState) => {
            if (!controlsState.freeCamera) {
                const actor = scene.actors[actorIndex];
                if (!actor.threeObject)
                    return;
                const actorPos = ACTOR_TARGET_POS.clone();
                actorPos.applyMatrix4(actor.threeObject.matrixWorld);

                const cameraPos = CAMERA_OFFSET.clone();
                cameraPos.applyMatrix4(actor.threeObject.matrixWorld);
                controlsState.cameraLerp.copy(cameraPos);
                controlsState.cameraLookAtLerp.copy(actorPos);
                controlNode.position.copy(cameraPos);
                controlNode.lookAt(controlsState.cameraLookAtLerp);
            }
        },
        setActor: (newActor: number) => {
            actorIndex = newActor;
        },
        update: (scene: Scene, controlsState: ControlsState, time: Time) => {
            if (controlsState.freeCamera) {
                processFree3DMovement(controlsState, controlNode, scene, time);
            } else {
                processFollow3DMovement(controlsState, controlNode, actorIndex, scene, time);
            }
        },
        centerOn: (object) => {
            if (!object.threeObject)
                return;

            const objectPos = new THREE.Vector3();
            objectPos.applyMatrix4(object.threeObject.matrixWorld);
            const cameraPos = objectPos.clone();
            cameraPos.add(CAMERA_OFFSET);
            controlNode.position.copy(cameraPos);
            controlNode.lookAt(objectPos);
        }
    };
}

function processFollow3DMovement(
    controlsState: ControlsState,
    controlNode: THREE.Object3D,
    actorIndex: number,
    scene: Scene,
    time: Time
) {
    const actor = scene.actors[actorIndex];
    if (!actor.threeObject)
        return;

    if (actor.props.animIndex === AnimType.FOUND_OBJECT) {
        return;
    }

    const actorPos = ACTOR_TARGET_POS.clone();
    const cameraPos = CAMERA_OFFSET.clone();
    actorPos.applyMatrix4(actor.threeObject.matrixWorld);
    cameraPos.applyMatrix4(actor.threeObject.matrixWorld);
    scene.scenery.physics.processCameraCollisions(cameraPos);

    if (controlsState.camZone) {
        controlsState.cameraLerp.lerpVectors(
            controlNode.position,
            controlsState.camZone,
            time.delta * 2
        );
    } else {
        controlsState.cameraLerp.lerpVectors(controlNode.position, cameraPos, time.delta * 2);
    }
    controlsState.cameraLookAtLerp.lerpVectors(
        controlsState.cameraLookAtLerp.clone(),
        actorPos,
        time.delta * 6
    );
    controlNode.position.copy(controlsState.cameraLerp);
    controlNode.lookAt(controlsState.cameraLookAtLerp);
}

const GROUND = new GroundInfo();

export function processFree3DMovement(
    controlsState: ControlsState,
    controlNode: THREE.Object3D,
    scene: Scene,
    time: Time
) {
    let speedFactor = 0;
    let height = 0;
    const { physics } = scene.scenery;
    if (physics instanceof IslandPhysics) {
        physics.getHeightmapGround(controlNode.position, GROUND);
        height = GROUND.height;
        speedFactor = Math.max(
            0.0,
            Math.min(1.0, (controlNode.position.y - GROUND.height) * 0.7)
        );
    }

    const euler = new THREE.Euler();
    euler.setFromQuaternion(controlsState.cameraHeadOrientation, 'YXZ');
    const speed = new THREE.Vector3().set(
        controlsState.cameraSpeed.x * 7.2,
        -(controlsState.cameraSpeed.z * 12) * euler.x,
        controlsState.cameraSpeed.z * 7.2
    );

    speed.multiplyScalar((speedFactor * speedFactor * 0.125) + 1);
    speed.applyQuaternion(controlsState.cameraOrientation);
    speed.applyQuaternion(onlyY(controlsState.cameraHeadOrientation));
    speed.multiplyScalar(time.delta);

    controlNode.position.add(speed);
    controlNode.position.y = Math.max(height + 1.5, controlNode.position.y);
    controlNode.quaternion.copy(controlsState.cameraOrientation);
    controlNode.quaternion.multiply(controlsState.cameraHeadOrientation);
}

function onlyY(src) {
    const euler = new THREE.Euler();
    euler.setFromQuaternion(src, 'YXZ');
    euler.x = 0;
    euler.z = 0;
    return new THREE.Quaternion().setFromEuler(euler);
}
