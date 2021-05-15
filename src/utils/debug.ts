import * as THREE from 'three';

export const makePure = (fct) => {
    fct.__pure_function = true;
};

export function createGizmo() {
    const axesHelper = new THREE.AxesHelper(1.2);
    axesHelper.name = 'Axes';
    const geometry = new THREE.SphereGeometry(0.1, 32, 32);
    const material = new THREE.MeshBasicMaterial({color: 0xffff00});
    const sphere = new THREE.Mesh(geometry, material);
    sphere.name = 'Sphere';
    const gizmo = new THREE.Object3D();
    gizmo.name = 'DebugGizmo';
    gizmo.add(sphere);
    gizmo.add(axesHelper);
    return gizmo;
}

/**
 * This formats a Vector3 to be more readable.
 */
export function fvec(vec: THREE.Vector3) {
    return `(${vec.x.toFixed(3)}, ${vec.y.toFixed(3)}, ${vec.z.toFixed(3)})`;
}

/**
 * This formats a Vector3 as a Vector2 (using x and z coordinates)
 * to help inspects ground positions.
 */
export function fvecXZ(vec: THREE.Vector3) {
    return `(${vec.x.toFixed(3)}, ${vec.z.toFixed(3)})`;
}

/**
 * This formats an actor's state (mostly the movement related flags).
 */
export function fstate(obj) {
    const {
        isVisible,
        isDead,
        isFalling,
        isSliding,
        isStuck,
        isJumping,
        isWalking,
        isCarried,
        isCarriedBy,
        isCrouching,
        isClimbing,
        isColliding,
        isDrowning,
        isDrowningLava,
        isDrowningStars,
        isTouchingGround,
        isTouchingFloor,
        isUsingProtoOrJetpack,
        isToppingOutUp,
        distFromGround,
        // distFromFloor,
        fallDistance,
        hasCollidedWithActor,
    } = obj.state;
    const states = [];
    !isVisible && states.push('hidden');
    isDead && states.push('dead');
    (isDrowning || isDrowningLava || isDrowningStars) && states.push('drown');
    isWalking && states.push('walk');
    if (isTouchingGround || isTouchingFloor) {
        const subStates = [];
        isTouchingGround && subStates.push('ground');
        isTouchingFloor && subStates.push('floor');
        states.push(`touch(${subStates.join(',')})`);
    }
    if (!isTouchingGround) {
        states.push(`dist-ground(${distFromGround.toFixed(3)})`);
    }
    isCarried && states.push(`carried=${isCarriedBy}`);
    isJumping && states.push('jump');
    isUsingProtoOrJetpack && states.push('ppack');
    isCrouching && states.push('crouch');
    isClimbing && states.push('climb');
    isToppingOutUp && states.push('topping');
    isFalling && states.push(`fall(${fallDistance.toFixed(3)})`);
    isColliding && states.push('coll');
    (hasCollidedWithActor !== -1) && states.push(`coll-actor(${hasCollidedWithActor})`);
    isSliding && states.push('slide');
    isStuck && states.push('stuck');
    return states.join(',');
}
