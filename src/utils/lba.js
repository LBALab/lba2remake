
export function getRotation(nextValue, currentValue, interpolation) {
    let angleDif = nextValue - currentValue;
    let computedAngle = 0;

    if (angleDif) {
	    if (angleDif < -0x800) {
		    angleDif += 0x1000;
		}
	    else if (angleDif > 0x800) {
		    angleDif -= 0x1000;
		}
        computedAngle = currentValue + (angleDif * interpolation)
    } else {
        computedAngle = currentValue;
    }

    computedAngle = computedAngle * 360 / 0x1000;

    return computedAngle;
}

export function getStep(nextValue, currentValue, interpolation) {
    const stepDif = nextValue - currentValue;
    let computedStep = 0;
    if (stepDif) {
        computedStep = currentValue + (stepDif * interpolation)
    } else {
        computedStep = currentValue;
    }
    return computedStep;
}

export function setStaticFlag(flags, value, isActive) {
    let f = flags;
    f |= value;
    if (!isActive) {
        f &= ~value;
    }
    return f;
}

export function distance2D(from,to) {
    const dx = from.x - to.x, dz = from.z - to.z;
    const distsquared = dx * dx + dz * dz;
    return Math.sqrt(distsquared);
}

export function angleTo(v1, v2) {
    const xdiff = v2.x - v1.x;
    const ydiff = v2.z - v1.z;

    let rads = Math.atan2(ydiff, xdiff);

    if (ydiff < 0) {
        rads -= 2 * Math.PI;
    }

    return rads;
}