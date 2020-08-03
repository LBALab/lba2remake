float getFloorOpacity() {
    return 1.0 - clamp(length(vPos - heroPos) - 0.38, 0.0, 1.0);
}
