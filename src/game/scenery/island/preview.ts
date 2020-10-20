import * as THREE from 'three';
import { WORLD_SCALE_B } from '../../../utils/lba';

// Those are used in the VR island teleport menu for efficiently
// performing picking without intersecting with the whole heightmap mesh.
// There's probably a better implementation for this.
export function loadPickingPlanes(islandObject, layout) {
    const sectionsPlanes = new THREE.Object3D();
    const sectionsPlanesGeom = new THREE.PlaneBufferGeometry(
        64 * WORLD_SCALE_B,
        64 * WORLD_SCALE_B
    );
    const sectionsPlanesMat = new THREE.MeshBasicMaterial({color: 0xff0000});
    sectionsPlanes.name = 'sectionsPlanes';
    sectionsPlanes.visible = false;
    sectionsPlanes.renderOrder = 3;
    islandObject.add(sectionsPlanes);
    for (const section of layout.groundSections) {
        const plane = new THREE.Mesh(sectionsPlanesGeom, sectionsPlanesMat);
        plane.position.set(
            ((section.x * 64) + 33) * WORLD_SCALE_B,
            0,
            ((section.z * 64) + 32) * WORLD_SCALE_B
        );
        plane.quaternion.setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
        plane.userData = {
            x: section.x,
            y: section.y,
            info: section
        };
        sectionsPlanes.add(plane);
    }
}
