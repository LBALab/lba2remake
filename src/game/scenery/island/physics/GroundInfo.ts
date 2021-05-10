export default class GroundInfo {
    sound: number;
    collision: boolean;
    liquid: number;
    height: number;
    points: THREE.Vector3[];

    setDefault() {
        this.height = 0;
        this.sound = null;
        this.collision = false;
        this.liquid = 0;
        this.points = [];
    }

    setFromObject(obj) {
        this.setDefault();
        this.height = obj.boundingBox.max.y;
        this.sound = obj.soundType;
    }

    setFromTriangleOld(tri) {
        this.height = tri.height;
        this.sound = tri.sound;
        this.collision = tri.collision;
        this.liquid = tri.liquid;
        this.points = tri.points;
    }
}
