import * as THREE from 'three';
import {each} from 'lodash';

let currentScene = null;
const currentLabels = {
    actor: null,
    zone: null,
    point: null
};

export function updateLabels(scene, labels) {
    if (!scene)
        return;

    if (currentScene !== scene) {
        if (labels.actor) {
            toggleActors(currentScene, false);
        }
        if (labels.zone) {
            toggleZones(currentScene, false);
        }
        if (labels.point) {
            togglePoints(currentScene, false);
        }
        toggleActors(scene, labels.actor);
        toggleZones(scene, labels.zone);
        togglePoints(scene, labels.point);
    } else if (labels.actor !== currentLabels.actor) {
        toggleActors(scene, labels.actor);
        currentLabels.actor = labels.actor;
    } else if (labels.zone !== currentLabels.zone) {
        toggleZones(scene, labels.zone);
        currentLabels.zone = labels.zone;
    } else if (labels.point !== currentLabels.point) {
        togglePoints(scene, labels.point);
        currentLabels.point = labels.point;
    }
    currentScene = scene;
}

function toggleActors(scene, enabled) {
    if (scene) {
        each(scene.actors, (actor) => {
            if (actor.model && actor.model.boundingBoxDebugMesh) {
                actor.model.boundingBoxDebugMesh.visible = enabled;
            }
            if (actor.label) {
                actor.label.visible = enabled;
            }
        });
    }
}

function toggleZones(scene, enabled) {
    if (scene) {
        each(scene.zones, (zone) => {
            zone.threeObject.visible = enabled;
            if (enabled) {
                zone.threeObject.updateMatrix();
            }
        });
    }
}

function togglePoints(scene, enabled) {
    if (scene) {
        each(scene.points, (point) => {
            point.threeObject.visible = enabled;
            if (enabled) {
                point.threeObject.updateMatrix();
            }
        });
    }
}

export function createActorLabel(actor, name, is3DCam) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const icon = new Image(32, 32);
    icon.src = 'editor/icons/actor.svg';
    const texture = new THREE.CanvasTexture(canvas);
    icon.onload = () => {
        ctx.font = '22px LBA';
        ctx.textAlign = 'center';
        const textWidth = Math.min(ctx.measureText(name).width, 256 - 64);
        ctx.drawImage(icon, 128 - (textWidth * 0.5) - 16, 16, 32, 32);
        ctx.fillStyle = 'white';
        ctx.shadowColor = 'black';
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.fillText(name, 128 + 16, 42, 256 - 64);
        texture.needsUpdate = true;
    };
    const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        color: 0xffffff,
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
    }
}

export function createZoneLabel(zone, name, is3DCam) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const icon = new Image(32, 32);
    icon.src = `editor/icons/zones/${zone.zoneType}.svg`;
    const texture = new THREE.CanvasTexture(canvas);
    icon.onload = () => {
        ctx.font = '16px LBA';
        ctx.textAlign = 'center';
        const textWidth = Math.min(ctx.measureText(name).width, 256 - 64);
        ctx.fillStyle = 'black';
        ctx.fillRect(128 - (textWidth * 0.5) - 18, 16, textWidth + 38, 32);
        ctx.lineWidth = 2;
        ctx.strokeStyle = `#${zone.color.getHexString()}`;
        ctx.strokeRect(128 - (textWidth * 0.5) - 18, 16, textWidth + 38, 32);
        ctx.drawImage(icon, 128 - (textWidth * 0.5) - 16, 16, 32, 32);
        ctx.fillStyle = 'white';
        ctx.fillText(name, 128 + 18, 38, 256 - 64);
        texture.needsUpdate = true;
    };
    const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        color: 0xffffff,
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
    sprite.renderOrder = 2;
    sprite.name = `label:${name}`;
    if (zone.threeObject) {
        zone.threeObject.add(sprite);
    }
}

export function createPointLabel(point, name, is3DCam) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const icon = new Image(32, 32);
    icon.src = 'editor/icons/point.svg';
    const texture = new THREE.CanvasTexture(canvas);
    icon.onload = () => {
        ctx.font = '16px LBA';
        ctx.textAlign = 'center';
        const textWidth = Math.min(ctx.measureText(name).width, 256 - 64);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(128 - (textWidth * 0.5) - 20, 16, textWidth + 42, 32);
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#1a78c0';
        ctx.strokeRect(128 - (textWidth * 0.5) - 20, 16, textWidth + 42, 32);
        ctx.drawImage(icon, 128 - (textWidth * 0.5) - 16, 16, 32, 32);
        ctx.fillStyle = 'white';
        ctx.fillText(name, 128 + 18, 38, 256 - 64);
        texture.needsUpdate = true;
    };
    const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        color: 0xffffff,
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
    sprite.renderOrder = 2;
    sprite.name = `label:${name}`;
    if (point.threeObject) {
        point.threeObject.add(sprite);
    }
}
