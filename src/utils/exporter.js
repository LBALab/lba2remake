import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';

const exporter = new GLTFExporter();

export function exportNode(node, name) {
    exporter.parse(node, (gltf) => {
        const request = new XMLHttpRequest();
        request.open('POST', `upload/${name}.glb`, true);
        request.onload = () => {
            // eslint-disable-next-line no-console
            console.log(`Uploaded ${name}.glb`);
        };

        request.setRequestHeader('Content-Type', 'application/octet-stream');
        request.send(gltf);
    }, {binary: true});
}
