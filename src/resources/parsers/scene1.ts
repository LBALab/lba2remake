import { ActorDirMode } from '../../game/Actor';
import  {WORLD_SCALE, getHtmlColor, SPEED_ADJUSTMENT } from '../../utils/lba';
import { Resource } from '../load';
import { getPalette, getText, getSceneMap } from '..';
import { initHeroFlags, parseStaticFlags } from './scene2';
import { LBA1_ISLAND } from '../../game/scenery/island/data/sceneMapping';

// LBA1 does not have a scene map, so lets fake one
export const parseSceneMapLBA1 = () => {
    const map = [];
    for (let i = 0; i < 120; i += 1) {
        map.push({
            isIsland: LBA1_ISLAND.includes(i) ? true : false,
            sceneryIndex: i,
            libraryIndex: i
        });
    }
    return map;
};

export const parseSceneLBA1 = async (resource: Resource, index) => {
    const sceneMap = await getSceneMap();
    const buffer = resource.getEntry(index);

    const data = new DataView(buffer);
    const textBankId = data.getInt8(0);

    const sceneData = {
        index,
        textBankId,
        textIndex: (textBankId * 2) + 6,
        gameOverScene: data.getInt8(1),
        unknown1: data.getUint16(2, true),
        unknown2: data.getUint16(4, true),
        isOutsideScene: false,
        buffer,
        actors: [],
        palette: null,
        texts: null,
        ...sceneMap[index]
    };

    const [palette, texts] = await Promise.all([
        getPalette(),
        getText(sceneData.textIndex),
    ]);
    sceneData.palette = palette;
    sceneData.texts = texts;

    let offset = 6;
    offset = loadAmbience(sceneData, offset);
    offset = loadHero(sceneData, offset);
    offset = loadActors(sceneData, offset);
    offset = loadZones(sceneData, offset);
    loadPoints(sceneData, offset);

    return sceneData;
};

function loadAmbience(scene, offset) {
    const data = new DataView(scene.buffer, offset, offset + 49);
    let innerOffset = 0;

    scene.ambience = {
        lightingAlpha: data.getInt16(innerOffset, true),
        lightingBeta: data.getInt16(innerOffset + 2, true),
        samples: [],
        sampleMinDelay: data.getInt16(innerOffset + 28, true),
        sampleMinDelayRnd: data.getInt16(innerOffset + 30, true),
        sampleElapsedTime: 0,
        musicIndex: data.getInt8(innerOffset + 32),
    };

    innerOffset = 4;
    for (let i = 0; i < 4; i += 1) {
        scene.ambience.samples.push({
            ambience: data.getInt16(innerOffset, true),
            repeat: data.getInt16(innerOffset + 2, true),
            round: data.getInt16(innerOffset + 4, true),
            frequency: 0x1000,
            volume: 1,
        });
        innerOffset += 6;
    }

    return offset + 33;
}

function loadHero(scene, offset) {
    const data = new DataView(scene.buffer);
    const hero = {
        sceneIndex: scene.index,
        entityIndex: 0,
        bodyIndex: 0,
        pos: [
            ((0x8000 - data.getInt16(offset + 4, true)) + 256) * WORLD_SCALE,
            data.getInt16(offset + 2, true) * WORLD_SCALE,
            (data.getInt16(offset, true) + 256) * WORLD_SCALE
        ],
        index: 0,
        textColor: getHtmlColor(scene.palette, (12 * 16) + 12),
        angle: 0,
        speed: 30 * SPEED_ADJUSTMENT,
        dirMode: ActorDirMode.MANUAL,
        flags: initHeroFlags(),
        moveScriptSize: 0,
        moveScript: null,
        lifeScriptSize: 0,
        lifeScript: null
    };
    offset += 6;

    hero.moveScriptSize = data.getInt16(offset, true);
    offset += 2;
    if (hero.moveScriptSize > 0) {
        hero.moveScript = new DataView(scene.buffer, offset, hero.moveScriptSize);
    }
    offset += hero.moveScriptSize;

    hero.lifeScriptSize = data.getInt16(offset, true);
    offset += 2;
    if (hero.lifeScriptSize > 0) {
        hero.lifeScript = new DataView(scene.buffer, offset, hero.lifeScriptSize);
    }
    offset += hero.lifeScriptSize;

    scene.actors.push(hero);

    return offset;
}

