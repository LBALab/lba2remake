import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';
import { BakeState } from './bake';

export async function exportAsGLB(threeObject: THREE.Object3D, params: BakeState) {
    const p = params?.startProgress('Exporting model');
    const exporter = new GLTFExporter();
    const glb = await new Promise<ArrayBuffer>((resolve) => {
        exporter.parse(threeObject, (buffer: ArrayBuffer) => {
            resolve(buffer);
        }, {
            binary: true,
            embedImages: true
        });
    });
    p?.done();
    return glb;
}
