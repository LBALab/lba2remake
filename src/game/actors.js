import async from 'async';
import THREE from 'three';
import _ from 'lodash';

import {loadModel, updateModel} from '../model';

export function createActor(models, index, actorProps) {
    let actor = actorProps;
    actor.physics = {
        position: new THREE.Vector3(),
        orientation: new THREE.Quaternion()
    }
    actor.models = models;

    actor.physics.position.x = actor.pos[0];
    actor.physics.position.y = actor.pos[1];
    actor.physics.position.z = actor.pos[2];

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
    
    return actor;
}
