interface Action {
    type: number;
    animFrame: number;
    sampleIndex: number;
    frequency: number;
    unk1: number;
    unk2: number;
    unk3: number;
    unk4: number;
    unk5: number;
    strength: number;
    distanceX: number;
    distanceY: number;
    distanceZ: number;
    yHeight: number;
    spriteIndex: number;
    repeat: number;
    targetActor: number;
}

interface Anim {
    index: number;
    animIndex: number;
    actions: Action[];
    offset: number;
}

interface Box {
    xMin: number;
    yMin: number;
    zMin: number;
    xMax: number;
    yMax: number;
    zMax: number;
}

export interface Body {
    bodyIndex: number;
    index: number;
    offset: number;
    hasCollisionBox: boolean;
    box: Box;
}

export interface Entity {
    anims: Anim[];
    bodies: Body[];
}

export function getBodyIndex(entity: Entity, index: number) {
    if (!entity) {
        return 0;
    }
    for (let i = 0; i < entity.bodies.length; i += 1) {
        if (entity.bodies[i].index === index) {
            return entity.bodies[i].bodyIndex;
        }
    }
    return 0;
}

export function getAnimIndex(entity: Entity, index: number) {
    if (!entity) {
        return 0;
    }
    for (let i = 0; i < entity.anims.length; i += 1) {
        if (entity.anims[i].index === index) {
            return entity.anims[i].animIndex;
        }
    }
    return 0;
}

export function getAnim(entity: Entity, index: number) {
    if (!entity) {
        return null;
    }
    for (let i = 0; i < entity.anims.length; i += 1) {
        if (entity.anims[i].index === index) {
            return entity.anims[i];
        }
    }
    return null;
}
