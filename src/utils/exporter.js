import { ColladaExporter } from 'three/examples/jsm/exporters/ColladaExporter';

const exporter = new ColladaExporter();

export function exportNode(node, name) {
    exporter.parse(node, (dae) => {
        console.log(dae);
        const request = new XMLHttpRequest();
        request.open('POST', `upload/${name}.dae`, true);
        request.onload = () => {
            // eslint-disable-next-line no-console
            console.log(`Uploaded ${name}.dae`);
        };

        request.setRequestHeader('Content-Type', 'application/octet-stream');
        request.send(dae.data);

        dae.textures.forEach((tex) => {
            const req = new XMLHttpRequest();
            req.open('POST', `upload/${tex.name}.${tex.ext}`, true);
            req.onload = () => {
                // eslint-disable-next-line no-console
                console.log(`Uploaded ${tex.name}.${tex.ext}`);
            };

            req.setRequestHeader('Content-Type', 'application/octet-stream');
            req.send(tex.data);
        });
    });
}
