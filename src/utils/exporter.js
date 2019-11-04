import { ColladaExporter } from 'three/examples/jsm/exporters/ColladaExporter';

const exporter = new ColladaExporter();

export function exportNode(node, name) {
    exporter.parse(node, (dae) => {
        const request = new XMLHttpRequest();
        request.open('POST', `upload/${name}.dae`, true);
        request.onload = () => {
            // eslint-disable-next-line no-console
            console.log(`Uploaded ${name}.dae`);
        };

        request.setRequestHeader('Content-Type', 'application/octet-stream');
        request.send(dae.data);
    });
}
