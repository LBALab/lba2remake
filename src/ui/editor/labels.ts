import THREE from 'three';
import {each} from 'lodash';
import DebugData from './DebugData';
import { ZONE_TYPE } from '../../game/zones';

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
let currentScriptActor = null;

export function updateLabels(scene, labels) {
    if (!scene)
        return;

    if (DebugData.scriptDebugLabels) {
        updateScriptActorLabels(scene);
        currentScene = null;
        return;
    }

    currentScriptActor = null;

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

function updateScriptActorLabels(scene) {
    if (!scene)
        return;

    if (currentScriptActor !== DebugData.scriptDebugLabels.actor) {
        each(scene.actors, (actor) => {
            const enabled = DebugData.scriptDebugLabels.actors.includes(actor.index)
                || DebugData.scriptDebugLabels.actor.index === actor.index;
            if (actor.model && actor.model.boundingBoxDebugMesh) {
                actor.model.boundingBoxDebugMesh.visible = enabled;
            }
            if (actor.sprite && actor.sprite.boundingBoxDebugMesh) {
                actor.sprite.boundingBoxDebugMesh.visible = enabled;
            }
            if (actor.label) {
                actor.label.visible = enabled;
                if (enabled) {
                    actor.refreshLabel();
                }
            }
        });
        each(scene.zones, (zone) => {
            const enabled = DebugData.scriptDebugLabels.zones.includes(zone.index);
            zone.threeObject.visible = enabled;
            if (enabled) {
                zone.threeObject.updateMatrix();
                zone.refreshLabel();
            }
        });
        each(scene.points, (point) => {
            const enabled = DebugData.scriptDebugLabels.points.includes(point.index);
            point.threeObject.visible = enabled;
            if (enabled) {
                point.threeObject.updateMatrix();
                point.refreshLabel();
            }
        });
        currentScriptActor = DebugData.scriptDebugLabels.actor;
    }
}

function refreshSelection(scene, selected) {
    if (selection.type !== null
        && selection.index !== -1
        && scene[`${selection.type}s`]
        && scene[`${selection.type}s`][selection.index]
        && scene[`${selection.type}s`][selection.index].refreshLabel) {
        scene[`${selection.type}s`][selection.index].refreshLabel(selected);
    }
}

function toggleActors(scene, enabled) {
    if (scene) {
        each(scene.actors, (actor) => {
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
        });
    }
}

function toggleZones(scene, gEnabled, zoneTypes) {
    if (scene) {
        each(scene.zones, (zone) => {
            const enabled = gEnabled && zoneTypes.includes(ZONE_TYPE[zone.props.type]);
            zone.threeObject.visible = enabled;
            if (enabled) {
                zone.threeObject.updateMatrix();
                const selected = selection.type === 'zone'
                    && selection.index === zone.index;
                zone.refreshLabel(selected);
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
                const selected = selection.type === 'point'
                    && selection.index === point.index;
                point.refreshLabel(selected);
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
        sprite.scale.set(0.4, 0.1, 1);
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

export function createZoneLabel(zone, name, is3DCam) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const icon = new Image(32, 32);
    icon.src = `editor/icons/zones/${zone.zoneType}.svg`;
    const texture = new THREE.CanvasTexture(canvas);
    const draw = (selected = false) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = '16px LBA';
        ctx.textAlign = 'center';
        const textWidth = Math.min(ctx.measureText(name).width, 256 - 64);
        ctx.fillStyle = selected ? 'white' : 'black';
        ctx.fillRect(128 - (textWidth * 0.5) - 18, 16, textWidth + 38, 32);
        ctx.lineWidth = 2;
        ctx.strokeStyle = `#${zone.color.getHexString()}`;
        ctx.strokeRect(128 - (textWidth * 0.5) - 18, 16, textWidth + 38, 32);
        ctx.drawImage(icon, 128 - (textWidth * 0.5) - 16, 16, 32, 32);
        ctx.fillStyle = selected ? 'black' : 'white';
        ctx.fillText(name, 128 + 18, 38, 256 - 64);
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
        sprite.scale.set(0.3, 0.075, 1);
    } else {
        sprite.scale.set(200, 50, 1);
    }
    sprite.renderOrder = 2;
    sprite.name = `label:${name}`;
    if (zone.threeObject) {
        zone.threeObject.add(sprite);
    }
    zone.refreshLabel = draw;
}
