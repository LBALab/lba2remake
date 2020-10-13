import * as THREE from 'three';

export function createRuntimeFlags() {
    return {
        waitHitFrame: false,
        isHitting: false,
        hasAnimEnded: false,
        hasNewFrame: false,
        wasDrawn: false,
        isDead: false,
        isSpriteMoving: false,
        hasRotationByAnim: false,
        isFalling: false,
        isSuperHitting: false,
        hasFrameShield: false,
        canDrawShadow: false,
        hasGravityByAnim: false,
        isSkating: false,
        canThrowProjectile: false,
        canLeftJump: false,
        canRightJump: false,
        waitSuperHit: false,
        hasRotationByTrack: false,
        canFlyJetPack: false,
        unknown20: false,
        hasManualFrame: false,
        waitPosition: false,
        forceFalling: false,
        // not from original from this point
        isJumping: false,
        isWalking: false,
        isTurning: false,
        isFighting: false,
        repeatHit: 0,
        isSwitchingHit: false,
        isCrouching: false,
        isClimbing: false,
        isColliding: false,
        isDrowning: false,
        isDrowningLava: false,
        isDrowningStars: false,
        isTouchingGround: false,
        isTouchingFloor: false,
        isUsingProtoOrJetpack: false,
        isSearching: false,
    };
}

export function getHtmlColor(palette, index) {
    return `#${new THREE.Color(
        palette[index * 3] / 255,
        palette[(index * 3) + 1] / 255,
        palette[(index * 3) + 2] / 255
    ).getHexString()}`;
}
