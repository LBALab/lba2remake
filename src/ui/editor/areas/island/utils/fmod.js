export default function fmod(a, b) {
    return Number((a - (Math.floor(a / b) * b)).toPrecision(8));
}
