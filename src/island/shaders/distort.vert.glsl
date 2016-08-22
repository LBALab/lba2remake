uniform float uDistortionCoefficients[12];
uniform float uDistortionMaxFovSquared;
uniform vec2 uDistortionFovOffset;
uniform vec2 uDistortionFovScale;

float getDistortionFactor(float rSquared) {
    float ret = 0.0;
    rSquared = min(uDistortionMaxFovSquared, rSquared);
    ret = rSquared * (ret + uDistortionCoefficients[11]);
    ret = rSquared * (ret + uDistortionCoefficients[10]);
    ret = rSquared * (ret + uDistortionCoefficients[9]);
    ret = rSquared * (ret + uDistortionCoefficients[8]);
    ret = rSquared * (ret + uDistortionCoefficients[7]);
    ret = rSquared * (ret + uDistortionCoefficients[6]);
    ret = rSquared * (ret + uDistortionCoefficients[5]);
    ret = rSquared * (ret + uDistortionCoefficients[4]);
    ret = rSquared * (ret + uDistortionCoefficients[3]);
    ret = rSquared * (ret + uDistortionCoefficients[2]);
    ret = rSquared * (ret + uDistortionCoefficients[1]);
    ret = rSquared * (ret + uDistortionCoefficients[0]);
    return ret + 1.0;
}

vec4 distort(vec4 point) {
    vec3 pointNdc = point.xyz / point.w;
    vec2 pointUnitSquare = (pointNdc.xy + vec2(1.0)) / 2.0;
    vec2 pointTanAngle = pointUnitSquare * uDistortionFovScale - uDistortionFovOffset;
    float radiusSquared = dot(pointTanAngle, pointTanAngle);
    float distortionFactor = getDistortionFactor(radiusSquared);
    vec2 distortedPointTanAngle = pointTanAngle * distortionFactor;
    vec2 distortedPointUnitSquare = (distortedPointTanAngle + uDistortionFovOffset) / uDistortionFovScale;
    vec3 distortedPointNdc = vec3(distortedPointUnitSquare * 2.0 - vec2(1.0), pointNdc.z);
    return vec4(distortedPointNdc, 1.0) * point.w;
}
