import * as THREE from 'three';
import Scene from '../../Scene';
import Game from '../../Game';
import { Time } from '../../../datatypes';
import { IslandGeometryInfo } from './geometries';
import Actor from '../../Actor';

const DIFF = new THREE.Vector3();
const POSITION = new THREE.Vector3();
const HERO_POS = new THREE.Vector3();

const SHADOW_MAX_DIST = 15;
const SHADOW_MAX_DIST_SQ = SHADOW_MAX_DIST * SHADOW_MAX_DIST;

export default class IslandShadows {
    materials: any;

    constructor({ matByName }: IslandGeometryInfo) {
        this.materials = matByName;
    }

    update(_game: Game, baseScene: Scene, _time: Time) {
        const shadows = [];

        if (!baseScene) {
            return;
        }

        this.computeShadow(baseScene, baseScene.actors[0], shadows);
        HERO_POS.copy(POSITION);
        for (const actor of baseScene.actors) {
            if (actor.index !== 0) {
                this.computeShadow(baseScene, actor, shadows);
            }
        }
        if (baseScene.sideScenes) {
            for (const sideScene of Object.values(baseScene.sideScenes) as any) {
                for (const actor of sideScene.actors) {
                    this.computeShadow(sideScene, actor, shadows);
                }
            }
        }
        shadows.sort((a, b) => a.distToHero - b.distToHero);
        for (let i = 0; i < 10; i += 1) {
            const shadow = shadows[i];
            const {ground_colored, ground_textured} = this.materials;
            if (shadow) {
                if (ground_colored)
                    ground_colored.uniforms.actorPos.value[i].fromArray(shadow.data);
                if (ground_textured)
                    ground_textured.uniforms.actorPos.value[i].fromArray(shadow.data);
            } else {
                if (ground_colored)
                    (ground_colored.uniforms.actorPos.value[i].w = 0);
                if (ground_textured)
                    (ground_textured.uniforms.actorPos.value[i].w = 0);
            }
        }
    }

    computeShadow(scene: Scene, actor: Actor, shadows: any[]) {
        if (!actor.props.flags.isSprite
            && !actor.props.flags.noShadow
            && actor.model
            && actor.state.isVisible
            && actor.threeObject.visible) {
            const sz = actor.model.boundingBox.max.x - actor.model.boundingBox.min.x;
            POSITION.copy(actor.physics.position);
            POSITION.applyMatrix4(scene.sceneNode.matrixWorld);
            const distToHero = HERO_POS ? DIFF.subVectors(POSITION, HERO_POS).lengthSq() : 0;
            if (distToHero < SHADOW_MAX_DIST_SQ) {
                shadows.push({
                    data: [POSITION.x, POSITION.z, 2.8 / sz, 1],
                    distToHero
                });
            }
        }
    }
}
