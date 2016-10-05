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
        orientation: new THREE.Quaternion()
    }
    actor.currentScene = currentScene;
    actor.reloadModel = true;

    actor.physics.position.x = actor.pos[0] + xOffset;
    actor.physics.position.y = actor.pos[1];
    actor.physics.position.z = actor.pos[2] + zOffset;

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
            callback(actor.threeObject, obj);
        });
        actor.reloadModel = false;
    }

    actor.isVisible = function () {
        return !(actor.staticFlags & ACTOR_STATIC_FLAG.HIDDEN == ACTOR_STATIC_FLAG.HIDDEN);
    }

    actor.isSprite = function () {
        return (actor.staticFlags & ACTOR_STATIC_FLAG.SPRITE == ACTOR_STATIC_FLAG.SPRITE);
    }
    
    return actor;
}