function loadActors(scene, offset) {
    const data = new DataView(scene.buffer);

    const numActors = data.getInt16(offset, true);
    offset += 2;

    for (let i = 1; i < numActors; i += 1) {
        const actor = {
            sceneIndex: scene.index,
            index: i,
            dirMode: ActorDirMode.NO_MOVE,
            flags: null,
            entityIndex: -1,
            bodyIndex: -1,
            animIndex: -1,
            spriteIndex: -1,
            pos: null,
            hitStrength: 0,
            extraType: -1,
            angle: 0,
            speed: 0,
            info0: -1,
            info1: -1,
            info2: -1,
            info3: -1,
            followActor: -1,
            extraAmount: -1,
            textColor: null,
            spriteAnim3DNumber: -1,
            spriteSizeHit: -1,
            armour: -1,
            life: -1,
            moveScriptSize: 0,
            moveScript: null,
            lifeScriptSize: 0,
            lifeScript: null
        };

        const staticFlags = data.getUint16(offset, true);
        actor.flags = parseStaticFlags(staticFlags);
        offset += 2;

        actor.entityIndex = data.getInt16(offset, true);
        offset += 2;
        actor.bodyIndex = data.getUint8(offset);
        offset += 1;
        actor.animIndex = data.getInt8(offset);
        offset += 1;
        actor.spriteIndex = data.getInt16(offset, true);
        offset += 2;

        actor.pos = [
            ((0x8000 - data.getInt16(offset + 4, true)) + 256) * WORLD_SCALE,
            data.getInt16(offset + 2, true) * WORLD_SCALE,
            (data.getInt16(offset, true) + 256) * WORLD_SCALE
        ];
        offset += 6;

        actor.hitStrength = data.getInt8(offset);
        offset += 1;
        actor.extraType = data.getInt16(offset, true);
        actor.extraType &= ~1;
        offset += 2;
        actor.angle = data.getInt16(offset, true);
        offset += 2;
        actor.speed = data.getInt16(offset, true) * SPEED_ADJUSTMENT;
        offset += 2;
        actor.dirMode = data.getInt16(offset, true);
        offset += 2;

        actor.info0 = data.getInt16(offset, true);
        offset += 2;
        actor.info1 = data.getInt16(offset, true);
        offset += 2;
        actor.info2 = data.getInt16(offset, true);
        offset += 2;
        actor.info3 = data.getInt16(offset, true);
        actor.followActor = actor.info3;
        offset += 2;

        actor.extraAmount = data.getInt8(offset);
        offset += 1;
        const textColor = data.getInt8(offset);
        offset += 1;
        actor.textColor = getHtmlColor(scene.palette, (textColor * 16) + 12);
        actor.armour = data.getUint8(offset);
        offset += 1;
        actor.life = data.getUint8(offset);
        offset += 1;

        actor.moveScriptSize = data.getInt16(offset, true);
        offset += 2;
        if (actor.moveScriptSize > 0) {
            actor.moveScript = new DataView(scene.buffer, offset, actor.moveScriptSize);
        }
        offset += actor.moveScriptSize;

        actor.lifeScriptSize = data.getInt16(offset, true);
        offset += 2;
        if (actor.lifeScriptSize > 0) {
            actor.lifeScript = new DataView(scene.buffer, offset, actor.lifeScriptSize);
        }
        offset += actor.lifeScriptSize;

        scene.actors.push(actor);
    }

    return offset;
}

function loadZones(scene, offset) {
    const data = new DataView(scene.buffer);
    scene.zones = [];

    const numZones = data.getInt16(offset, true);
    offset += 2;

    for (let i = 0; i < numZones; i += 1) {
        const zone = {
            sceneIndex: scene.index,
            index: i,
            type: 0,
            box: {xMin: 0, xMax: 0, yMin: 0, yMax: 0, zMin: 0, zMax: 0},
            info0: -1,
            info1: -1,
            info2: -1,
            info3: -1,
            info4: -1,
            info5: -1,
            info6: -1,
            info7: -1,
            snap: -1,
            pos: null
        };

        // xMin and xMax are inverted because x axis is inverted
        zone.box.xMax = ((0x8000 - data.getInt16(offset + 4, true)) + 256) * WORLD_SCALE;
        zone.box.yMin = data.getInt16(offset + 2, true) * WORLD_SCALE;
        zone.box.zMin = (data.getInt16(offset, true) + 256) * WORLD_SCALE;
        zone.box.xMin = ((0x8000 - data.getInt16(offset + 10, true)) + 256) * WORLD_SCALE;
        zone.box.yMax = data.getInt16(offset + 8, true) * WORLD_SCALE;
        zone.box.zMax = (data.getInt16(offset + 6, true) + 256) * WORLD_SCALE;
        offset += 12;

        zone.type = data.getInt16(offset, true);
        zone.snap = data.getInt16(offset + 2, true);
        zone.info0 = data.getInt16(offset + 4, true);
        zone.info1 = data.getInt16(offset + 6, true);
        zone.info2 = data.getInt16(offset + 8, true);
        zone.info3 = data.getInt16(offset + 10, true);
        offset += 12;

        // normalising position
        zone.pos = [
            zone.box.xMin + ((zone.box.xMax - zone.box.xMin) / 2),
            zone.box.yMin + ((zone.box.yMax - zone.box.yMin) / 2),
            zone.box.zMin + ((zone.box.zMax - zone.box.zMin) / 2)
        ];

        scene.zones.push(zone);
    }

    return offset;
}

function loadPoints(scene, offset) {
    const data = new DataView(scene.buffer);
    scene.points = [];

    const numPoints = data.getInt16(offset, true);
    offset += 2;

    for (let i = 0; i < numPoints; i += 1) {
        const point = {
            sceneIndex: scene.index,
            index: i,
            pos: [
                ((0x8000 - data.getInt16(offset + 4, true)) + 512) * WORLD_SCALE,
                data.getInt16(offset + 2, true) * WORLD_SCALE,
                data.getInt16(offset, true) * WORLD_SCALE
            ]
        };
        offset += 6;
        scene.points.push(point);
    }

    return offset;
}
