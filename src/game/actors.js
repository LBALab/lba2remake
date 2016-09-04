import async from 'async';
import THREE from 'three';
import _ from 'lodash';

import {loadModel, updateModel} from '../model';

export function createActor(models, index, actorProps, callback) {
    let actor = actorProps;
    actor.physics = {
        position: new THREE.Vector3(),
        orientation: new THREE.Quaternion()
    }

    actor.physics.position.x = actor.pos[0];
    actor.physics.position.y = actor.pos[1];
    actor.physics.position.z = actor.pos[2];

    loadModel(models, index, actor.entityIndex, actor.bodyIndex, actor.animIndex, (obj) => { 
        models = obj; 
        actor.threeObject = models.meshes[index];
        actor.threeObject.position.set(actor.physics.position.x, actor.physics.position.y, actor.physics.position.z);
        callback(actor.threeObject, models);
    });

    actor.update = function (time, models) {
        if(models && models.entities) {
            updateModel(models, index, actor.entityIndex, actor.bodyIndex, actor.animIndex, time);
        }
    }
    
    return actor;
}
