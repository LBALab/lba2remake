import { getVrFirstPersonCamera } from '../../cameras/vr/vrFirstPerson';
import { getVR3DCamera } from '../../cameras/vr/vr3d';
import { get3DCamera } from '../../cameras/3d';
import { getVRIsoCamera } from '../../cameras/vr/vrIso';
import { getIso3DCamera } from '../../cameras/iso3d';
import { getIsometricCamera } from '../../cameras/iso';
import Renderer from '../../renderer';
import { getParams } from '../../params';
import Game from '../Game';

export function selectCamera(game: Game, renderer: Renderer, isIsland: boolean) {
    const params = getParams();
    if (renderer.vr && game.controlsState.firstPerson) {
        return getVrFirstPersonCamera(renderer);
    }
    if (isIsland && params.game !== 'lba1') {
        if (renderer.vr) {
            return getVR3DCamera(renderer);
        }
        return get3DCamera();
    }

    // isometric scene
    if (renderer.vr) {
        return getVRIsoCamera(renderer);
    }
    if (params.isoCam3d) {
        return get3DCamera();
    }
    if (params.iso3d) {
        return getIso3DCamera();
    }
    return getIsometricCamera();
}
