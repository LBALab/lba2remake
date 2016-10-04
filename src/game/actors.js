import async from 'async';
import THREE from 'three';
import _ from 'lodash';

import {loadModel, updateModel} from '../model';

const ACTOR_STATIC_FLAG = {
    NONE             : 0,
    COLLIDE_WITH_OBJ : 1,
    // TODO
    HIDDEN           : 0x200
    // TODO
}


export function createActor(models, index, actorProps, xOffset, zOffset) {
    let actor = actorProps;
    actor.physics = {
        position: new THREE.Vector3(),
        orientation: new THREE.Quaternion()
    }
    actor.models = models;

    actor.physics.position.x = actor.pos[0] + xOffset;
    actor.physics.position.y = actor.pos[1];
    actor.physics.position.z = actor.pos[2] + zOffset;

    actor.update = function (time) {
        if(actor.models && actor.models.entities) {
            updateModel(actor.models, index, actor.entityIndex, actor.bodyIndex, actor.animIndex, time);
        }
    }

    actor.load = function (index, callback) {
        loadModel(actor.models, index, actor.entityIndex, actor.bodyIndex, actor.animIndex, (obj) => { 
            actor.threeObject = obj.meshes[index];
            actor.threeObject.position.set(actor.physics.position.x, actor.physics.position.y, actor.physics.position.z);
            callback(actor.threeObject, obj);
        });
    }

    actor.isVisible = function () {
        return !(actor.staticFlags & ACTOR_STATIC_FLAG.HIDDEN == ACTOR_STATIC_FLAG.HIDDEN);
    }
    
    return actor;
}
