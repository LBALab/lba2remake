import async from 'async';
import THREE from 'three';
import _ from 'lodash';

import {loadModel, updateModel} from '../model';

const ACTOR_STATIC_FLAG = {
    NONE             : 0,
    COLLIDE_WITH_OBJ : 1,
    // TODO
    HIDDEN           : 0x200,
    SPRITE           : 0x400
    // TODO
}


export function createActor(currentScene, index, actorProps, xOffset, zOffset) {
    let actor = actorProps;
    actor.index = index;
    actor.physics = {
        position: new THREE.Vector3(),
        orientation: new THREE.Quaternion(),
        euler: new THREE.Vector3()
    }
    actor.currentScene = currentScene;
    actor.reloadModel = true;

    actor.physics.position.x = actor.pos[0] + xOffset * 2;
    actor.physics.position.y = actor.pos[1];
    actor.physics.position.z = actor.pos[2] + zOffset * 2;

    actor.physics.euler.y = getRotation(actor.angle, 0, 1) - 90;

    const euler = new THREE.Euler(THREE.Math.degToRad(actor.physics.euler.x), 
                                  THREE.Math.degToRad(actor.physics.euler.y), 
                                  THREE.Math.degToRad(actor.physics.euler.z), 'XZY');
    actor.physics.orientation.setFromEuler(euler);

    actor.update = function (time) {
        if (actor.isVisible() && 
           !actor.isSprite() && 
            actor.reloadModel) { // only load new model if need reload
            actor.load(actor.index, (threeObject, models) => {
                actor.threeObject = threeObject;
                currentScene.threeScene.add(threeObject);
            });
        }
        if(actor.currentScene.models && actor.currentScene.models.entities) {
            updateModel(actor.currentScene.models, index, actor.entityIndex, actor.bodyIndex, actor.animIndex, time);
        }
    }

    actor.load = function (index, callback) {
        loadModel(actor.currentScene.models, index, actor.entityIndex, actor.bodyIndex, actor.animIndex, (obj) => { 
            actor.threeObject = obj.meshes[index];
            actor.threeObject.position.set(actor.physics.position.x, actor.physics.position.y, actor.physics.position.z);
            actor.threeObject.quaternion.copy(actor.physics.orientation);
            callback(actor.threeObject, obj);
        });
        actor.reloadModel = false;
    }

    actor.isVisible = function () {
        return !(actor.staticFlags & ACTOR_STATIC_FLAG.HIDDEN) ? true : false;
    }

    actor.isSprite = function () {
        return (actor.staticFlags & ACTOR_STATIC_FLAG.SPRITE) ? true : false;
    }
    
    return actor;
}

// duplicated function to add as utils
function getRotation(nextValue, currentValue, interpolation) {
    let angleDif = nextValue - currentValue;
    let computedAngle = 0;

    if (angleDif) {
	    if (angleDif < -0x800) {
		    angleDif += 0x1000;
		}
	    else if (angleDif > 0x800) {
		    angleDif -= 0x1000;
		}
        computedAngle = currentValue + (angleDif * interpolation)
    } else {
        computedAngle = currentValue;
    }

    computedAngle = computedAngle * 360 / 0x1000;

    return computedAngle;
}
