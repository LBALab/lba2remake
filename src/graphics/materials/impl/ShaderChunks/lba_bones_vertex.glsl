#ifdef USE_LBA_BONES
    int idx = int(boneIndex);
    vec3 bPos = bonePos[idx];
    vec4 bRot = boneRot[idx];
    transformed = transformed + 2.0 * cross(bRot.xyz, cross(bRot.xyz, transformed) + bRot.w * transformed) + bPos;
    objectNormal = objectNormal + 2.0 * cross(bRot.xyz, cross(bRot.xyz, objectNormal) + bRot.w * objectNormal);
#endif
