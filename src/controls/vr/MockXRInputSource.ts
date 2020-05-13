export default class MockXRInputSource {
    gamepad: any;
    handedness: any;
    profiles: any;

    constructor(profiles, gamepad: object, handedness: string) {
      this.gamepad = gamepad;

      if (!handedness) {
        throw new Error('No handedness supplied');
      }

      this.handedness = handedness;
      this.profiles = Object.freeze(profiles);
    }
}
