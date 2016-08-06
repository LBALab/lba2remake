import THREE from 'three';
import DesktopInputHandler from '../input/DesktopInputHandler';

export default class FirstPersonControls {
    constructor(camera, container) {
        this._camera = camera;
        this._front = -Math.PI / 2;
        this._movement = [0, 0];
        this._orientation = {
            x: 0.0,
            y: 0.0
        };
        this._dirty = true;
        this._handler = new DesktopInputHandler(this, container);
    }

    setFront(angle) {
        this._front = angle;
    }
    
    update(dt, getHeight) {
        if (this._movement[0] != 0 || this._movement[1] != 0 || this._dirty) {
            let dir;
            if (false /* !enabled */) {
                dir = new THREE.Vector3(this._movement[0], 0, -this._movement[1]).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.y + this.front);
            } else {
                this.y -= dt * this._movement[1] * 2.0;
                dir = new THREE.Vector3(this._movement[0], 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.y + this.front);
            }
            const pos = this._camera.position.clone();
            const d2 = dir.clone();
            d2.multiplyScalar(0.01538);
            pos.add(d2);
            const dy = Math.abs(getHeight(pos.x, pos.z) + 0.08 - pos.y);
            if (dy < 0.02) {
                dir.multiplyScalar(dt * 0.2);
                this._camera.position.add(dir);
                this._camera.position.y = getHeight(this._camera.position.x, this._camera.position.z) + 0.08;
            }
            this._camera.quaternion.setFromEuler(new THREE.Euler(this.x, this.y, 0.0, 'YXZ'));
            this._dirty = false;
        }
    }

    updateOrientation(updater) {
        updater(this._orientation);
        this._orientation.x = normalizeAngle(this._orientation.x);
        this._orientation.y = normalizeAngle(this._orientation.y);
    }

    updateMovement(updater) {
        updater(this._movement);
    }
};

function normalizeAngle(angle) {
    if (angle < 0.0) {
        return angle;
    } else {
        return angle % Math.PI;
    }
}