import * as THREE from 'three';
import DebugData from './DebugData';
import { ZONE_TYPE } from '../../game/Zone';
import Scene from '../../game/Scene';
import Actor from '../../game/Actor';

let currentScene = null;
const selection = {
    type: null,
    index: -1
};
const currentLabels = {
    actor: null,
    zone: null,
    point: null,
    zoneTypes: []
};

export function updateLabels(scene: Scene, labels) {
    if (!scene)
        return;

    if (currentScene !== scene) {
        if (labels.actor) {
            toggleActors(currentScene, false);
        }
        if (labels.zone) {
            toggleZones(currentScene, false, labels.zoneTypes || []);
        }
        if (labels.point) {
            togglePoints(currentScene, false);
        }
        toggleActors(scene, labels.actor);
        toggleZones(scene, labels.zone, labels.zoneTypes || []);
        togglePoints(scene, labels.point);
    } else if (labels.actor !== currentLabels.actor) {
        toggleActors(scene, labels.actor);
        currentLabels.actor = labels.actor;
    } else if (labels.zone !== currentLabels.zone
                || labels.zoneTypes !== currentLabels.zoneTypes) {
        toggleZones(scene, labels.zone, labels.zoneTypes || []);
        currentLabels.zone = labels.zone;
        currentLabels.zoneTypes = labels.zoneTypes;
    } else if (labels.point !== currentLabels.point) {
        togglePoints(scene, labels.point);
        currentLabels.point = labels.point;
    }
    const newSelection = DebugData.selection;
    if (newSelection
            && (newSelection.type !== selection.type
                || newSelection.index !== selection.index)) {
        refreshSelection(scene, false);
        selection.type = newSelection.type;
        selection.index = newSelection.index;
        refreshSelection(scene, true);
    } else if (!newSelection) {
        refreshSelection(scene, false);
        selection.type = null;
        selection.index = -1;
    }

    currentScene = scene;
}

function refreshSelection(scene: Scene, selected) {
    if (selection.type !== null
        && selection.index !== -1
        && scene[`${selection.type}s`]
        && scene[`${selection.type}s`][selection.index]
        && scene[`${selection.type}s`][selection.index].refreshLabel) {
        scene[`${selection.type}s`][selection.index].refreshLabel(selected);
    }
}

function toggleActors(scene: Scene, enabled) {
    if (scene) {
        for (const actor of scene.actors) {
            if (actor.model && actor.model.boundingBoxDebugMesh) {
                actor.model.boundingBoxDebugMesh.visible = enabled;
            }
            if (actor.sprite && actor.sprite.boundingBoxDebugMesh) {
                actor.sprite.boundingBoxDebugMesh.visible = enabled;
            }
            if (actor.label) {
                actor.label.visible = enabled;
                if (enabled) {
                    const selected = selection.type === 'actor'
                        && selection.index === actor.index;
                    actor.refreshLabel(selected);
                }
            }
        }
    }
}

function toggleZones(scene: Scene, gEnabled, zoneTypes) {
    if (scene) {
        for (const zone of scene.zones) {
            const enabled = gEnabled && zoneTypes.includes(ZONE_TYPE[zone.props.type]);
            zone.threeObject.visible = enabled;
            if (enabled) {
                zone.threeObject.updateMatrix();
                const selected = selection.type === 'zone'
                    && selection.index === zone.props.index;
                zone.updateLabel(selected);
            }
        }
    }
}

function togglePoints(scene: Scene, enabled) {
    if (scene) {
        for (const point of scene.points) {
            point.threeObject.visible = enabled;
            if (enabled) {
                point.threeObject.updateMatrix();
                const selected = selection.type === 'point'
                    && selection.index === point.props.index;
                point.updateLabel(selected);
            }
        }
    }
}

export function createActorLabel(actor: Actor, name, is3DCam) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const icon = new Image(32, 32);
    icon.src = 'editor/icons/actor.svg';
    const texture = new THREE.CanvasTexture(canvas);
    texture.encoding = THREE.GammaEncoding;
    texture.anisotropy = 16;

    const draw = (selected = false) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = '22px LBA';
        ctx.textAlign = 'center';
        const textWidth = Math.min(ctx.measureText(name).width, 256 - 64);
        if (selected) {
            ctx.shadowColor = 'black';
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            ctx.fillStyle = 'white';
            ctx.fillRect(128 - (textWidth * 0.5) - 18, 16, textWidth + 38, 32);
            ctx.fillStyle = 'black';
            ctx.shadowColor = 'transparent';
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
        } else {
            ctx.fillStyle = 'white';
            ctx.shadowColor = 'black';
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
        }
        ctx.drawImage(icon, 128 - (textWidth * 0.5) - 16, 16, 32, 32);
        ctx.fillText(name, 128 + 16, 42, 256 - 64);
        texture.needsUpdate = true;
    };

    icon.onload = () => draw();
    const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        depthTest: false
    });
    // @ts-ignore
    spriteMaterial.sizeAttenuation = false;
    const sprite = new THREE.Sprite(spriteMaterial);
    if (is3DCam) {
        sprite.scale.set(0.2, 0.05, 1);
    } else {
        sprite.scale.set(200, 50, 1);
    }
    if (actor.model && actor.model.boundingBox) {
        const height = actor.model.boundingBox.max.y - actor.model.boundingBox.min.y;
        sprite.position.set(0, height + 0.15, 0);
    }
    sprite.renderOrder = 2;
    sprite.name = `label:${name}`;
    sprite.visible = false;
    if (actor.threeObject) {
        actor.threeObject.add(sprite);
        actor.label = sprite;
        actor.refreshLabel = draw;
    }
}
